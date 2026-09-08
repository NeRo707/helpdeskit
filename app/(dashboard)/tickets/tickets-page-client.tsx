'use client';

/**
 * TicketsPageClient - owns filter state and React Query data fetching.
 *
 * KEY CONCEPT - nuqs + React Query integration:
 * nuqs manages URL search params as the source of truth for filters.
 * When params change (user picks a status filter), React Query sees a new
 * query key and fetches fresh data. The URL is shareable/bookmarkable.
 *
 * The flow is:
 *   User changes filter → nuqs updates URL → query key changes →
 *   React Query detects new key → fetches new data → TicketsTable re-renders
 */

import { TicketsTable } from './tickets-table';
import SearchParamsForm from './_lib/_components/SearchParamsForm';
import { useSearchForm } from './_lib/_hooks/useSearchForm';

export function TicketsPageClient() {
  const { params, tickets, isPending, isError } = useSearchForm();

  return (
    <>
      <SearchParamsForm initialValues={params} />
      <TicketsTable
        tickets={tickets ?? []}
        isLoading={isPending}
        isError={isError}
      />
    </>
  );
}
