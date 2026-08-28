"use client";

import { useRoom } from "@/hooks/use-buildings";
import { useUserRole } from "@/stores/auth-store";
import { NetworkDevicesTable } from "./_libs/components/netdevices/netdevices-table.client";
import { Role } from "@/types/api";
import { ComputersSection } from "./_libs/components/computers/computers-section";

interface RoomDetailClientProps {
  roomId: string;
  buildingId: string;
}

export function RoomDetailClient({ roomId, buildingId }: RoomDetailClientProps) {
  const role    = useUserRole();
  const canEdit = role === Role.ADMIN || role === Role.TECHNICIAN;
  const { data: room } = useRoom(roomId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Network Devices</h2>
        <NetworkDevicesTable
          buildingId={buildingId}
          roomId={roomId}
          networkDevices={room?.networkDevices ?? []}
          canEdit={canEdit}
        />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Computers</h2>
        <ComputersSection
          buildingId={buildingId}
          roomId={roomId}
          computers={room?.computers ?? []}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
