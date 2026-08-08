"use client";

import { useTransition } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { TUser } from "@/types/api";

interface DashboardLayoutClientProps {
  user: TUser;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  user,
  logoutAction,
  children,
}: DashboardLayoutClientProps) {
  const [, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6 ">
        <div className="mx-auto max-w-350">{children}</div>
      </main>
    </div>
  );
}
