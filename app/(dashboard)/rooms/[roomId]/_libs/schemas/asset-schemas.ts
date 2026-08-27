import { z } from "zod";

export const assetStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "UNDER_MAINTENANCE",
  "DECOMMISSIONED",
]);

export const computerFormSchema = z.object({
  hostname:   z.string().min(1, "Hostname is required"),
  ipAddress:  z.string().optional(),
  macAddress: z.string().optional(),
  os:         z.string().optional(),
  status:     assetStatusSchema,
});

export const networkDeviceFormSchema = z.object({
  hostname:     z.string().min(1, "Hostname is required"),
  ipAddress:    z.string().optional(),
  macAddress:   z.string().optional(),
  type:         z.string().optional(),
  brand:        z.string().optional(),
  model:        z.string().optional(),
  serialNumber: z.string().optional(),
  status:       assetStatusSchema,
});

export type AssetStatus        = z.infer<typeof assetStatusSchema>;
export type ComputerFormValues = z.infer<typeof computerFormSchema>;
export type NetDeviceFormValues = z.infer<typeof networkDeviceFormSchema>;
