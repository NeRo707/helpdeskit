"use client";

import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { TTicket } from "@/types/api";
import { useSearchForm, COLUMNS, SortField, SortIcon } from "./_lib/_hooks/useSearchForm";

interface TicketsTableProps {
  tickets: TTicket[];
  isLoading?: boolean;
  isError?: boolean;
}

export function TicketsTable({
  tickets,
  isLoading,
  isError,
}: TicketsTableProps) {
  const { params, setParams, handleSort } = useSearchForm();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={params.status || "all"}
          onValueChange={(v) => setParams({ status: v === "all" ? null : v })}
        >
          <SelectTrigger className="h-8 w-40 font-mono text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.priority || "all"}
          onValueChange={(v) => setParams({ priority: v === "all" ? null : v })}
        >
          <SelectTrigger className="h-8 w-35 font-mono text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded border border-border">
        <Table className="bg-card">
          <TableHeader>
            <TableRow className="font-mono text-xs uppercase tracking-wider">
              {COLUMNS.map(({ id, label, sortable }) => (
                <TableHead key={id}>
                  {sortable ? (
                    <button
                      className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                      onClick={() => handleSort(id as SortField)}
                    >
                      {label}
                      <SortIcon
                        state={params.sort === id ? params.dir : false}
                      />
                    </button>
                  ) : (
                    label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* -- Loading state -- */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* -- Error state -- */}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="p-8 text-center text-destructive"
                >
                  Failed to load tickets. Please try again.
                </TableCell>
              </TableRow>
            )}

            {/* -- Empty state -- */}
            {!isLoading && !isError && tickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="p-8 text-center text-muted-foreground"
                >
                  No tickets found
                </TableCell>
              </TableRow>
            )}

            {/* -- Data rows -- */}
            {!isLoading &&
              !isError &&
              tickets.map((ticket) => (
                <TableRow key={ticket.id} className="relative cursor-pointer">
                  <TableCell className="max-w-55 truncate font-medium">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.reportedBy?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.assignedTo?.name ?? "Unassigned"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </TableCell>
                  <td className="absolute inset-0 p-0">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="block w-full h-full"
                    />
                  </td>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
