import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getMe } from '@/actions/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import type { Room } from '@/types/api';
import { ComputersTable } from './computers-table';

async function fetchRoom(buildingId: string, roomId: string): Promise<Room> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/buildings/${buildingId}/rooms/${roomId}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    if (res.status === 404) redirect(`/buildings/${buildingId}`);
    throw new Error('Failed to fetch room');
  }
  return res.json();
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id: buildingId, roomId } = await params;
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'USER') {
    redirect('/tickets/my');
  }

  const room = await fetchRoom(buildingId, roomId);
  const canEdit = user.role === 'ADMIN' || user.role === 'TECHNICIAN';

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/buildings/${buildingId}`}
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
              <dd className="text-sm">{room.floor || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Computers</dt>
              <dd className="text-sm">{room._count?.computers ?? room.computers?.length ?? 0}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Computers</h2>
        <ComputersTable
          buildingId={buildingId}
          roomId={roomId}
          computers={room.computers || []}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
