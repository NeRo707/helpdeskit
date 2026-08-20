'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetStatusBadge } from '@/components/asset-status-badge';
import { useNetworkDevice } from '@/hooks/use-netdevices';
import NotesForm from './notes-form';

interface NetDeviceDetailClientProps {
  buildingId: string;
  roomId: string;
  netdeviceId: string;
  canEdit: boolean;
}

export function NetDeviceDetailClient({
  buildingId,
  roomId,
  netdeviceId,
  canEdit,
}: NetDeviceDetailClientProps) {
  const { data: networkDevice, isPending, isError } =
    useNetworkDevice(buildingId, roomId, netdeviceId);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full rounded border" />
      </div>
    );
  }

  if (isError || !networkDevice) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load network device. It may not exist or you may not have access.
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
          <h1 className="text-3xl font-bold tracking-tight">
            {networkDevice.hostname}
          </h1>
          <p className="text-muted-foreground">
            {networkDevice.ipAddress || "No IP address"}
          </p>
        </div>
        <AssetStatusBadge status={networkDevice.status} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Network Device Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Hostname
              </dt>
              <dd className="text-sm">{networkDevice.hostname || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                IP Address
              </dt>
              <dd className="text-sm">{networkDevice.ipAddress || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                MAC Address
              </dt>
              <dd className="text-sm font-mono">
                {networkDevice.macAddress || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Type
              </dt>
              <dd className="text-sm">{networkDevice.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Brand
              </dt>
              <dd className="text-sm">{networkDevice.brand || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Model
              </dt>
              <dd className="text-sm">{networkDevice.model || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Serial Number
              </dt>
              <dd className="text-sm font-mono">
                {networkDevice.serialNumber || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Ports
              </dt>
              <dd className="text-sm">{networkDevice.ports ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Purchase Date
              </dt>
              <dd className="text-sm">
                {networkDevice.purchaseDate
                  ? new Date(networkDevice.purchaseDate).toLocaleDateString()
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Warranty End
              </dt>
              <dd className="text-sm">
                {networkDevice.warrantyEnd
                  ? new Date(networkDevice.warrantyEnd).toLocaleDateString()
                  : "-"}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-muted-foreground">
                Notes
              </dt>
              <dd className="text-sm">{networkDevice.notes}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      {canEdit && (
        <NotesForm
          buildingId={buildingId}
          roomId={roomId}
          entityId={netdeviceId}
          currentNotes={networkDevice.notes}
        />
      )}
    </div>
  );
}
