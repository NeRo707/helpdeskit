import type { TAssetStatus, TNetworkDevice } from "@/types/api";

export type TNetDeviceFields = {
  hostname: string;
  ipAddress: string;
  macAddress: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: TAssetStatus;
}

export type TNetworkDeviceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  roomId: string;
  editTarget: TNetworkDevice | null;
  fields: TNetDeviceFields;
  patch: <K extends keyof TNetDeviceFields>(
    key: K,
    value: TNetDeviceFields[K],
  ) => void;
  onClose: () => void;
}
