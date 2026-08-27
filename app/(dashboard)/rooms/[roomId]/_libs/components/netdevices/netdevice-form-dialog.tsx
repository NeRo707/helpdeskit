"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "../form-field";
import type { TNetworkDevice } from "@/types/api";
import { useNetworkDeviceForm } from "../../hooks/use-network-device-form";

interface NetworkDeviceFormDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  buildingId:   string;
  roomId:       string;
  editTarget:   TNetworkDevice | null;
  onClose:      () => void;
}

export function NetworkDeviceFormDialog({
  open,
  onOpenChange,
  buildingId,
  roomId,
  editTarget,
  onClose,
}: NetworkDeviceFormDialogProps) {
  const { form, isEditing, isPending, onSubmit } = useNetworkDeviceForm({
    buildingId,
    roomId,
    editTarget,
    onClose,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Network Device" : "Add New Network Device"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <FormField control={form.control} name="type"         id="nd-type"     label="Type"          type="text" placeholder="e.g. Switch, Router (optional)" />
            <FormField control={form.control} name="brand"        id="nd-brand"    label="Brand"         type="text" placeholder="e.g. Cisco (optional)" />
            <FormField control={form.control} name="model"        id="nd-model"    label="Model"         type="text" placeholder="Model (optional)" />
            <FormField control={form.control} name="hostname"     id="nd-hostname" label="Hostname"      type="text" placeholder="Hostname" required />
            <FormField control={form.control} name="ipAddress"    id="nd-ip"       label="IP Address"    type="text" placeholder="IP Address (optional)" />
            <FormField control={form.control} name="macAddress"   id="nd-mac"      label="MAC Address"   type="text" placeholder="MAC Address (optional)" />
            <FormField control={form.control} name="serialNumber" id="nd-serial"   label="Serial Number" type="text" placeholder="Serial Number (optional)" />
            <FormField control={form.control} name="status"       id="nd-status"   label="Status"        type="status" />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
