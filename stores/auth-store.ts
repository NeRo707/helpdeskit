/**
 * Auth Store - holds the currently authenticated user in client-side memory.
 *
 * KEY CONCEPT - Why Zustand for user, not React Query?
 *
 * React Query is for SERVER STATE: data that lives on the server, can become
 * stale, needs periodic refetching, and can be invalidated after mutations.
 *
 * The "current user" is different: it changes only on login/logout (server
 * actions). Every component that needs to know WHO is logged in should just
 * read this store - no extra network request, no loading state, no caching.
 *
 * The bootstrap flow is:
 *   1. Server layout calls `loadCurrentUser()` (server action, reads httpOnly cookie)
 *   2. Passes the TUser to `<Providers initialUser={user} />`
 *   3. Providers hydrates this store on mount
 *   4. All client components call `useAuthStore()` - zero network requests
 *
 * On logout, `clearUser()` is called before the server action redirects.
 */

import { create } from 'zustand';
import type { TUser } from '@/types/api';

interface AuthState {
  /** The currently authenticated user, or null if not logged in */
  user: TUser | null;
  /** Called once during app boot from Providers to hydrate from server data */
  setUser: (user: TUser | null) => void;
  /** Called on logout before the server action redirects */
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// --- Convenience selector hooks -----------------------------------------------
// These let components subscribe to only the slice they care about.
// If `user` changes but `role` stays the same, the component won't re-render.

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useUserRole = () => useAuthStore((s) => s.user?.role ?? null);
