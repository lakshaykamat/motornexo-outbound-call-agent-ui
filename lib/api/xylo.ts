import { env } from "@/lib/env";
import {
  AgentConfigSchema,
  AnalyticsSchema,
  CallsListResponseSchema,
  KnowledgeBaseSchema,
  MembersResponseSchema,
  OrganizationSchema,
  RecordingResponseSchema,
  SessionResponseSchema,
  XyloCallSchema,
  type AgentConfig,
  type Analytics,
  type CallsListResponse,
  type KnowledgeBase,
  type MembersResponse,
  type Organization,
  type Outcome,
  type SessionResponse,
  type XyloCall,
} from "./types";
import {
  mockAgentConfig,
  mockAnalytics,
  mockCallById,
  mockCallsList,
  mockKnowledgeBase,
  mockMembers,
  mockOrganization,
  mockRecordingUrl,
  mockSession,
} from "./mock-data";

export type CallStatusGroup = "queued" | "placed" | "live" | "failed";

export type CallsQuery = {
  page?: number;
  limit?: number;
  outcome?: Outcome;
  statusGroup?: CallStatusGroup;
  from?: string;
  to?: string;
};

function toSearchParams(q: CallsQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.outcome) p.set("outcome", q.outcome);
  if (q.statusGroup) p.set("statusGroup", q.statusGroup);
  if (q.from) p.set("from", q.from);
  if (q.to) p.set("to", q.to);
  return p;
}

async function gatewayFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${env.apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

// api-gateway wraps every response in { statusCode, success, message, data }.
async function unwrap(res: Response): Promise<unknown> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message ?? "";
    } catch {}
    throw new Error(detail || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json?.data ?? json;
}

export async function fetchCalls(q: CallsQuery): Promise<CallsListResponse> {
  if (env.mockData) return mockCallsList(q);
  const res = await gatewayFetch(`/xylo/calls?${toSearchParams(q).toString()}`);
  return CallsListResponseSchema.parse(await unwrap(res));
}

export async function fetchCall(id: string): Promise<XyloCall> {
  if (env.mockData) return mockCallById(id);
  const res = await gatewayFetch(`/xylo/calls/${encodeURIComponent(id)}`);
  return XyloCallSchema.parse(await unwrap(res));
}

export async function fetchRecordingUrl(id: string): Promise<string> {
  if (env.mockData) return mockRecordingUrl;
  const res = await gatewayFetch(
    `/xylo/calls/${encodeURIComponent(id)}/recording`,
  );
  const parsed = RecordingResponseSchema.parse(await unwrap(res));
  return parsed.url;
}

export async function fetchAnalytics(): Promise<Analytics> {
  if (env.mockData) return mockAnalytics;
  const res = await gatewayFetch(`/xylo/analytics`);
  return AnalyticsSchema.parse(await unwrap(res));
}

export async function fetchSession(): Promise<SessionResponse> {
  if (env.mockData) return mockSession;
  const res = await gatewayFetch(`/auth/session`);
  return SessionResponseSchema.parse(await unwrap(res));
}

export async function fetchAgentConfig(): Promise<AgentConfig> {
  if (env.mockData) return mockAgentConfig;
  const res = await gatewayFetch(`/xylo/agent`);
  return AgentConfigSchema.parse(await unwrap(res));
}

export async function fetchKnowledgeBase(orgId: string): Promise<KnowledgeBase> {
  if (env.mockData) return mockKnowledgeBase;
  const res = await gatewayFetch(
    `/organizations/${encodeURIComponent(orgId)}/xylo-kb`,
  );
  return KnowledgeBaseSchema.parse(await unwrap(res));
}

export async function fetchOrganization(orgId: string): Promise<Organization> {
  if (env.mockData) return mockOrganization;
  const res = await gatewayFetch(`/organizations/${encodeURIComponent(orgId)}`);
  return OrganizationSchema.parse(await unwrap(res));
}

export async function fetchMembers(): Promise<MembersResponse> {
  if (env.mockData) return mockMembers;
  const res = await gatewayFetch(`/auth/users`);
  const data = await unwrap(res);
  const members = Array.isArray(data) ? data : [];
  return MembersResponseSchema.parse({ members, total: members.length });
}

// Pull every call (up to a cap) and turn it into a CSV in the browser.
// The list endpoint caps `limit` at 200; for now we accept that ceiling.
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function buildCallsCsv(q: CallsQuery): Promise<Blob> {
  const all: XyloCall[] = [];
  let page = 1;
  const limit = 200;
  while (true) {
    const batch = await fetchCalls({ ...q, page, limit });
    all.push(...batch.calls);
    if (all.length >= batch.total || batch.calls.length === 0) break;
    page += 1;
    if (page > 50) break;
  }

  const headers = [
    "id",
    "started_at",
    "contact_name",
    "phone",
    "duration_sec",
    "outcome",
    "sentiment",
    "score",
    "summary",
    "objections_raised",
    "follow_up_action",
    "follow_up_date",
  ];

  const rows = all.map((c) => [
    c._id,
    c.startedAt ?? c.createdAt,
    c.prospectName ?? "",
    c.phone,
    c.durationSec ?? 0,
    c.analysis?.outcome ?? "",
    c.analysis?.sentiment ?? "",
    c.analysis?.score ?? "",
    c.analysis?.summary ?? "",
    c.analysis?.objectionsRaised?.join("; ") ?? "",
    c.analysis?.followUpAction ?? "",
    c.analysis?.followUpDate ?? "",
  ]);

  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
  return new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
}
