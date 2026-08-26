/**
 * Computer-specific hooks - queries for computer detail, peripherals, and asset history.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { TComputer, TAssetHistory, TPeripheral, TPeripheralType, TAssetStatus } from '@/types/api';

export const computerKeys = queryKeys.computers;

// --- Queries ------------------------------------------------------------------

export function useComputer(computerId: string) {
  return useQuery({
    queryKey: computerKeys.detail(computerId),
    queryFn: () =>
      apiClient<TComputer>(
        `/computers/${computerId}`
      ),
    enabled: !!computerId,
    staleTime: 60_000,
  });
}

export function useComputerHistory(computerId: string) {
  return useQuery({
    queryKey: computerKeys.history(computerId),
    queryFn: () => apiClient<TAssetHistory[]>(`/computers/${computerId}/history`),
    enabled: !!computerId,
    staleTime: 30_000,
  });
}

// --- Mutations ----------------------------------------------------------------

export function useUpsertPeripheral(computerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      peripheralId,
      data,
    }: {
      peripheralId?: string;
      data: {
        type: TPeripheralType;
        brand?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        status: TAssetStatus;
        notes?: string | null;
      };
    }) => {
      const url = peripheralId
        ? `/computers/${computerId}/peripherals/${peripheralId}`
        : `/computers/${computerId}/peripherals`;
      return apiClient<TPeripheral>(url, {
        method: peripheralId ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: computerKeys.detail(computerId) }),
  });
}

export function useDeletePeripheral(computerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (peripheralId: string) =>
      apiClient(`/computers/${computerId}/peripherals/${peripheralId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: computerKeys.detail(computerId) }),
  });
}

export function useAddAssetHistory(computerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { action: string; notes?: string }) =>
      apiClient<TAssetHistory>(`/computers/${computerId}/history`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: computerKeys.history(computerId) }),
  });
}

export function useDeleteAssetHistory(computerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (historyIds: string[]) =>
      apiClient(`/computers/${computerId}/history`, {
        method: 'DELETE',
        body: JSON.stringify({ ids: historyIds }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: computerKeys.history(computerId) }),
  });
}
