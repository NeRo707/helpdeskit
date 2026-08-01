'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/data-table';

export default function BuildingDetailLoading() {
  const columns: Column<{ id: string }>[] = [
    { header: 'Name', accessor: () => <Skeleton className="h-5 w-24" /> },
    { header: 'Floor', accessor: () => <Skeleton className="h-5 w-16" /> },
    { header: 'Capacity', accessor: () => <Skeleton className="h-5 w-12" /> },
    { header: 'Computers', accessor: () => <Skeleton className="h-5 w-12" /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <Skeleton className="h-6 w-20 mb-4" />
        <DataTable columns={columns} data={[]} loading />
      </div>
    </div>
  );
}
