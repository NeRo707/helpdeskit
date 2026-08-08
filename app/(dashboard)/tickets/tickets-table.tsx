"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { TTicket } from "@/types/api";

interface TicketsTableProps {
  tickets: TTicket[];
  currentStatus?: string;
  currentPriority?: string;
}

export function TicketsTable({
  tickets,
  currentStatus,
  currentPriority,
}: TicketsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/tickets?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateFilter("status", v)}
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
          value={currentPriority || "all"}
          onValueChange={(v) => updateFilter("priority", v)}
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

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Reporter</th>
              <th className="p-3 text-left">Assigned</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-border transition-colors hover:bg-accent/50 cursor-pointer relative"
              >
                <td className="max-w-55 truncate p-3 font-medium">
                  {ticket.title}
                </td>
                <td className="p-3">
                  <StatusBadge status={ticket.priority} />
                </td>
                <td className="p-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="p-3 text-muted-foreground">
                  {ticket.reportedBy?.name ?? "—"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {ticket.assignedTo?.name ?? "Unassigned"}
                </td>
                <td className="whitespace-nowrap p-3 text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="absolute inset-0 p-0">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="block w-full h-full"
                  />
                </td>
              </tr>
            ))}
            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No tickets found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
