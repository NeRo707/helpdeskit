"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { computerFormSchema, type ComputerFormValues } from "../schemas/asset-schemas";
import { useUpsertComputer } from "@/hooks/use-buildings";
import type { TComputer } from "@/types/api";

const DEFAULT_VALUES: ComputerFormValues = {
  hostname:   "",
  ipAddress:  "",
  macAddress: "",
  os:         "",
  status:     "ACTIVE",
};

function toFormValues(c: TComputer): ComputerFormValues {
  return {
    hostname:   c.hostname,
    ipAddress:  c.ipAddress  ?? "",
    macAddress: c.macAddress ?? "",
    os:         c.os         ?? "",
    status:     c.status,
  };
}

interface UseComputerFormOptions {
  buildingId: string;
  roomId:     string;
  editTarget: TComputer | null;
  onClose:    () => void;
}

export function useComputerForm({
  buildingId,
  roomId,
  editTarget,
  onClose,
}: UseComputerFormOptions) {
  const isEditing = editTarget !== null;
  const upsert    = useUpsertComputer(buildingId, roomId);

  const form = useForm<ComputerFormValues>({
    resolver:      zodResolver(computerFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(editTarget ? toFormValues(editTarget) : DEFAULT_VALUES);
  }, [editTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        computerId: editTarget?.id,
        data: {
          roomId:     isEditing ? undefined : roomId,
          hostname:   values.hostname,
          ipAddress:  values.ipAddress  || null,
          macAddress: values.macAddress || null,
          os:         values.os         || null,
          status:     values.status,
        },
      },
      {
        onSuccess: () => {
          toast.success(isEditing ? "Computer updated" : "Computer created");
          onClose();
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save computer"),
      },
    );
  });

  return { form, isEditing, isPending: upsert.isPending, onSubmit };
}
