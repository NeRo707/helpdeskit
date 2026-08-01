import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getMe } from '@/actions/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import type { Building } from '@/types/api';
import { RoomsTable } from './rooms-table';

async function fetchBuilding(id: string): Promise<Building> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/buildings/${id}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    if (res.status === 404) redirect('/buildings');
    throw new Error('Failed to fetch building');
  }
  return res.json();
}

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'USER') {
    redirect('/tickets/my');
  }

  const building = await fetchBuilding(id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/buildings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Buildings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{building.name}</h1>
        {building.address && (
          <p className="text-muted-foreground">{building.address}</p>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Building Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm">{building.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address</dt>
              <dd className="text-sm">{building.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Rooms</dt>
              <dd className="text-sm">{building._count?.rooms ?? building.rooms?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="text-sm">{new Date(building.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Rooms</h2>
        <RoomsTable 
          buildingId={id} 
          rooms={building.rooms || []} 
          isAdmin={user.role === 'ADMIN'} 
        />
      </div>
    </div>
  );
}
