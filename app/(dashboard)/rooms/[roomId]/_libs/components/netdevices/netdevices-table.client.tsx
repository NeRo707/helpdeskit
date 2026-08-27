"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { AssetStatusBadge } from "@/components/asset-status-badge";
import { NetworkDeviceFormDialog } from "./netdevice-form-dialog";
import type { TNetworkDevice } from "@/types/api";
import { useAssetDialog } from "../../hooks/use-asset-dialog";

interface NetworkDevicesTableProps {
  buildingId:     string;
  roomId:         string;
  networkDevices: TNetworkDevice[];
  canEdit:        boolean;
}

export function NetworkDevicesTable({ buildingId, roomId, networkDevices, canEdit }: NetworkDevicesTableProps) {
  const router = useRouter();
  const dialog = useAssetDialog<TNetworkDevice>();

  const columns: Column<TNetworkDevice>[] = [
    { header: "Type",          accessor: (r) => r.type         ?? "-" },
    { header: "Brand",         accessor: (r) => r.brand        ?? "-" },
    { header: "Model",         accessor: (r) => r.model        ?? "-" },
    { header: "Status",        accessor: (r) => <AssetStatusBadge status={r.status} /> },
    { header: "Hostname",      accessor: (r) => r.hostname      ?? "-" },
    { header: "IP Address",    accessor: (r) => r.ipAddress    ?? "-" },
    { header: "Serial Number", accessor: (r) => r.serialNumber ?? "-" },
    ...(canEdit ? [{
      header: "Actions",
      accessor: (r: TNetworkDevice) => (
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
            <Plus className="mr-2 h-4 w-4" /> Add Network Device
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={networkDevices}
        onRowClick={(r) => router.push(`/netdevices/${r.id}`)}
        emptyMessage="No network devices found"
      />

      <NetworkDeviceFormDialog
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
