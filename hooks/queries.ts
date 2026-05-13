"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchAgentConfig,
  fetchAnalytics,
  fetchCall,
  fetchCalls,
  fetchKnowledgeBase,
  fetchMembers,
  fetchOrganization,
  fetchRecordingUrl,
  fetchSession,
  type CallsQuery,
} from "@/lib/api/xylo";
import { queryKeys } from "@/lib/query/keys";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session(),
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}

export function useOrganization() {
  const session = useSession();
  const orgId = session.data?.user.organizationId ?? undefined;
  return useQuery({
    queryKey: queryKeys.organization(orgId ?? ""),
    queryFn: () => fetchOrganization(orgId as string),
    enabled: !!orgId,
    staleTime: 5 * 60_000,
  });
}

export function useMembers() {
  return useQuery({
    queryKey: queryKeys.members(),
    queryFn: fetchMembers,
    staleTime: 60_000,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: fetchAnalytics,
  });
}

export function useCalls(query: CallsQuery) {
  return useQuery({
    queryKey: queryKeys.calls(query),
    queryFn: () => fetchCalls(query),
    placeholderData: keepPreviousData,
  });
}

export function useCall(id: string | null) {
  return useQuery({
    queryKey: queryKeys.call(id ?? ""),
    queryFn: () => fetchCall(id as string),
    enabled: !!id,
  });
}

export function useRecording(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.recording(id ?? ""),
    queryFn: () => fetchRecordingUrl(id as string),
    enabled: !!id && enabled,
    retry: false,
  });
}

export function useAgentConfig() {
  return useQuery({
    queryKey: queryKeys.agent(),
    queryFn: fetchAgentConfig,
    staleTime: 60_000,
  });
}

export function useKnowledgeBase() {
  const session = useSession();
  const orgId = session.data?.user.organizationId ?? undefined;
  return useQuery({
    queryKey: queryKeys.knowledgeBase(),
    queryFn: () => fetchKnowledgeBase(orgId as string),
    enabled: !!orgId,
    staleTime: 60_000,
  });
}
