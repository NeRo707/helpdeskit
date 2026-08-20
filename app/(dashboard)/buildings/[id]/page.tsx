import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { BuildingDetailClient } from './BuildingDetailClient';

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getMe();

  if (!user) redirect('/login');
  if (user.role === 'USER') redirect('/tickets/my');

  // Shell: passes id + isAdmin down; data fetched by client via useBuilding()
  return <BuildingDetailClient id={id} isAdmin={user.role === 'ADMIN'} />;
}
