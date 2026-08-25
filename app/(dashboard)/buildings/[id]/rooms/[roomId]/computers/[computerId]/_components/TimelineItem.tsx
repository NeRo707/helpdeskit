import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { TAssetHistory } from "@/types/api";
import { TimelineDiff } from "./TimelineDiff";
import { FormattedObjectViewer } from "./FormattedObjectViewer";

const actionColors: Record<string, string> = {
  CREATED: "bg-green-100 text-green-800 border-green-200",
  UPDATED: "bg-blue-100 text-blue-800 border-blue-200",
  DELETED: "bg-red-100 text-red-800 border-red-200",
};

const SYSTEM_ACTIONS = new Set(["CREATED", "UPDATED", "DELETED"]);

// Move utility functions outside the component body
const hasUsefulSnapshot = (snapshot: Record<string, unknown>) => {
  const keys = Object.keys(snapshot || {});
  if (keys.length === 0) return false;
  if (keys.length === 1 && keys[0] === "note") return Boolean(snapshot.note);
  return true;
};

const canShowDetails = (entry: TAssetHistory) => {
  const hasDiff = !!entry.diff && Object.keys(entry.diff).length > 0;
  return hasDiff || hasUsefulSnapshot(entry.snapshot || {});
};

interface TimelineItemProps {
  entry: TAssetHistory;
  canEdit: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleExpand: (id: string) => void;
}

export function TimelineItem({
  entry,
  canEdit,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
}: TimelineItemProps) {
  const showDetails = canShowDetails(entry);

  return (
    <div className="relative flex gap-4 pl-10">
      {canEdit && (
        <div className="absolute -left-3 top-0.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggleSelect(entry.id, Boolean(checked))}
            aria-label={`Select history ${entry.id}`}
            className="cursor-pointer"
          />
        </div>
      )}

      <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />

      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {SYSTEM_ACTIONS.has(entry.action) ? (
            <Badge variant="outline" className={`${actionColors[entry.action] || ""} whitespace-break-spaces`}>
              {entry.action}
            </Badge>
          ) : (
            <span className="text-sm font-medium">{entry.action}</span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(entry.changedAt).toLocaleString()}
          </span>
        </div>

        <p className="mt-1 text-sm">
          <span className="font-medium">{entry.changedBy.name}</span>
          <span className="text-muted-foreground"> ({entry.changedBy.role})</span>
        </p>

        <TimelineDiff diff={entry.diff} />

        {showDetails && (
          <div className="mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onToggleExpand(entry.id)}
            >
              {isExpanded ? "Hide details" : "View details"}
            </Button>
          </div>
        )}

        {showDetails && isExpanded && (
          <div className="mt-2 space-y-3 rounded-md border bg-muted/20 p-3 text-xs">
            {entry.snapshot && Object.keys(entry.snapshot).length > 0 && (
              <div>
                <p className="mb-2 font-semibold text-foreground">Snapshot Details</p>
                <FormattedObjectViewer data={entry.snapshot} />
              </div>
            )}
            {entry.diff && Object.keys(entry.diff).length > 0 && (
              <div>
                <p className="mb-2 font-semibold text-foreground">Raw Diff Data</p>
                <FormattedObjectViewer data={entry.diff} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
