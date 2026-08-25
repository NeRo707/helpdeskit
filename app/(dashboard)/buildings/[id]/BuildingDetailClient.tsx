'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBuilding } from '@/hooks/use-buildings';
import { useUserRole } from '@/stores/auth-store';
import { RoomsTable } from './rooms-table';

interface BuildingDetailClientProps {
  id: string;
}

export function BuildingDetailClient({ id }: BuildingDetailClientProps) {
  const isAdmin = useUserRole() === 'ADMIN';
  const { data: building, isPending, isError } = useBuilding(id);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-36 w-full rounded border" />
        <Skeleton className="h-48 w-full rounded border" />
      </div>
    );
  }

  if (isError || !building) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load building. It may not exist or you may not have access.
      </div>
    );
  }

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
              <dd className="text-sm">{building.address || '-'}</dd>
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
        {/* RoomsTable receives rooms from useBuilding cache - no extra fetch */}
        <RoomsTable
          buildingId={id}
          rooms={building.rooms ?? []}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
