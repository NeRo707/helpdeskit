'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type Column } from '@/components/data-table';

export default function UsersLoading() {
  const columns: Column<{ id: string }>[] = [
    { header: 'Name', accessor: () => <Skeleton className="h-5 w-32" /> },
    { header: 'Email', accessor: () => <Skeleton className="h-5 w-48" /> },
    { header: 'Role', accessor: () => <Skeleton className="h-8 w-24" /> },
    { header: 'Status', accessor: () => <Skeleton className="h-5 w-16" /> },
    { header: 'Created', accessor: () => <Skeleton className="h-5 w-20" /> },
    { header: 'Actions', accessor: () => <Skeleton className="h-8 w-8" /> },
  ];

  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      <DataTable columns={columns} data={[]} loading />
    </div>
  );
}
