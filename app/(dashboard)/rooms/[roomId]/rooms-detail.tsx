import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TRoom } from '@/types/api';
import { RoomDetailClient } from './room-detail.client';

interface RoomDetailServerProps {
  room: TRoom;
  roomId: string;
}

// Server component: renders purely from server-fetched data.
// No 'use client', no hooks, no client-side fetch waterfall.
export function RoomDetailServer({ room, roomId }: RoomDetailServerProps) {
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
              <dd className="text-sm">
                {room._count?.computers ?? room.computers?.length ?? 0}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Only the interactive parts (role gate, tables with mutations)
          cross the client boundary. Everything above is server-rendered. */}
      <RoomDetailClient roomId={roomId} buildingId={room.buildingId} />
    </div>
  );
}
