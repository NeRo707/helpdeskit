import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { PageHeader } from '@/components/page-header';
import { UsersTable } from './users-table';

export default async function UsersPage() {
  const user = await getMe();

  if (!user) redirect('/login');

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  // Shell: UsersTable self-fetches via useUsers() React Query hook
  return (
    <div className="space-y-4">
      <PageHeader title="User Management" description="Manage roles and access" />
      <UsersTable currentUserId={user.id} />
    </div>
  );
}
