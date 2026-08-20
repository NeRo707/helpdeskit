/**
 * UI Store - ephemeral client-side UI state.
 *
 * KEY CONCEPT - What belongs in Zustand vs React local state?
 *
 * Use Zustand (this store) when state needs to be:
 *   - Shared between non-parent/child components (e.g. sidebar + header)
 *   - Persisted across route navigations
 *
 * Use React useState when state is:
 *   - Only used in one component (e.g. a dialog's open/close in the same component)
 *   - Completely local and short-lived
 *
 * The sidebar is a perfect Zustand candidate: the sidebar toggle button lives
 * in the header while the sidebar itself is a sibling component.
 */

import { create } from 'zustand';

interface UIState {
  /** Whether the sidebar is expanded or collapsed */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
