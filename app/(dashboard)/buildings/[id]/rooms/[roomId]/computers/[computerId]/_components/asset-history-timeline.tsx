"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { TAssetHistory } from "@/types/api";
import { useDeleteAssetHistory } from "@/hooks/use-computers";

interface AssetHistoryTimelineProps {
  computerId: string;
  history: TAssetHistory[];
  canEdit: boolean;
}

const actionColors: Record<string, string> = {
  CREATED: "bg-green-100 text-green-800 border-green-200",
  UPDATED: "bg-blue-100 text-blue-800 border-blue-200",
  DELETED: "bg-red-100 text-red-800 border-red-200",
};

const SYSTEM_ACTIONS = new Set(["CREATED", "UPDATED", "DELETED"]);

export function AssetHistoryTimeline({
  computerId,
  history,
  canEdit,
}: AssetHistoryTimelineProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const deleteHistory = useDeleteAssetHistory(computerId);

  const allSelected = useMemo(
    () => history.length > 0 && selectedIds.length === history.length,
    [history.length, selectedIds.length],
  );

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      if (checked) {
        if (previous.includes(id)) return previous;
        return [...previous, id];
      }

      return previous.filter((selectedId) => selectedId !== id);
    });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(history.map((entry) => entry.id));
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one history record");
      return;
    }

    deleteHistory.mutate(selectedIds, {
      onSuccess: () => {
        toast.success("Selected history deleted");
        setSelectedIds([]);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete selected history",
        );
      },
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((previous) =>
      previous.includes(id)
        ? previous.filter((entryId) => entryId !== id)
        : [...previous, id],
    );
  };

  const renderDiff = (diff: Record<string, unknown> | null) => {
    if (!diff || Object.keys(diff).length === 0) return null;

    const entries = Object.entries(diff).filter(([, value]) => {
      if (!value || typeof value !== "object") return false;
      const typedValue = value as {
        before?: unknown;
        old?: unknown;
        after?: unknown;
        new?: unknown;
      };
      return (
        "before" in typedValue ||
        "old" in typedValue ||
        "after" in typedValue ||
        "new" in typedValue
      );
    });

    if (entries.length === 0) {
      return (
        <div className="mt-2 rounded-md bg-muted p-2 text-xs">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(diff, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="mt-2 rounded-md bg-muted p-2 text-xs space-y-1">
        {entries.map(([field, value]) => {
          const typedValue = value as {
            before?: string;
            old?: string;
            after?: string;
            new?: string;
          };

          return (
            <p key={field}>
              <span className="font-medium">{field}</span>:{" "}
              {field === "UpdatedAt" ? (
                <>
                  {new Date(
                    typedValue.before ?? typedValue.old ?? "-",
                  ).toLocaleString()}
                  {" → "}
                  {new Date(
                    typedValue.after ?? typedValue.new ?? "-",
                  ).toLocaleString()}
                </>
              ) : (
                <>
                  {typedValue.before ?? typedValue.old ?? "-"} →{" "}
                  {typedValue.after ?? typedValue.new ?? "-"}
                </>
              )}
            </p>
          );
        })}
      </div>
    );
  };

  const hasUsefulSnapshot = (snapshot: Record<string, unknown>) => {
    const keys = Object.keys(snapshot || {});
    if (keys.length === 0) return false;
    if (keys.length === 1 && keys[0] === "note") return Boolean(snapshot.note);
    return true;
  };

  const canShowDetails = (entry: TAssetHistory) => {
    const hasDiff = !!entry.diff && Object.keys(entry.diff).length > 0;
    const hasSnapshot = hasUsefulSnapshot(entry.snapshot || {});
    return hasDiff || hasSnapshot;
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No history available</p>
        </CardContent>
      </Card>
    );
  }

const renderFormattedObject = (
  data: Record<string, unknown> | null | undefined,
  isNested = false
) => {
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return <p className="text-muted-foreground italic">No data available</p>;
  }

  // Filter out the "Computer" relational object
  const entries = Object.entries(data).filter(
    ([key]) => key.toLowerCase() !== "computer"
  );

  if (entries.length === 0) {
    return <p className="text-muted-foreground italic">No data available</p>;
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 ${
        !isNested ? "rounded-md bg-muted/50 p-3" : ""
      }`}
    >
      {entries.map(([key, value]) => {
        let displayValue: React.ReactNode;
        let spanFull = false;

        if (value === null || value === undefined || value === "") {
          displayValue = <span className="text-muted-foreground">-</span>;
        } else if (typeof value === "boolean") {
          displayValue = (
            <Badge
              variant={value ? "outline" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4"
            >
              {value ? "True" : "False"}
            </Badge>
          );
        } else if (
          (key.endsWith("At") || key.toLowerCase().includes("date")) &&
          typeof value === "string" &&
          !isNaN(Date.parse(value))
        ) {
          displayValue = new Date(value).toLocaleString();
        } else if (Array.isArray(value)) {
          spanFull = value.length > 0;
          displayValue = value.length === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              {value.map((item, idx) => (
                <div key={idx} className="rounded-md border bg-background/50 p-2">
                  {typeof item === "object" && item !== null
                    ? renderFormattedObject(item as Record<string, unknown>, true)
                    : String(item)}
                </div>
              ))}
            </div>
          );
        } else if (typeof value === "object") {
          spanFull = true;
          displayValue = (
            <div className="mt-1 rounded-md border bg-background/50 p-2">
              {renderFormattedObject(value as Record<string, unknown>, true)}
            </div>
          );
        } else {
          displayValue = String(value);
        }

        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

        return (
          <div
            key={key}
            className={`flex flex-col text-xs ${
              spanFull ? "col-span-full" : ""
            }`}
          >
            <span className="font-semibold text-muted-foreground text-[11px]">
              {formattedKey}
            </span>
            <div className="break-words font-medium">{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
};

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Asset History</CardTitle>
        {canEdit && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                aria-label="Select all history records"
                className="cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">Select all</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteHistory.isPending || selectedIds.length === 0}
              onClick={handleDeleteSelected}
              className="cursor-pointer"
            >
              {deleteHistory.isPending
                ? "Deleting..."
                : `Delete Selected (${selectedIds.length})`}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          <div className="absolute left-4 top-0 h-full w-px bg-border" />
          {history.map((entry) => (
            <div key={entry.id} className="relative flex gap-4 pl-10">
              {canEdit && (
                <div className="absolute -left-3 top-0.5">
                  <Checkbox
                    checked={selectedIds.includes(entry.id)}
                    onCheckedChange={(checked) =>
                      toggleSelection(entry.id, Boolean(checked))
                    }
                    aria-label={`Select history ${entry.id}`}
                    className="cursor-pointer"
                  />
                </div>
              )}
              <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {SYSTEM_ACTIONS.has(entry.action) ? (
                    <Badge
                      variant="outline"
                      className={
                        actionColors[entry.action] +
                          " whitespace-break-spaces" || ""
                      }
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
                <p className="mt-1 text-sm">
                  {" "}
                  <span className="font-medium">{entry.changedBy.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({entry.changedBy.role})
                  </span>
                </p>
                {renderDiff(entry.diff)}
                {canShowDetails(entry) && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => toggleExpanded(entry.id)}
                    >
                      {expandedIds.includes(entry.id)
                        ? "Hide details"
                        : "View details"}
                    </Button>
                  </div>
                )}
                {canShowDetails(entry) && expandedIds.includes(entry.id) && (
                  <div className="mt-2 space-y-3 rounded-md border bg-muted/20 p-3 text-xs">
                    {entry.snapshot &&
                      Object.keys(entry.snapshot).length > 0 && (
                        <div>
                          <p className="mb-2 font-semibold text-foreground">
                            Snapshot Details
                          </p>
                          {renderFormattedObject(entry.snapshot)}
                        </div>
                      )}
                    {entry.diff && Object.keys(entry.diff).length > 0 && (
                      <div>
                        <p className="mb-2 font-semibold text-foreground">
                          Raw Diff Data
                        </p>
                        {renderFormattedObject(entry.diff)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
