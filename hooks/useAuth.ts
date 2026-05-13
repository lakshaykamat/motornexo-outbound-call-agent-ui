"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginRequest, logout as logoutRequest } from "@/lib/api/xylo";

export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    submit: (email: string, password: string) =>
      mutation.mutate({ email, password }),
    submitting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}

export function useSignOut() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return {
    signOut: () => mutation.mutate(),
    signingOut: mutation.isPending,
  };
}
