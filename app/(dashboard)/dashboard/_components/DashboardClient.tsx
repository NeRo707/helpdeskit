'use client';

/**
 * DashboardClient - the client counterpart of the dashboard page shell.
 *
 * KEY CONCEPT - Parallel queries with React Query:
 * Both useTickets() and useBuildings() fire simultaneously (parallel).
 * Compare to the old code where Promise.all ran server-side, blocking the
 * page render. Now the shell renders instantly and data populates as it arrives.
 *
 * KEY CONCEPT - Handling loading + error states:
 * React Query gives you `isPending`, `isError`, and `data` on every query.
 * You should always handle all three states - never assume data is ready.
 */

import { useTickets } from '@/hooks/use-tickets';
import { useBuildings } from '@/hooks/use-buildings';
import { PageHeader } from '@/components/page-header';
import StatsCards from './StatsCards';
import { RecentTickets } from './RecentTickets';
import { TicketStatusPieChart } from './TicketStatusPieChart';
import { TicketsTrendLineChart } from './TicketsTrendLineChart';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardClient() {
  // Both queries fire in parallel - React Query handles deduplication.
  // If tickets were already fetched elsewhere, the cache is used instantly.
  const ticketsQuery = useTickets();
  const buildingsQuery = useBuildings();

  const isLoading = ticketsQuery.isPending || buildingsQuery.isPending;
  const isError = ticketsQuery.isError || buildingsQuery.isError;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="System overview" />

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded border" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded border" />
            <Skeleton className="h-64 rounded border" />
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
          Failed to load dashboard data. Please refresh the page.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <StatsCards
            buildings={buildingsQuery.data ?? []}
            tickets={ticketsQuery.data ?? []}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <TicketStatusPieChart tickets={ticketsQuery.data ?? []} />
            <TicketsTrendLineChart tickets={ticketsQuery.data ?? []} />
          </div>
          <RecentTickets tickets={ticketsQuery.data ?? []} />
        </>
      )}
    </div>
  );
}
