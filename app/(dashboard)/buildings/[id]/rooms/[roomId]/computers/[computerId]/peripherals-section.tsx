"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { DataTable, type Column } from "@/components/data-table";
import { AssetStatusBadge } from "@/components/asset-status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Peripheral, PeripheralType, AssetStatus } from "@/types/api";

const PERIPHERAL_TYPES: PeripheralType[] = [
  "MONITOR",
  "KEYBOARD",
  "MOUSE",
  "PRINTER",
  "SCANNER",
  "WEBCAM",
  "HEADSET",
  "USB_HUB",
  "DOCKING_STATION",
  "OTHER",
];

interface PeripheralsSectionProps {
  buildingId: string;
  roomId: string;
  computerId: string;
  peripherals: Peripheral[];
  canEdit: boolean;
}

export function PeripheralsSection({
  buildingId,
  roomId,
  computerId,
  peripherals,
  canEdit,
}: PeripheralsSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editPeripheral, setEditPeripheral] = useState<Peripheral | null>(null);
  const [deletePeripheral, setDeletePeripheral] = useState<Peripheral | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [type, setType] = useState<PeripheralType>("MONITOR");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<AssetStatus>("ACTIVE");

  const columns: Column<Peripheral>[] = [
    {
      header: "Type",
      accessor: (row) => row.type.replace("_", " "),
    },
    { header: "Brand", accessor: (row) => row.brand || "—" },
    { header: "Model", accessor: (row) => row.model || "—" },
    { header: "Serial Number", accessor: (row) => row.serialNumber || "—" },
    {
      header: "Status",
      accessor: (row) => <AssetStatusBadge status={row.status} />,
    },
    ...(canEdit
      ? [
          {
            header: "Actions",
            accessor: (row: Peripheral) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(row)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletePeripheral(row)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleEdit = (peripheral: Peripheral) => {
    setEditPeripheral(peripheral);
    setType(peripheral.type);
    setBrand(peripheral.brand || "");
    setModel(peripheral.model || "");
    setSerialNumber(peripheral.serialNumber || "");
    setStatus(peripheral.status);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditPeripheral(null);
    setType("MONITOR");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setStatus("ACTIVE");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editPeripheral
        ? `/api/buildings/${buildingId}/rooms/${roomId}/computers/${computerId}/peripherals/${editPeripheral.id}`
        : `/api/buildings/${buildingId}/rooms/${roomId}/computers/${computerId}/peripherals`;
      const method = editPeripheral ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          brand: brand || null,
          model: model || null,
          serialNumber: serialNumber || null,
          status,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save peripheral");
      }

      toast.success(editPeripheral ? "Peripheral updated" : "Peripheral added");
      handleClose();
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save peripheral",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePeripheral) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/buildings/${buildingId}/rooms/${roomId}/computers/${computerId}/peripherals/${deletePeripheral.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete peripheral");
      }

      toast.success("Peripheral deleted");
      setDeletePeripheral(null);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete peripheral",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8 bg-transparent border-0">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle>Peripherals</CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Peripheral
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editPeripheral ? "Edit Peripheral" : "Add Peripheral"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="peripheral-type">Type</FieldLabel>
                    <Select
                      value={type}
                      onValueChange={(v) => setType(v as PeripheralType)}
                    >
                      <SelectTrigger id="peripheral-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIPHERAL_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="peripheral-brand">Brand</FieldLabel>
                    <Input
                      id="peripheral-brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g., Dell, Logitech"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="peripheral-model">Model</FieldLabel>
                    <Input
                      id="peripheral-model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Model name"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="peripheral-serial">
                      Serial Number
                    </FieldLabel>
                    <Input
                      id="peripheral-serial"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Serial number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="peripheral-status">Status</FieldLabel>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as AssetStatus)}
                    >
                      <SelectTrigger id="peripheral-status">
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
                    {loading ? "Saving..." : editPeripheral ? "Update" : "Add"}
                  </Button>
                </FieldGroup>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <DataTable
        columns={columns}
        data={peripherals}
        emptyMessage="No peripherals attached"
      />

      <ConfirmDialog
        open={!!deletePeripheral}
        onOpenChange={(o) => !o && setDeletePeripheral(null)}
        title="Delete Peripheral"
        description={`Are you sure you want to delete this ${deletePeripheral?.type.replace("_", " ").toLowerCase()}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Card>
  );
}
