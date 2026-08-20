import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { ComputerDetailClient } from './ComputerDetailClient';

export default async function ComputerDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string; computerId: string }>;
}) {
  const { id: buildingId, roomId, computerId } = await params;
  const user = await getMe();

  if (!user) redirect('/login');
  if (user.role === 'USER') redirect('/tickets/my');

  return (
    <ComputerDetailClient
      buildingId={buildingId}
      roomId={roomId}
      computerId={computerId}
      canEdit={user.role === 'ADMIN' || user.role === 'TECHNICIAN'}
    />
  );
}
