import { PageHeader } from '@/components/page-header';
import { UsersTable } from './users-table';

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="User Management" description="Manage roles and access" />
      <UsersTable />
    </div>
  );
}
