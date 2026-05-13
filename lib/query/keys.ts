import type { CallsQuery } from "@/lib/api/xylo";

export const queryKeys = {
  session: () => ["auth", "session"] as const,
  organization: (orgId: string) => ["org", orgId] as const,
  members: () => ["org", "members"] as const,
  analytics: () => ["xylo", "analytics"] as const,
  calls: (query: CallsQuery) => ["xylo", "calls", query] as const,
  call: (id: string) => ["xylo", "call", id] as const,
  recording: (id: string) => ["xylo", "recording", id] as const,
  agent: () => ["xylo", "agent"] as const,
  knowledgeBase: () => ["xylo", "knowledge-base"] as const,
} as const;
