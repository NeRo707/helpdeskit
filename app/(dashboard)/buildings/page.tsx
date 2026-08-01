import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMe } from '@/actions/auth';
import { PageHeader } from '@/components/page-header';
import type { Building } from '@/types/api';
import { BuildingsTable } from './buildings-table';

async function fetchBuildings(): Promise<Building[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/buildings`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error('Failed to fetch buildings');
  }
  return res.json();
}

export default async function BuildingsPage() {
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'USER') {
    redirect('/tickets/my');
  }

  const buildings = await fetchBuildings();

  return (
    <div className="space-y-4">
      <PageHeader title="Buildings" description="Manage campus buildings and rooms" />

      <BuildingsTable buildings={buildings} isAdmin={user.role === 'ADMIN'} />
    </div>
  );
}
