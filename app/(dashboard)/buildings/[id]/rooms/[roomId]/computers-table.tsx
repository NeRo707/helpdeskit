"use client";

/**
 * ComputersTable - receives computers from the parent's useRoom() cache.
 * Mutations use useUpsertComputer which invalidates the room query on success,
 * triggering an automatic background refetch - no router.refresh() needed.
 */

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
import type { TComputer, TAssetStatus } from "@/types/api";
import { useUpsertComputer } from "@/hooks/use-buildings";

interface ComputersTableProps {
  buildingId: string;
  roomId: string;
  computers: TComputer[];
  canEdit: boolean;
}

export function ComputersTable({
  buildingId,
  roomId,
  computers,
  canEdit,
}: ComputersTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editComputer, setEditComputer] = useState<TComputer | null>(null);

  // Form state
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [os, setOs] = useState("");
  const [status, setStatus] = useState<TAssetStatus>("ACTIVE");

  // Single mutation covers both create (no computerId) and update (with computerId)
  const upsert = useUpsertComputer(buildingId, roomId);

  const columns: Column<TComputer>[] = [
    { header: "Hostname", accessor: "hostname" },
    { header: "IP Address", accessor: (row) => row.ipAddress || "-" },
    { header: "OS", accessor: (row) => row.os || "-" },
    {
      header: "Status",
      accessor: (row) => <AssetStatusBadge status={row.status} />,
    },
    {
      header: "Peripherals",
      accessor: (row) => row._count?.peripherals ?? row.peripherals?.length ?? 0,
    },
    ...(canEdit
      ? [
          {
            header: "Actions",
            accessor: (row: TComputer) => (
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

  const handleRowClick = (computer: TComputer) => {
    router.push(
      `/buildings/${buildingId}/rooms/${roomId}/computers/${computer.id}`,
    );
  };

  const handleEdit = (computer: TComputer) => {
    setEditComputer(computer);
    setHostname(computer.hostname);
    setIpAddress(computer.ipAddress || "");
    setMacAddress(computer.macAddress || "");
    setOs(computer.os || "");
    setStatus(computer.status);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditComputer(null);
    setHostname("");
    setIpAddress("");
    setMacAddress("");
    setOs("");
    setStatus("ACTIVE");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert.mutate(
      {
        computerId: editComputer?.id,
        data: {
          hostname,
          ipAddress: ipAddress || null,
          macAddress: macAddress || null,
          os: os || null,
          status,
        },
      },
      {
        onSuccess: () => {
          toast.success(editComputer ? "Computer updated" : "Computer created");
          handleClose();
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save computer"),
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
                Add Computer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editComputer ? "Edit Computer" : "Add New Computer"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="computer-hostname">Hostname</FieldLabel>
                    <Input
                      id="computer-hostname"
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value)}
                      placeholder="Hostname"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="computer-ip">IP Address</FieldLabel>
                    <Input
                      id="computer-ip"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="IP Address (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="computer-mac">MAC Address</FieldLabel>
                    <Input
                      id="computer-mac"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      placeholder="MAC Address (optional)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="computer-os">Operating System</FieldLabel>
                    <Input
                      id="computer-os"
                      value={os}
                      onChange={(e) => setOs(e.target.value)}
                      placeholder="e.g., Windows 11, Ubuntu 22.04"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="computer-status">Status</FieldLabel>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as TAssetStatus)}
                    >
                      <SelectTrigger id="computer-status">
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
                    {upsert.isPending ? "Saving..." : editComputer ? "Update" : "Create"}
                  </Button>
                </FieldGroup>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <DataTable
        columns={columns}
        data={computers}
        onRowClick={handleRowClick}
        emptyMessage="No computers found"
      />
    </div>
  );
}
