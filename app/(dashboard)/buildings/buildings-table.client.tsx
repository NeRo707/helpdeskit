"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useBuildings } from "@/hooks/use-buildings";
import { CreateBuildingDialog } from "./_libs/components/create-building-dialog";
import { BuildingCard } from "./_libs/components/building-card";

export function BuildingsTable() {
  const { data: buildings = [], isPending, isError } = useBuildings();

  if (isError) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load buildings. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateBuildingDialog />
      </div>

      {isPending && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded border" />
          ))}
        </div>
      )}

      {!isPending && buildings.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No buildings yet
        </div>
      )}

      {!isPending && buildings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {buildings.map((building) => (
            <BuildingCard
              key={building.id}
              building={building}
            />
          ))}
        </div>
      )}
    </div>
  );
}
