import { redirect } from 'next/navigation';
import { getMe, logoutAction } from '@/actions/auth';
import { DashboardLayoutClient } from './dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient user={user} logoutAction={logoutAction}>
      {children}
    </DashboardLayoutClient>
  );
}
