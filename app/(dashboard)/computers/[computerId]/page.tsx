import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { computerKeys } from "@/hooks/use-computers";
import { fetchAPI } from "@/lib/api";
import type { TComputer, TAssetHistory } from "@/types/api";
import { ComputerDetailClient } from "./ComputerDetailClient";

export default async function ComputerDetailPage({
  params,
}: {
  params: Promise<{ computerId: string }>;
}) {
  const { computerId } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: computerKeys.detail(computerId),
      queryFn: () => fetchAPI<TComputer>(`/computers/${computerId}`),
      staleTime: 30_000,
    }),
    queryClient.prefetchQuery({
      queryKey: computerKeys.history(computerId),
      queryFn: () => fetchAPI<TAssetHistory[]>(`/computers/${computerId}/history`),
      staleTime: 30_000,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ComputerDetailClient computerId={computerId} />
    </HydrationBoundary>
  );
}
