import { redirect } from 'next/navigation';
import { getMe, logoutAction } from '@/actions/auth';
import { DashboardLayoutClient } from './dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard - redirect unauthenticated users before rendering
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  return (
    // Note: user prop removed - DashboardLayoutClient reads from Zustand store
    <DashboardLayoutClient logoutAction={logoutAction}>
      {children}
    </DashboardLayoutClient>
  );
}
