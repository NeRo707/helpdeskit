import { Badge } from '@/components/ui/badge';
import type { Role } from '@/types/api';
import { cn } from '@/lib/utils';

const roleConfig: Record<Role, { label: string; className: string }> = {
  ADMIN: {
    label: 'Admin',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  TECHNICIAN: {
    label: 'Technician',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  USER: {
    label: 'User',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
