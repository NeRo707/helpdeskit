import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMe } from '@/actions/auth';
import { PageHeader } from '@/components/page-header';
import type { User } from '@/types/api';
import { UsersTable } from './users-table';

async function fetchUsers(): Promise<User[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/users`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    if (res.status === 403) {
      return [];
    }
    throw new Error('Failed to fetch users');
  }
  return res.json();
}

export default async function UsersPage() {
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  // Only ADMIN can see users page
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  const users = await fetchUsers();

  return (
    <div className="space-y-4">
      <PageHeader title="User Management" description="Manage roles and access" />

      <UsersTable users={users} currentUserId={user.id} />
    </div>
  );
}
