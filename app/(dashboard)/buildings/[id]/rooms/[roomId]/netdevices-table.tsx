"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { DataTable, type Column } from "@/components/data-table";
import { AssetStatusBadge } from "@/components/asset-status-badge";
import type { TAssetStatus, TNetworkDevice } from "@/types/api";
import { useUpsertNetworkDevice } from "@/hooks/use-buildings";

interface NetworkDevicesTableProps {
  buildingId: string;
  roomId: string;
  networkDevices: TNetworkDevice[];
  canEdit: boolean;
}

export function NetworkDevicesTable({
  buildingId,
  roomId,
  networkDevices,
  canEdit,
}: NetworkDevicesTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<TNetworkDevice | null>(null);

  // Form state
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<TAssetStatus>("ACTIVE");

  const upsert = useUpsertNetworkDevice(buildingId, roomId);

  const columns: Column<TNetworkDevice>[] = [
    { header: "Type", accessor: (row) => row.type || "-" },
    { header: "Brand", accessor: (row) => row.brand || "-" },
    { header: "Model", accessor: (row) => row.model || "-" },
    {
      header: "Status",
      accessor: (row) => <AssetStatusBadge status={row.status} />,
    },
    { header: "Hostname", accessor: (row) => row.hostname || "-" },
    { header: "IP Address", accessor: (row) => row.ipAddress || "-" },
    { header: "Serial Number", accessor: (row) => row.serialNumber || "-" },
    ...(canEdit
      ? [
          {
            header: "Actions",
            accessor: (row: TNetworkDevice) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(row)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleRowClick = (device: TNetworkDevice) => {
    router.push(
      `/buildings/${buildingId}/rooms/${roomId}/netdevices/${device.id}`,
    );
  };

  const handleEdit = (device: TNetworkDevice) => {
    setEditDevice(device);
    setHostname(device.hostname || "");
    setIpAddress(device.ipAddress || "");
    setMacAddress(device.macAddress || "");
    setType(device.type || "");
    setBrand(device.brand || "");
    setModel(device.model || "");
    setSerialNumber(device.serialNumber || "");
    setStatus(device.status);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditDevice(null);
    setHostname("");
    setIpAddress("");
    setMacAddress("");
    setType("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setStatus("ACTIVE");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert.mutate(
      {
        deviceId: editDevice?.id,
        data: {
          hostname,
          ipAddress: ipAddress || null,
          macAddress: macAddress || null,
          type: type || null,
          brand: brand || null,
          model: model || null,
          serialNumber: serialNumber || null,
          status,
        },
      },
      {
        onSuccess: () => {
          toast.success(editDevice ? "Network device updated" : "Network device created");
          handleClose();
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save network device"),
      },
    );
  };

  return (
    <div>
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Network Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editDevice ? "Edit Network Device" : "Add New Network Device"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="nd-type">Type</FieldLabel>
                    <Input
                      id="nd-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="e.g., Switch, Router (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-brand">Brand</FieldLabel>
                    <Input
                      id="nd-brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g., Cisco (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-model">Model</FieldLabel>
                    <Input
                      id="nd-model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Model (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-hostname">Hostname</FieldLabel>
                    <Input
                      id="nd-hostname"
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value)}
                      placeholder="Hostname"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-ip">IP Address</FieldLabel>
                    <Input
                      id="nd-ip"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="IP Address (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-mac">MAC Address</FieldLabel>
                    <Input
                      id="nd-mac"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      placeholder="MAC Address (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-serial">Serial Number</FieldLabel>
                    <Input
                      id="nd-serial"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Serial Number (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nd-status">Status</FieldLabel>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as TAssetStatus)}
                    >
                      <SelectTrigger id="nd-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                        <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button type="submit" className="w-full" disabled={upsert.isPending}>
                    {upsert.isPending
                      ? "Saving..."
                      : editDevice
                        ? "Update"
                        : "Create"}
                  </Button>
                </FieldGroup>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <DataTable
        columns={columns}
        data={networkDevices}
        onRowClick={handleRowClick}
        emptyMessage="No network devices found"
      />
    </div>
  );
}
