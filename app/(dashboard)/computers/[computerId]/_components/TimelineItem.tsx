import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { TAssetHistory } from "@/types/api";
import { TimelineDiff } from "./TimelineDiff";

const ACTION_STYLES: Record<string, string> = {
  CREATED: "bg-green-100 text-green-800 border-green-200",
  UPDATED: "bg-blue-100 text-blue-800 border-blue-200",
  DELETED: "bg-red-100 text-red-800 border-red-200",
};

const SYSTEM_ACTIONS = new Set(["CREATED", "UPDATED", "DELETED"]);

interface TimelineItemProps {
  entry: TAssetHistory;
  canEdit: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
}

export function TimelineItem({
  entry,
  canEdit,
  isSelected,
  onToggleSelect,
}: TimelineItemProps) {

  return (
    <div className="relative flex gap-4 pl-10">
      {canEdit && (
        <div className="absolute -left-3 top-0.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onToggleSelect(entry.id, Boolean(checked))
            }
            aria-label={`Select history entry ${entry.id}`}
            className="cursor-pointer"
          />
        </div>
      )}

      <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />

      <div className="flex-1 pb-4">
        {/* Header: action badge + timestamp */}
        <div className="flex items-center gap-2 flex-wrap">
          {SYSTEM_ACTIONS.has(entry.action) ? (
            <Badge
              variant="outline"
              className={ACTION_STYLES[entry.action] ?? ""}
            >
              {entry.action}
            </Badge>
          ) : (
            <span className="text-sm font-medium">{entry.action}</span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(entry.changedAt).toLocaleString()}
          </span>
        </div>

        {/* Who made the change */}
        <p className="mt-1 text-sm">
          <span className="font-medium">{entry.changedBy.name}</span>
          <span className="text-muted-foreground">
            {" "}
            ({entry.changedBy.role})
          </span>
        </p>

        {/* Entity Context (useful for Peripheral changes on the Computer timeline) */}
        {entry.entityType === "PERIPHERAL" && (
          <p className="mt-1 text-xs text-muted-foreground font-medium flex items-center gap-1">
            <span className="bg-muted px-1.5 py-0.5 rounded">Peripheral</span>
            {entry.entityId}
          </p>
        )}

        {/* Diff (for system actions) */}
        <TimelineDiff diff={entry.diff} />
      </div>
    </div>
  );
}
