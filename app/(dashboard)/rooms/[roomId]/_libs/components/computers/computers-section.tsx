"use client";

import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ComputersTable } from "./computers-table.client";
import { ComputerFormDialog } from "./computer-form-dialog";
import { useAssetDialog } from "../../hooks/use-asset-dialog";
import type { TComputer } from "@/types/api";

interface ComputersSectionProps {
  buildingId: string;
  roomId:     string;
  computers:  TComputer[];
  canEdit:    boolean;
}

export function ComputersSection({ buildingId, roomId, computers, canEdit }: ComputersSectionProps) {
  const queryClient = useQueryClient();
  const dialog      = useAssetDialog<TComputer>();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.buildings.room(roomId) });

  return (
    <>
      <ComputersTable
        buildingId={buildingId}
        roomId={roomId}
        computers={computers}
        canEdit={canEdit}
        onEdit={dialog.openEdit}
        onAdd={dialog.openCreate}
      />

      <ComputerFormDialog
        open={dialog.open}
        onOpenChange={(open) => { if (!open) dialog.close(); }}
        buildingId={buildingId}
        roomId={roomId}
        editTarget={dialog.editTarget}
        onClose={() => dialog.close(invalidate)}
      />
    </>
  );
}
