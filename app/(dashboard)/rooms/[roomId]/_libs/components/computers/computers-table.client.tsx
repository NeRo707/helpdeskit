"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { AssetStatusBadge } from "@/components/asset-status-badge";
import type { TComputer } from "@/types/api";

interface ComputersTableProps {
  buildingId: string;
  roomId:     string;
  computers:  TComputer[];
  canEdit:    boolean;
  onAdd:      () => void;
  onEdit:     (computer: TComputer) => void;
}

export function ComputersTable({
  buildingId,
  roomId,
  computers,
  canEdit,
  onAdd,
  onEdit,
}: ComputersTableProps) {
  const router = useRouter();

  const columns = useMemo<Column<TComputer>[]>(() => [
    { header: "Hostname",    accessor: "hostname" },
    { header: "IP Address",  accessor: (r) => r.ipAddress ?? "-" },
    { header: "OS",          accessor: (r) => r.os ?? "-" },
    { header: "Status",      accessor: (r) => <AssetStatusBadge status={r.status} /> },
    { header: "Peripherals", accessor: (r) => r._count?.peripherals ?? r.peripherals?.length ?? 0 },
    ...(canEdit ? [{
      header: "Actions",
      accessor: (r: TComputer) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(r)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    }] : []),
  ], [canEdit, onEdit]);

  return (
    <>
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <Button onClick={onAdd}>
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
    </>
  );
}
