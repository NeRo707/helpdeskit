'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Ticket,
  Users,
  PlusCircle,
  LogOut,
  Monitor,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role, User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AppSidebarProps {
  user: User;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'TECHNICIAN'],
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: Ticket,
    roles: ['ADMIN', 'TECHNICIAN'],
  },
  {
    href: '/buildings',
    label: 'Assets',
    icon: Building2,
    roles: ['ADMIN', 'TECHNICIAN'],
  },
  { href: '/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  {
    href: '/tickets/my',
    label: 'My Tickets',
    icon: Ticket,
    roles: ['USER'],
  },
  {
    href: '/tickets/new',
    label: 'Submit Ticket',
    icon: PlusCircle,
    roles: ['USER'],
  },
];

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const navLinkClass =
    'flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground';
  const activeClass = 'bg-accent text-primary font-medium';

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-4">
        <Monitor className="h-5 w-5 shrink-0 text-primary" />
        {!collapsed ? <span className="font-heading text-sm font-bold tracking-tight">UniDesk</span> : null}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(navLinkClass, isActive ? activeClass : '')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-2">
        {!collapsed ? (
          <div className="truncate px-3 py-2 font-mono text-xs text-muted-foreground">
            {user.email}
            <div className="mt-0.5 text-[10px] uppercase tracking-wider">{user.role}</div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn('h-4 w-4 shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed ? <span>Sign Out</span> : null}
        </Button>
      </div>
    </aside>
  );
}
