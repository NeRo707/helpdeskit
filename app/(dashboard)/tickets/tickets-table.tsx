"use client";

import Link from "next/link";
import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

interface TicketsTableProps {
  tickets: TTicket[];
}

const SORT_FIELDS = ["title", "priority", "status", "createdAt", "assigned"] as const;
const DIRECTIONS  = ["asc", "desc"] as const;
const SEARCH_FIELDS = ["title", "reporter", "assigned"] as const;

type SortField = typeof SORT_FIELDS[number];

const COLUMNS: { id: string; label: string; sortable: boolean }[] = [
  { id: "title",      label: "Title",    sortable: true  },
  { id: "priority",   label: "Priority", sortable: true  },
  { id: "status",     label: "Status",   sortable: true  },
  { id: "reportedBy", label: "Reporter", sortable: false },
  { id: "assigned", label: "Assigned", sortable: true },
  { id: "createdAt",  label: "Created",  sortable: true  },
];

function SortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc")  return <ArrowUp   className="ml-1 inline h-3 w-3" />;
  if (state === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const [params, setParams] = useQueryStates(
    {
      status:   parseAsString.withDefault(""),
      priority: parseAsString.withDefault(""),
      sort:     parseAsStringLiteral(SORT_FIELDS).withDefault("createdAt"),
      dir:      parseAsStringLiteral(DIRECTIONS).withDefault("desc"),
      by:       parseAsStringLiteral(SEARCH_FIELDS).withDefault("title"),
      q:        parseAsString.withDefault(""),
    },
    { shallow: false },
  );

  const handleSort = (colId: SortField) => {
    setParams({
      sort: colId,
      dir: params.sort === colId && params.dir === "desc" ? "asc" : "desc",
    });
  };

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
        <Table className="bg-card"  >
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
                      <SortIcon state={params.sort === id ? params.dir : false} />
                    </button>
                  ) : label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="p-8 text-center text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id} className="relative cursor-pointer">
                  <TableCell className="max-w-55 truncate font-medium">{ticket.title}</TableCell>
                  <TableCell><StatusBadge status={ticket.priority} /></TableCell>
                  <TableCell><StatusBadge status={ticket.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{ticket.reportedBy?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{ticket.assignedTo?.name ?? "Unassigned"}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(ticket.createdAt)}</TableCell>
                  <td className="absolute inset-0 p-0">
                    <Link href={`/tickets/${ticket.id}`} className="block w-full h-full" />
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
