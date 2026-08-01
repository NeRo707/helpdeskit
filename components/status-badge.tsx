import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  OPEN: 'border-primary/30 bg-primary/20 text-primary',
  IN_PROGRESS: 'border-warning/30 bg-warning/20 text-warning',
  ON_HOLD: 'border-[hsl(25,95%,53%)]/30 bg-[hsl(25,95%,53%)]/20 text-[hsl(25,95%,53%)]',
  RESOLVED: 'border-success/30 bg-success/20 text-success',
  CLOSED: 'border-border bg-muted text-muted-foreground',
  LOW: 'border-border bg-muted text-muted-foreground',
  MEDIUM: 'border-primary/30 bg-primary/20 text-primary',
  HIGH: 'border-[hsl(25,95%,53%)]/30 bg-[hsl(25,95%,53%)]/20 text-[hsl(25,95%,53%)]',
  CRITICAL: 'border-destructive/30 bg-destructive/20 text-destructive',
  ACTIVE: 'border-success/30 bg-success/20 text-success',
  INACTIVE: 'border-border bg-muted text-muted-foreground',
  UNDER_MAINTENANCE: 'border-warning/30 bg-warning/20 text-warning',
  DECOMMISSIONED: 'border-destructive/30 bg-destructive/20 text-destructive',
};

const displayLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Under Maintenance',
  DECOMMISSIONED: 'Decommissioned',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors = statusColors[status] || 'border-border bg-muted text-muted-foreground';
  const label = displayLabels[status] || status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-medium',
        colors,
        className
      )}
    >
      {label}
    </span>
  );
}
