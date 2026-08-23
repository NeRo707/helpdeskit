'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetStatusBadge } from '@/components/asset-status-badge';
import { useComputer, useComputerHistory } from '@/hooks/use-computers';
import { useUserRole } from '@/stores/auth-store';
import { PeripheralsSection } from './peripherals-section';
import { AssetHistoryTimeline } from './asset-history-timeline';
import AssetHistoryForm from './asset-history-form';

interface ComputerDetailClientProps {
  buildingId: string;
  roomId: string;
  computerId: string;
}

export function ComputerDetailClient({
  buildingId,
  roomId,
  computerId,
}: ComputerDetailClientProps) {
  const role = useUserRole();
  const canEdit = role === 'ADMIN' || role === 'TECHNICIAN';
  // Parallel queries - both fire simultaneously
  const { data: computer, isPending: computerPending, isError: computerError } =
    useComputer(buildingId, roomId, computerId);
  const { data: history = [], isPending: historyPending } =
    useComputerHistory(computerId);

  if (computerPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full rounded border" />
        <Skeleton className="h-64 w-full rounded border" />
      </div>
    );
  }

  if (computerError || !computer) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load computer. It may not exist or you may not have access.
      </div>
    );
  }

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
              <dd className="text-sm">{computer.ipAddress || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">MAC Address</dt>
              <dd className="text-sm font-mono">{computer.macAddress || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Operating System</dt>
              <dd className="text-sm">
                {computer.os || '-'}
                {computer.osVersion && ` (${computer.osVersion})`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">CPU</dt>
              <dd className="text-sm">{computer.cpu || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">RAM</dt>
              <dd className="text-sm">{computer.ramGb ? `${computer.ramGb} GB` : '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Storage</dt>
              <dd className="text-sm">{computer.storageGb ? `${computer.storageGb} GB` : '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Purchase Date</dt>
              <dd className="text-sm">
                {computer.purchaseDate
                  ? new Date(computer.purchaseDate).toLocaleDateString()
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Warranty End</dt>
              <dd className="text-sm">
                {computer.warrantyEnd
                  ? new Date(computer.warrantyEnd).toLocaleDateString()
                  : '-'}
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

      {/* Peripherals come from computer.peripherals in the query cache */}
      <PeripheralsSection
        buildingId={buildingId}
        roomId={roomId}
        computerId={computerId}
        peripherals={computer.peripherals ?? []}
        canEdit={canEdit}
      />

      {/* History is a separate parallel query */}
      <AssetHistoryTimeline
        computerId={computerId}
        history={historyPending ? [] : history}
        canEdit={canEdit}
      />
      <AssetHistoryForm computerId={computerId} />
    </div>
  );
}
