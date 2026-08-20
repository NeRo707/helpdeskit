'use client';

/**
 * Providers - the single wrapper that sets up all client-side infrastructure.
 *
 * KEY CONCEPT - Why one Providers component instead of nesting everywhere?
 * React Query's QueryClientProvider and Zustand's store initialization both
 * need to run client-side, but they wrap the entire app. Centralising them here
 * means layout.tsx stays a clean async Server Component.
 *
 * KEY CONCEPT - QueryClient configuration:
 * - `staleTime: 30s` - data is "fresh" for 30s; navigating between pages won't
 *   trigger a refetch if the data was just fetched.
 * - `retry: 1` - on error, retry once before showing an error state.
 * - `onError` (global) - if a query throws UnauthorizedError, redirect to login.
 *   This is your global 401 handler for client-side fetches.
 *
 * KEY CONCEPT - Why useState for QueryClient?
 * We use `useState(() => new QueryClient())` instead of creating it outside the
 * component. In Next.js App Router, the module is shared between server and
 * client. Creating QueryClient outside would cause a single instance to be
 * shared across all users (server-side), leaking data between requests.
 */

import { useState, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { UnauthorizedError } from '@/lib/api-client';
import type { TUser } from '@/types/api';

interface ProvidersProps {
  children: React.ReactNode;
  /** User resolved server-side at layout boot time - hydrates the Zustand store */
  initialUser: TUser | null;
}

export function Providers({ children, initialUser }: ProvidersProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  // -- Hydrate the Zustand auth store from server-resolved user --------------
  // We do this on every render where initialUser changes (e.g. login/logout).
  // This is safe because setUser is a stable Zustand action.
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  // -- Create QueryClient INSIDE useState to avoid shared-instance issues ----
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds - prevents waterfall
            // refetches when navigating between pages quickly.
            staleTime: 30_000,
            // Retry once on failure (e.g. transient network error)
            retry: 1,
            // Don't retry on 401 - the user needs to log in
            retryDelay: 500,
          },
        },
        // Global error handler for ALL queries
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof UnauthorizedError) {
              router.push('/login');
            }
          },
        }),
        // Global error handler for ALL mutations
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error instanceof UnauthorizedError) {
              router.push('/login');
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only included in development - zero production cost */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
