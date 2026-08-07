import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getMe } from '@/actions/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { AssetStatusBadge } from '@/components/asset-status-badge';
import type { Computer, AssetHistory } from '@/types/api';
import { PeripheralsSection } from './peripherals-section';
import { AssetHistoryTimeline } from './asset-history-timeline';
import AssetHistoryForm from './asset-history-form';

async function fetchComputer(
  buildingId: string,
  roomId: string,
  computerId: string
): Promise<Computer> {
  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.BACKEND_URL}/buildings/${buildingId}/rooms/${roomId}/computers/${computerId}`,
    {
      headers: { cookie: cookieStore.toString() },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    if (res.status === 404) redirect(`/buildings/${buildingId}/rooms/${roomId}`);
    throw new Error('Failed to fetch computer');
  }
  return res.json();
}

async function fetchHistory(computerId: string): Promise<AssetHistory[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/computers/${computerId}/history`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ComputerDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string; computerId: string }>;
}) {
  const { id: buildingId, roomId, computerId } = await params;
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'USER') {
    redirect('/tickets/my');
  }

  const [computer, history] = await Promise.all([
    fetchComputer(buildingId, roomId, computerId),
    fetchHistory(computerId),
  ]);

  const canEdit = user.role === 'ADMIN' || user.role === 'TECHNICIAN';

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/buildings/${buildingId}/rooms/${roomId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Room
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{computer.hostname}</h1>
          <p className="text-muted-foreground">{computer.ipAddress || 'No IP address'}</p>
        </div>
        <AssetStatusBadge status={computer.status} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Computer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Hostname</dt>
              <dd className="text-sm">{computer.hostname}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">IP Address</dt>
              <dd className="text-sm">{computer.ipAddress || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">MAC Address</dt>
              <dd className="text-sm font-mono">{computer.macAddress || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Operating System</dt>
              <dd className="text-sm">
                {computer.os || '—'}
                {computer.osVersion && ` (${computer.osVersion})`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">CPU</dt>
              <dd className="text-sm">{computer.cpu || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">RAM</dt>
              <dd className="text-sm">{computer.ramGb ? `${computer.ramGb} GB` : '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Storage</dt>
              <dd className="text-sm">{computer.storageGb ? `${computer.storageGb} GB` : '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Purchase Date</dt>
              <dd className="text-sm">
                {computer.purchaseDate
                  ? new Date(computer.purchaseDate).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Warranty End</dt>
              <dd className="text-sm">
                {computer.warrantyEnd
                  ? new Date(computer.warrantyEnd).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
            {computer.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="text-sm">{computer.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <PeripheralsSection
        buildingId={buildingId}
        roomId={roomId}
        computerId={computerId}
        peripherals={computer.peripherals || []}
        canEdit={canEdit}
      />

      <AssetHistoryTimeline computerId={computerId} history={history} canEdit={canEdit} />
      <AssetHistoryForm computerId={computerId} />
    </div>
  );
}
