"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { TAssetHistory } from "@/types/api";
import { useDeleteAssetHistory } from "@/hooks/use-computers";
import { TimelineItem } from "./TimelineItem";

interface AssetHistoryTimelineProps {
  computerId: string;
  history: TAssetHistory[];
  canEdit: boolean;
}

export function AssetHistoryTimeline({ computerId, history, canEdit }: AssetHistoryTimelineProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const deleteHistory = useDeleteAssetHistory(computerId);

  const allSelected = useMemo(
    () => history.length > 0 && selectedIds.length === history.length,
    [history.length, selectedIds.length]
  );

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((sId) => sId !== id)
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? history.map((entry) => entry.id) : []);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return toast.error("Select at least one history record");

    deleteHistory.mutate(selectedIds, {
      onSuccess: () => {
        toast.success("Selected history deleted");
        setSelectedIds([]);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to delete selected history");
      },
    });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Asset History</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No history available</p></CardContent>
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
              disabled={deleteHistory.isPending || selectedIds.length === 0}
              onClick={handleDeleteSelected}
            >
              {deleteHistory.isPending ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="relative space-y-4">
          <div className="absolute left-4 top-0 h-full w-px bg-border" />
          {history.map((entry) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              canEdit={canEdit}
              isSelected={selectedIds.includes(entry.id)}
              isExpanded={expandedIds.includes(entry.id)}
              onToggleSelect={toggleSelection}
              onToggleExpand={toggleExpanded}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
