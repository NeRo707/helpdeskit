import { PageHeader } from "@/components/page-header";
import { BuildingsTable } from "./buildings-table.client";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { TBuilding } from "@/types/api";
import { fetchAPI } from "@/lib/api";

export default async function BuildingsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.buildings.list(),
    queryFn: () => fetchAPI<TBuilding[]>('/buildings'),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Buildings" description="Manage campus buildings and rooms" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BuildingsTable />
      </HydrationBoundary>
    </div>
  );
}
