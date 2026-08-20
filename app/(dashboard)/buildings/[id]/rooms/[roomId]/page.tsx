import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { RoomDetailClient } from './RoomDetailClient';

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id: buildingId, roomId } = await params;
  const user = await getMe();

  if (!user) redirect('/login');
  if (user.role === 'USER') redirect('/tickets/my');

  // Shell: passes IDs + edit permission; data fetched client-side via useRoom()
  return (
    <RoomDetailClient
      buildingId={buildingId}
      roomId={roomId}
      canEdit={user.role === 'ADMIN' || user.role === 'TECHNICIAN'}
    />
  );
}
