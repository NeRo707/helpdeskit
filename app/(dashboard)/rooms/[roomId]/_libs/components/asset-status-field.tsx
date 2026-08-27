"use client";

import { Controller, type Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import type { ComputerFormValues, NetDeviceFormValues } from "../schemas/asset-schemas";

type AnyFormValues = ComputerFormValues | NetDeviceFormValues;

interface AssetStatusFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}

/**
 * AssetStatusField
 *
 * Reusable RHF-controlled Select for the shared status enum.
 * Both ComputerFormDialog and NetworkDeviceFormDialog use this directly.
 */
export function AssetStatusField({ control }: AssetStatusFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="asset-status">Status</FieldLabel>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id="asset-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
              <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}
