/**
 * Building + Room hooks - queries and mutations for buildings, rooms,
 * computers, and network devices.
 *
 * KEY CONCEPT - Nested query keys:
 * queryKeys.buildings.detail(id) covers the building.
 * queryKeys.buildings.rooms(id) covers the rooms list within that building.
 * When we mutate a room, we invalidate the rooms key - NOT the building key -
 * so unrelated cached data stays intact.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  TBuilding,
  TRoom,
  TComputer,
  TNetworkDevice,
  TAssetStatus,
} from "@/types/api";

// ---------------------------------------------
// Buildings
// ---------------------------------------------

/** Fetches the full building list */
export function useBuildings() {
  return useQuery({
    queryKey: queryKeys.buildings.list(),
    queryFn: () => apiClient<TBuilding[]>("/buildings"),
    staleTime: 5 * 60_000, // 5 minutes - buildings rarely change
  });
}

/** Fetches a single building with its rooms */
export function useBuilding(id: string) {
  return useQuery({
    queryKey: queryKeys.buildings.detail(id),
    queryFn: () => apiClient<TBuilding>(`/buildings/${id}`),
    staleTime: 2 * 60_000,
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; address: string | null }) =>
      apiClient<TBuilding>("/buildings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });
    },
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (buildingId: string) =>
      apiClient(`/buildings/${buildingId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.all(),
      });
    },
  });
}

// ---------------------------------------------
// Rooms
// ---------------------------------------------

export function useCreateRoom(buildingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; floor?: string | null }) =>
      apiClient<TRoom>(`/rooms`, {
        method: "POST",
        body: JSON.stringify({ ...data, buildingId }),
      }),
    onSuccess: () => {
      // Invalidate building detail so room count + list refreshes
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.detail(buildingId),
      });
    },
  });
}

export function useUpdateRoom(buildingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      data,
    }: {
      roomId: string;
      data: { name?: string; floor?: string | null };
    }) =>
      apiClient<TRoom>(`/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.detail(buildingId),
      });
    },
  });
}

export function useDeleteRoom(buildingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) =>
      apiClient(`/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.detail(buildingId),
      });
    },
  });
}

// ---------------------------------------------
// Room detail (computers + netdevices live inside)
// ---------------------------------------------

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: queryKeys.buildings.room(roomId),
    queryFn: () => apiClient<TRoom>(`/rooms/${roomId}`),
    staleTime: 2 * 60_000,
    enabled: !!roomId,
  });
}

// ---------------------------------------------
// Computers
// ---------------------------------------------

export function useUpsertComputer(buildingId: string, roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      computerId,
      data,
    }: {
      computerId?: string;
      data: {
        roomId?: string;
        hostname: string;
        ipAddress?: string | null;
        macAddress?: string | null;
        os?: string | null;
        status: TAssetStatus;
      };
    }) => {
      const url = computerId ? `/computers/${computerId}` : `/computers`;
      return apiClient<TComputer>(url, {
        method: computerId ? "PUT" : "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.room(roomId),
      });
    },
  });
}

// ---------------------------------------------
// Network devices
// ---------------------------------------------

export function useUpsertNetworkDevice(buildingId: string, roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deviceId,
      data,
    }: {
      deviceId?: string;
      data: {
        roomId?: string;
        hostname: string;
        ipAddress?: string | null;
        macAddress?: string | null;
        status: TAssetStatus;
        type?: string | null;
        brand?: string | null;
        model?: string | null;
        serialNumber?: string | null;
      };
    }) => {
      const url = deviceId ? `/networkdevices/${deviceId}` : `/networkdevices`;
      return apiClient<TNetworkDevice>(url, {
        method: deviceId ? "PATCH" : "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.room(roomId),
      });
    },
  });
}
