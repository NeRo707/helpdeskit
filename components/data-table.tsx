"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  rowClassName?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = "No data available",
  rowClassName,
}: DataTableProps<T>) {
  const header = (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={column.header} className={column.className}>
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  function renderBody() {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {columns.map((column) => (
            <TableCell key={column.header}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-24 text-center text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      );
    }

    return data.map((row) => (
      <TableRow
        key={row.id}
        onClick={() => onRowClick?.(row)}
        className={onRowClick ? `cursor-pointer ${rowClassName ?? ""}` : rowClassName}
      >
        {columns.map((column) => (
          <TableCell key={column.header} className={column.className}>
            {typeof column.accessor === "function"
              ? column.accessor(row)
              : (row[column.accessor] as React.ReactNode)}
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        {header}
        <TableBody>{renderBody()}</TableBody>
      </Table>
    </div>
  );
}
