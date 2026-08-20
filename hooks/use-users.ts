/**
 * User hooks - queries and mutations for user management.
 *
 * KEY CONCEPT - useUsers vs useCurrentUser (Zustand):
 * `useUsers()` fetches the FULL list of users from the server (React Query).
 * `useCurrentUser()` from the auth-store reads who is logged in (Zustand).
 * These serve different purposes and should NOT be confused.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { TUser, TRole } from '@/types/api';

// --- Queries ------------------------------------------------------------------

/** Fetches the full list of users (admin only) */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => apiClient<TUser[]>('/users'),
    staleTime: 60_000, // Users don't change often - cache for 1 minute
  });
}

// --- Mutations ----------------------------------------------------------------

/** Updates a user's role */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: TRole }) =>
      apiClient<TUser>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.list() });
      const previous = queryClient.getQueryData<TUser[]>(queryKeys.users.list());

      queryClient.setQueryData<TUser[]>(queryKeys.users.list(), (old) =>
        old?.map((u) => (u.id === id ? { ...u, role } : u)),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.users.list(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

/** Toggles a user's active status */
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient<TUser>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.list() });
      const previous = queryClient.getQueryData<TUser[]>(queryKeys.users.list());

      queryClient.setQueryData<TUser[]>(queryKeys.users.list(), (old) =>
        old?.map((u) => (u.id === id ? { ...u, isActive } : u)),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.users.list(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}
