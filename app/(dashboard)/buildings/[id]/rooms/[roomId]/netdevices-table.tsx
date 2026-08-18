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
import { Row } from "react-day-picker";

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
  const [editNetworkDevice, setEditNetworkDevice] =
    useState<TNetworkDevice | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [os, setOs] = useState("");
  const [status, setStatus] = useState<TAssetStatus>("ACTIVE");

  const columns: Column<TNetworkDevice>[] = [
    { header: "Type", accessor: (row) => row.type || "—" },
    { header: "Brand", accessor: (row) => row.brand || "—" },
    { header: "Model", accessor: (row) => row.model || "—" },
    {
      header: "Status",
      accessor: (row) => <AssetStatusBadge status={row.status} />,
    },
    { header: "Hostname", accessor: (row) => row.hostname || "—" },
    { header: "IP Address", accessor: (row) => row.ipAddress || "—" },
    { header: "Serial Number", accessor: (row) => row.serialNumber || "—" },

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

  const handleRowClick = (networkDevice: TNetworkDevice) => {
    router.push(
      `/buildings/${buildingId}/rooms/${roomId}/netdevices/${networkDevice.id}`,
    );
  };

  const handleEdit = (networkDevice: TNetworkDevice) => {
    setEditNetworkDevice(networkDevice);
    setHostname(networkDevice.hostname || "");
    setIpAddress(networkDevice.ipAddress || "");
    setMacAddress(networkDevice.macAddress || "");
    setStatus(networkDevice.status);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditNetworkDevice(null);
    setHostname("");
    setIpAddress("");
    setMacAddress("");
    setOs("");
    setStatus("ACTIVE");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editNetworkDevice
        ? `/api/buildings/${buildingId}/rooms/${roomId}/netdevices/${editNetworkDevice.id}`
        : `/api/buildings/${buildingId}/rooms/${roomId}/netdevices`;
      const method = editNetworkDevice ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostname,
          ipAddress: ipAddress || null,
          macAddress: macAddress || null,
          os: os || null,
          status,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save network device");
      }

      toast.success(
        editNetworkDevice ? "Network device updated" : "Network device created",
      );
      handleClose();
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save network device",
      );
    } finally {
      setLoading(false);
    }
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
                  {editNetworkDevice
                    ? "Edit Network Device"
                    : "Add New Network Device"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="network-device-hostname">
                      Hostname
                    </FieldLabel>
                    <Input
                      id="network-device-hostname"
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value)}
                      placeholder="Hostname"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="network-device-ip">
                      IP Address
                    </FieldLabel>
                    <Input
                      id="network-device-ip"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="IP Address (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="network-device-mac">
                      MAC Address
                    </FieldLabel>
                    <Input
                      id="network-device-mac"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      placeholder="MAC Address (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="network-device-os">
                      Operating System
                    </FieldLabel>
                    <Input
                      id="network-device-os"
                      value={os}
                      onChange={(e) => setOs(e.target.value)}
                      placeholder="e.g., Windows 11, Ubuntu 22.04"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="network-device-status">
                      Status
                    </FieldLabel>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as TAssetStatus)}
                    >
                      <SelectTrigger id="network-device-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="UNDER_MAINTENANCE">
                          Under Maintenance
                        </SelectItem>
                        <SelectItem value="DECOMMISSIONED">
                          Decommissioned
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Saving..."
                      : editNetworkDevice
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
