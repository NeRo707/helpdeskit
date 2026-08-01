import { Badge } from '@/components/ui/badge';
import type { TicketPriority } from '@/types/api';
import { cn } from '@/lib/utils';

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  LOW: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
