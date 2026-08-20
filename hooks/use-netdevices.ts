/**
 * Network Device-specific hooks - queries for detail, and mutations for notes, history, etc.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { TNetworkDevice } from '@/types/api';

// --- Query keys ---------------------------------------------------------------
export const netdeviceKeys = {
  detail: (id: string) => ['netdevices', id] as const,
};

// --- Queries ------------------------------------------------------------------

export function useNetworkDevice(buildingId: string, roomId: string, netdeviceId: string) {
  return useQuery({
    queryKey: netdeviceKeys.detail(netdeviceId),
    queryFn: () =>
      apiClient<TNetworkDevice>(
        `/buildings/${buildingId}/rooms/${roomId}/netdevices/${netdeviceId}`
      ),
    enabled: !!netdeviceId,
    staleTime: 60_000,
  });
}

// --- Mutations ----------------------------------------------------------------

export function useUpdateNetworkDevice(buildingId: string, roomId: string, netdeviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TNetworkDevice>) =>
      apiClient<TNetworkDevice>(`/buildings/${buildingId}/rooms/${roomId}/netdevices/${netdeviceId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: netdeviceKeys.detail(netdeviceId) });
    },
  });
}
