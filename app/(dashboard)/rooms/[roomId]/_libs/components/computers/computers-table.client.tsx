"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { AssetStatusBadge } from "@/components/asset-status-badge";
import { ComputerFormDialog } from "./computer-form-dialog";
import type { TComputer } from "@/types/api";
import { useAssetDialog } from "../../hooks/use-asset-dialog";

interface ComputersTableProps {
  buildingId: string;
  roomId:     string;
  computers:  TComputer[];
  canEdit:    boolean;
}

export function ComputersTable({ buildingId, roomId, computers, canEdit }: ComputersTableProps) {
  const router = useRouter();
  const dialog = useAssetDialog<TComputer>();

  const columns: Column<TComputer>[] = [
    { header: "Hostname",    accessor: "hostname" },
    { header: "IP Address",  accessor: (r) => r.ipAddress ?? "-" },
    { header: "OS",          accessor: (r) => r.os ?? "-" },
    { header: "Status",      accessor: (r) => <AssetStatusBadge status={r.status} /> },
    { header: "Peripherals", accessor: (r) => r._count?.peripherals ?? r.peripherals?.length ?? 0 },
    ...(canEdit ? [{
      header: "Actions",
      accessor: (r: TComputer) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => dialog.openEdit(r)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <Button onClick={dialog.openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Computer
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={computers}
        onRowClick={(r) => router.push(`/computers/${r.id}`)}
        emptyMessage="No computers found"
      />

      <ComputerFormDialog
        open={dialog.open}
        onOpenChange={(o) => (o ? dialog.setOpen(true) : dialog.close())}
        buildingId={buildingId}
        roomId={roomId}
        editTarget={dialog.editTarget}
        onClose={dialog.close}
      />
    </>
  );
}
