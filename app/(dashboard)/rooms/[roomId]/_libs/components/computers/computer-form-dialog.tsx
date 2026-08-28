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
import type { TComputer } from "@/types/api";
import { useComputerForm } from "../../hooks/use-computer-form";

interface ComputerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  roomId: string;
  editTarget: TComputer | null;
  onClose: () => void;
}

export function ComputerFormDialog({
  open,
  onOpenChange,
  buildingId,
  roomId,
  editTarget,
  onClose,
}: ComputerFormDialogProps) {
  const { form, isEditing, isPending, onSubmit } = useComputerForm({
    buildingId,
    roomId,
    editTarget,
    onClose,
  });

  let buttonLabel = "Create";
  if (isPending) {
    buttonLabel = "Saving...";
  } else if (isEditing) {
    buttonLabel = "Update";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Computer" : "Add New Computer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <FormField
              control={form.control}
              name="hostname"
              id="computer-hostname"
              label="Hostname"
              type="text"
              placeholder="Hostname"
              required
            />
            <FormField
              control={form.control}
              name="ipAddress"
              id="computer-ip"
              label="IP Address"
              type="text"
              placeholder="IP Address (optional)"
            />
            <FormField
              control={form.control}
              name="macAddress"
              id="computer-mac"
              label="MAC Address"
              type="text"
              placeholder="MAC Address (optional)"
            />
            <FormField
              control={form.control}
              name="os"
              id="computer-os"
              label="Operating System"
              type="text"
              placeholder="e.g. Windows 11, Ubuntu 22.04"
            />
            <FormField
              control={form.control}
              name="status"
              id="computer-status"
              label="Status"
              type="status"
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {buttonLabel}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
