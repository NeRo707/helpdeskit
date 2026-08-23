"use client";

import { useTransition } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useCurrentUser } from "@/stores/auth-store";

interface DashboardLayoutClientProps {
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  logoutAction,
  children,
}: DashboardLayoutClientProps) {
  const user = useCurrentUser();
  const [, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  // Guard: user is null before Providers hydrates (very briefly on first paint)
  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6 ">
        <div className="mx-auto max-w-350">{children}</div>
      </main>
    </div>
  );
}

