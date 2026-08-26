"use client";

import Link from "next/link";
import { useQueryStates, parseAsStringLiteral } from "nuqs";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { TTicket } from "@/types/api";

interface RecentTicketsProps {
  tickets: TTicket[];
}

const PRIORITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const STATUS_WEIGHTS: Record<string, number> = {
  OPEN: 5,
  IN_PROGRESS: 4,
  ON_HOLD: 3,
  RESOLVED: 2,
  CLOSED: 1,
};

const SORT_FIELDS = ["title", "priority", "status", "createdAt"] as const;
type SortField = (typeof SORT_FIELDS)[number];
type SortDir = "asc" | "desc";

function compareTickets(
  a: TTicket,
  b: TTicket,
  field: SortField,
  dir: SortDir,
): number {
  const modifier = dir === "asc" ? 1 : -1;
  let result = 0;

  if (field === "priority") {
    result =
      (PRIORITY_WEIGHTS[a.priority] ?? 0) - (PRIORITY_WEIGHTS[b.priority] ?? 0);
  } else if (field === "status") {
    result = (STATUS_WEIGHTS[a.status] ?? 0) - (STATUS_WEIGHTS[b.status] ?? 0);
  } else if (field === "createdAt") {
    result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  } else {
    result = String(a[field]).localeCompare(String(b[field]));
  }

  if (result !== 0) return result * modifier;

  // stable fallback
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir | null }) {
  if (!active) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  }

  const Icon = dir === "asc" ? ArrowUp : ArrowDown;
  return <Icon className="ml-1 inline h-3 w-3" />;
}

const COLUMNS: { id: string; label: string; sortable: boolean }[] = [
  { id: "title", label: "Title", sortable: true },
  { id: "priority", label: "Priority", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "reportedBy", label: "Reporter", sortable: false },
  { id: "assignedTo", label: "Assigned", sortable: false },
  { id: "createdAt", label: "Created", sortable: true },
];

export function RecentTickets({ tickets }: RecentTicketsProps) {
  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const [params, setParams] = useQueryStates(
    {
      sortField: parseAsStringLiteral(SORT_FIELDS).withDefault("createdAt"),
      sortDir: parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
    },
    { shallow: false },
  );

  const { sortField, sortDir } = params;

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      // new field → start with desc
      setParams({ sortField: field, sortDir: "desc" });
    } else if (sortDir === "desc") {
      // desc → asc
      setParams({ sortField: field, sortDir: "asc" });
    } else {
      // asc → clear
      setParams({ sortField: null, sortDir: null });
    }
  };

  const sorted = [...recentTickets].sort((a, b) => {
    if (!sortField || !sortDir) return 0;
    return compareTickets(a, b, sortField, sortDir);
  });

  return (
    <div className="rounded border border-border">
      <Table className="bg-card">
        <TableHeader>
          <TableRow className="font-mono text-xs uppercase tracking-wider">
            {COLUMNS.map(({ id, label, sortable }) => {
              const active = sortField === id;

              return (
                <TableHead key={id}>
                  {sortable ? (
                    <button
                      className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                      onClick={() => handleSort(id as SortField)}
                    >
                      {label}
                      <SortIcon active={active} dir={sortDir} />
                    </button>
                  ) : (
                    label
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="p-8 text-center text-muted-foreground"
              >
                No tickets found
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="group relative cursor-pointer hover:bg-muted/30"
              >
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
