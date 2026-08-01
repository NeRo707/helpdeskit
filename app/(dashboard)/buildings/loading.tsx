'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type Column } from '@/components/data-table';

export default function BuildingsLoading() {
  const columns: Column<{ id: string }>[] = [
    { header: 'Name', accessor: () => <Skeleton className="h-5 w-32" /> },
    { header: 'Address', accessor: () => <Skeleton className="h-5 w-48" /> },
    { header: 'Rooms', accessor: () => <Skeleton className="h-5 w-12" /> },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <DataTable columns={columns} data={[]} loading />
    </div>
  );
}
