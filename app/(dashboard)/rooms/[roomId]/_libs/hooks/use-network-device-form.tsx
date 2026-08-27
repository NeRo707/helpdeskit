"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { networkDeviceFormSchema, type NetDeviceFormValues } from "../schemas/asset-schemas";
import { useUpsertNetworkDevice } from "@/hooks/use-buildings";
import type { TNetworkDevice } from "@/types/api";

const DEFAULT_VALUES: NetDeviceFormValues = {
  hostname:     "",
  ipAddress:    "",
  macAddress:   "",
  type:         "",
  brand:        "",
  model:        "",
  serialNumber: "",
  status:       "ACTIVE",
};

function toFormValues(d: TNetworkDevice): NetDeviceFormValues {
  return {
    hostname:     d.hostname     ?? "",
    ipAddress:    d.ipAddress    ?? "",
    macAddress:   d.macAddress   ?? "",
    type:         d.type         ?? "",
    brand:        d.brand        ?? "",
    model:        d.model        ?? "",
    serialNumber: d.serialNumber ?? "",
    status:       d.status,
  };
}

interface UseNetworkDeviceFormOptions {
  buildingId: string;
  roomId:     string;
  editTarget: TNetworkDevice | null;
  onClose:    () => void;
}

export function useNetworkDeviceForm({
  buildingId,
  roomId,
  editTarget,
  onClose,
}: UseNetworkDeviceFormOptions) {
  const isEditing = editTarget !== null;
  const upsert    = useUpsertNetworkDevice(buildingId, roomId);

  const form = useForm<NetDeviceFormValues>({
    resolver:      zodResolver(networkDeviceFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(editTarget ? toFormValues(editTarget) : DEFAULT_VALUES);
  }, [editTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        deviceId: editTarget?.id,
        data: {
          roomId:       isEditing ? undefined : roomId,
          hostname:     values.hostname,
          ipAddress:    values.ipAddress    || null,
          macAddress:   values.macAddress   || null,
          type:         values.type         || null,
          brand:        values.brand        || null,
          model:        values.model        || null,
          serialNumber: values.serialNumber || null,
          status:       values.status,
        },
      },
      {
        onSuccess: () => {
          toast.success(isEditing ? "Network device updated" : "Network device created");
          onClose();
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save network device"),
      },
    );
  });

  return { form, isEditing, isPending: upsert.isPending, onSubmit };
}
