import { logoutAction } from '@/actions/auth';
import { DashboardLayoutClient } from './dashboard-layout-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <DashboardLayoutClient logoutAction={logoutAction}>
      {children}
    </DashboardLayoutClient>
  );
}
