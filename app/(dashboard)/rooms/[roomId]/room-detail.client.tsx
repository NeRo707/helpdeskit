'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoom } from '@/hooks/use-buildings';
import { useUserRole } from '@/stores/auth-store';
import { ComputersTable } from './_libs/components/computers/computers-table.client';
import { NetworkDevicesTable } from './_libs/components/netdevices/netdevices-table.client';

interface RoomDetailClientProps {
  roomId: string;
}

export function RoomDetailClient({ roomId }: RoomDetailClientProps) {
  const role = useUserRole();
  const canEdit = role === 'ADMIN' || role === 'TECHNICIAN';
  const { data: room, isPending, isError } = useRoom(roomId);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-36 w-full rounded border" />
        <Skeleton className="h-48 w-full rounded border" />
        <Skeleton className="h-48 w-full rounded border" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load room. It may not exist or you may not have access.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/buildings/${room.buildingId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Building
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
        {room.floor && (
          <p className="text-muted-foreground">Floor {room.floor}</p>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Room Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm">{room.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Floor</dt>
              <dd className="text-sm">{room.floor || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Computers</dt>
              <dd className="text-sm">{room._count?.computers ?? room.computers?.length ?? 0}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Network Devices</h2>
          {/* networkDevices from the room query - no extra fetch */}
          <NetworkDevicesTable
            buildingId={room.buildingId}
            roomId={roomId}
            networkDevices={room.networkDevices ?? []}
            canEdit={canEdit}
          />
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Computers</h2>
          <ComputersTable
            buildingId={room.buildingId}
            roomId={roomId}
            computers={room.computers ?? []}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  );
}
