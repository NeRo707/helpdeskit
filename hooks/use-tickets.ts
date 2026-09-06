/**
 * Ticket hooks - queries and mutations for all ticket operations.
 *
 * KEY CONCEPT - The anatomy of a React Query hook:
 *
 * useQuery  → For READING data (GET). Handles loading, error, caching, refetch.
 * useMutation → For WRITING data (POST/PATCH/DELETE). Handles optimistic updates,
 *               rollback on error, and cache invalidation on success.
 *
 * staleTime: 30s means React Query won't refetch for 30 seconds after a
 * successful fetch. Navigation between pages won't trigger waterfall requests.
 * Data is shown instantly from cache, refetched in background if stale.
 *
 * KEY CONCEPT - Optimistic updates:
 * In `useUpdateTicketStatus`, we update the cache BEFORE the server confirms.
 * If the server fails, we roll back to the previous value using `onError`.
 * This makes the UI feel instant - no waiting for a round-trip.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { TTicket, TTicketStatus, TTicketPriority } from "@/types/api";

// --- Types --------------------------------------------------------------------

export interface TicketFilters {
  status?: string;
  priority?: string;
  sort?: string;
  dir?: string;
  by?: string;
  q?: string;
}

interface CreateTicketPayload {
  title: string;
  description?: string;
  priority: TTicketPriority;
  computerId?: string | null;
}

type TicketsQueryOptions = Omit<
  UseQueryOptions<TTicket[]>,
  'queryKey' | 'queryFn'
>;

// --- Queries ------------------------------------------------------------------

/** Fetches the filtered ticket list (admin/technician view) */
export function useTickets(
  filters: TicketFilters = {},
  options?: TicketsQueryOptions,
) {
  // Build query string from non-empty filter values
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== undefined && v !== "all",
    ),
  );

  return useQuery({
    // The key includes the filters so each unique filter combination gets its
    // own cache entry. Change a filter → React Query fetches a new page.
    queryKey: queryKeys.tickets.list(activeFilters),
    queryFn: () => {
      const params = new URLSearchParams(activeFilters);
      return apiClient<TTicket[]>(`/tickets?${params}`);
    },
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/** Fetches only the current user's tickets */
export function useMyTickets() {
  return useQuery({
    queryKey: queryKeys.tickets.my(),
    queryFn: () => apiClient<TTicket[]>("/tickets/my"),
    staleTime: 30_000,
  });
}

/** Fetches a single ticket by ID with full relations */
export function useTicket(
  id: string,
  options?: Partial<UseQueryOptions<TTicket>>,
) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => apiClient<TTicket>(`/tickets/${id}`),
    staleTime: 30_000,
    ...options,
  });
}

// --- Mutations ----------------------------------------------------------------

/** Updates ticket status with optimistic UI */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TTicketStatus }) =>
      apiClient<TTicket>(`/tickets/status`, {
        method: "PUT",
        body: JSON.stringify({ id, status }),
      }),

    // OPTIMISTIC UPDATE: update cache before the server responds
    onMutate: async ({ id, status }) => {
      // Cancel any in-flight queries for this ticket so they don't overwrite us
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(id),
      });

      // Snapshot the current value for rollback
      const previous = queryClient.getQueryData<TTicket>(
        queryKeys.tickets.detail(id),
      );

      // Optimistically update the detail cache
      queryClient.setQueryData<TTicket>(queryKeys.tickets.detail(id), (old) =>
        old ? { ...old, status } : old,
      );

      return { previous };
    },

    // ROLLBACK: if the server rejects, restore the snapshot
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.tickets.detail(id),
          context.previous,
        );
      }
    },

    // INVALIDATE: after success or error, sync the cache with the server
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() });
    },
  });
}

/** Assigns a ticket to a user */
export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      apiClient<TTicket>(`/tickets/assign`, {
        method: "PUT",
        body: JSON.stringify({ id, assignedToId }),
      }),
    onSuccess: (_data, { id }) => {
      // Invalidate both the detail and the list so tables re-render
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() });
    },
  });
}

/** Creates a new ticket */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      apiClient<TTicket>("/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    onSuccess: () => {
      // Bust ALL ticket lists so the new ticket appears everywhere
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() });
    },
  });
}

/** Adds a comment to a ticket */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, body }: { ticketId: string; body: string }) =>
      apiClient(`/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),

    onSuccess: (_data, { ticketId }) => {
      // Refetch the ticket to get fresh comments array
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      });
    },
  });
}
