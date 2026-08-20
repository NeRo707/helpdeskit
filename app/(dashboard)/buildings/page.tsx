import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { PageHeader } from '@/components/page-header';
import { BuildingsTable } from './buildings-table';

export default async function BuildingsPage() {
  const user = await getMe();

  if (!user) redirect('/login');
  if (user.role === 'USER') redirect('/tickets/my');

  // Shell: BuildingsTable self-fetches via useBuildings() React Query hook
  return (
    <div className="space-y-4">
      <PageHeader title="Buildings" description="Manage campus buildings and rooms" />
      <BuildingsTable isAdmin={user.role === 'ADMIN'} />
    </div>
  );
}
