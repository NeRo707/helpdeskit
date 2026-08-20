"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { TAssetHistory } from "@/types/api";

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
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

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

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one history record");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/computers/${computerId}/history`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete selected history");
      }

      toast.success("Selected history deleted");
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete selected history",
      );
    } finally {
      setDeleting(false);
    }
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
      const typedValue = value as Record<string, unknown>;
      return "before" in typedValue || "after" in typedValue;
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
          const typedValue = value as { before?: unknown; after?: unknown };
          return (
            <p key={field}>
              <span className="font-medium">{field}</span>:{" "}
              {String(typedValue.before ?? "-")} →{" "}
              {String(typedValue.after ?? "-")}
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
              disabled={deleting || selectedIds.length === 0}
              onClick={handleDeleteSelected}
              className="cursor-pointer"
            >
              {deleting
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
                  <div className="mt-2 grid gap-2 rounded-md border bg-muted/30 p-3 text-xs">
                    <div>
                      <p className="mb-1 font-medium">Snapshot</p>
                      <pre className="whitespace-pre-wrap rounded bg-muted p-2">
                        {JSON.stringify(entry.snapshot, null, 2)}
                      </pre>
                    </div>
                    {entry.diff && (
                      <div>
                        <p className="mb-1 font-medium">Diff</p>
                        <pre className="whitespace-pre-wrap rounded bg-muted p-2">
                          {JSON.stringify(entry.diff, null, 2)}
                        </pre>
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
