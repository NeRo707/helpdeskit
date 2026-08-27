"use client";

import {
  type Control,
  type FieldPath,
  type FieldValues,
  Controller,
} from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetStatus } from "../schemas/asset-schemas";

interface BaseFieldProps<T extends FieldValues> {
  control:     Control<T>;
  name:        FieldPath<T>;
  label:       string;
  id:          string;
}

interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type:        "text";
  placeholder?: string;
  required?:   boolean;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: "status";
}

type FormFieldProps<T extends FieldValues> =
  | TextFieldProps<T>
  | SelectFieldProps<T>;

const STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: "ACTIVE",            label: "Active" },
  { value: "INACTIVE",          label: "Inactive" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
  { value: "DECOMMISSIONED",    label: "Decommissioned" },
];

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const { control, name, label, id } = props;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            {props.type === "text" ? (
              <Input
                id={id}
                placeholder={props.placeholder}
                required={props.required}
                {...field}
              />
            ) : (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {fieldState.error && (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </Field>
  );
}
