import type { ZodType } from "zod";
import analyticsEnvelope from "./mocks/analytics.json";
import callsEnvelope from "./mocks/calls.json";
import recordingEnvelope from "./mocks/recording.json";
import sessionEnvelope from "./mocks/session.json";
import agentEnvelope from "./mocks/agent.json";
import kbEnvelope from "./mocks/kb.json";
import organizationEnvelope from "./mocks/organization.json";
import membersEnvelope from "./mocks/members.json";
import {
  AgentConfigSchema,
  AnalyticsSchema,
  CALL_STATUS_GROUP_MEMBERS,
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

// Mock JSON mirrors the api-gateway envelope ({statusCode, success, message, data}).
// Parse the inner data through the same Zod schemas the real path uses, so the
// mock fixtures stay honest if the contract changes.
function fromEnvelope<T>(envelope: unknown, schema: ZodType<T>): T {
  const data = (envelope as { data?: unknown })?.data ?? envelope;
  return schema.parse(data);
}

const allCalls: CallsListResponse = fromEnvelope(
  callsEnvelope,
  CallsListResponseSchema,
);

export function mockCallsList(query: {
  page?: number;
  limit?: number;
  outcome?: Outcome;
  statusGroup?: keyof typeof CALL_STATUS_GROUP_MEMBERS;
}): CallsListResponse {
  const page = query.page ?? 1;
  const limit = query.limit ?? allCalls.limit;
  const groupMembers = query.statusGroup
    ? new Set<string>(CALL_STATUS_GROUP_MEMBERS[query.statusGroup])
    : null;
  const filtered = allCalls.calls.filter((c) => {
    if (query.outcome && c.analysis?.outcome !== query.outcome) return false;
    if (groupMembers && (!c.status || !groupMembers.has(c.status))) return false;
    return true;
  });
  const start = (page - 1) * limit;
  return {
    calls: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export function mockCallById(id: string): XyloCall {
  const found = allCalls.calls.find((c) => c._id === id);
  if (!found) {
    return XyloCallSchema.parse(allCalls.calls[0]);
  }
  return found;
}

export const mockAnalytics: Analytics = fromEnvelope(
  analyticsEnvelope,
  AnalyticsSchema,
);

export const mockSession: SessionResponse = fromEnvelope(
  sessionEnvelope,
  SessionResponseSchema,
);

export const mockRecordingUrl: string = fromEnvelope(
  recordingEnvelope,
  RecordingResponseSchema,
).url;

export const mockAgentConfig: AgentConfig = fromEnvelope(
  agentEnvelope,
  AgentConfigSchema,
);

export const mockKnowledgeBase: KnowledgeBase = fromEnvelope(
  kbEnvelope,
  KnowledgeBaseSchema,
);

export const mockOrganization: Organization = fromEnvelope(
  organizationEnvelope,
  OrganizationSchema,
);

export const mockMembers: MembersResponse = fromEnvelope(
  membersEnvelope,
  MembersResponseSchema,
);
