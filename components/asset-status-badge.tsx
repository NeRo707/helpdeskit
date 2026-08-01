import { Badge } from '@/components/ui/badge';
import type { AssetStatus } from '@/types/api';
import { cn } from '@/lib/utils';

const assetStatusConfig: Record<AssetStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  UNDER_MAINTENANCE: {
    label: 'Under Maintenance',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  DECOMMISSIONED: {
    label: 'Decommissioned',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

interface AssetStatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

export function AssetStatusBadge({ status, className }: AssetStatusBadgeProps) {
  const config = assetStatusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
