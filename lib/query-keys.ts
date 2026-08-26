/**
 * Centralised query key factory.
 *
 * KEY CONCEPT - Why a factory instead of plain string arrays?
 * React Query identifies cached data by its query key. If you scatter
 * ['tickets', id] as magic strings throughout your codebase, one typo means
 * invalidateQueries('tickets', id) misses its target and you get stale data.
 *
 * A factory gives you:
 *  1. TypeScript autocomplete on all keys
 *  2. A single place to change the key shape
 *  3. Hierarchical invalidation: invalidate queryKeys.tickets.all() to bust
 *     EVERY tickets query (lists AND detail views) at once.
 *
 * Usage:
 *   useQuery({ queryKey: queryKeys.tickets.detail(id), ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() })
 */

export const queryKeys = {
  tickets: {
    /** Matches ALL ticket queries - use to invalidate lists + details together */
    all: () => ['tickets'] as const,
    /** A specific filtered list */
    list: (filters: Record<string, string>) =>
      ['tickets', 'list', filters] as const,
    /** My tickets for the current user */
    my: () => ['tickets', 'my'] as const,
    /** A single ticket by ID */
    detail: (id: string) => ['tickets', id] as const,
    /** Comments for a ticket */
    comments: (id: string) => ['tickets', id, 'comments'] as const,
  },

  users: {
    /** Matches ALL user queries */
    all: () => ['users'] as const,
    /** The currently authenticated user */
    me: () => ['users', 'me'] as const,
    /** Full user list */
    list: () => ['users', 'list'] as const,
  },

  buildings: {
    /** Matches ALL building queries */
    all: () => ['buildings'] as const,
    /** Full building list */
    list: () => ['buildings', 'list'] as const,
    /** A single building by ID (includes rooms array) */
    detail: (id: string) => ['buildings', id] as const,
    /** A single room by ID (includes computers + netdevices) */
    room: (roomId: string) =>
      ['rooms', roomId] as const,
  },
} as const;
