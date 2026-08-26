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

import { useQueryStates, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useTickets } from '@/hooks/use-tickets';
import { TicketsTable } from './tickets-table';
import SearchParamsForm from './_components/SearchParamsForm';

const SORT_FIELDS = ['title', 'priority', 'status', 'createdAt', 'assigned'] as const;
const DIRECTIONS = ['asc', 'desc'] as const;
const SEARCH_FIELDS = ['title', 'reporter', 'assigned'] as const;

export function TicketsPageClient() {
  // nuqs keeps filters in the URL - these are the authoritative filter values
  const [params] = useQueryStates(
    {
      status:   parseAsString.withDefault(''),
      priority: parseAsString.withDefault(''),
      sort:     parseAsStringLiteral(SORT_FIELDS).withDefault('createdAt'),
      dir:      parseAsStringLiteral(DIRECTIONS).withDefault('desc'),
      by:       parseAsStringLiteral(SEARCH_FIELDS).withDefault('title'),
      q:        parseAsString.withDefault(''),
    },
    { shallow: false },
  );

  // React Query re-fetches whenever params change (new query key)
  const { data: tickets, isPending, isError } = useTickets(params);

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
