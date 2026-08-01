'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type Column } from '@/components/data-table';

export default function MyTicketsLoading() {
  const columns: Column<{ id: string }>[] = [
    { header: 'Title', accessor: () => <Skeleton className="h-5 w-40" /> },
    { header: 'Status', accessor: () => <Skeleton className="h-5 w-20" /> },
    { header: 'Priority', accessor: () => <Skeleton className="h-5 w-16" /> },
    { header: 'Assigned To', accessor: () => <Skeleton className="h-5 w-24" /> },
    { header: 'Computer', accessor: () => <Skeleton className="h-5 w-24" /> },
    { header: 'Created', accessor: () => <Skeleton className="h-5 w-20" /> },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <DataTable columns={columns} data={[]} loading />
    </div>
  );
}
