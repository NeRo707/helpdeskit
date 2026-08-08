import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { TTicket } from "@/types/api";

interface RecentTicketsProps {
  tickets: TTicket[];
}

export default function RecentTickets({ tickets }: RecentTicketsProps) {
  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="pt-4">
        <h3 className="font-heading text-sm font-semibold">Recent Tickets</h3>
      </div>
      <div className="rounded border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <TableHead className="p-3 text-left">Title</TableHead>
              <TableHead className="p-3 text-left">Priority</TableHead>
              <TableHead className="p-3 text-left">Status</TableHead>
              <TableHead className="p-3 text-left">Created</TableHead>
              <TableHead className="w-0 p-0" aria-hidden="true" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer relative hover:bg-accent/50"
              >
                <TableCell className="p-3 font-medium">
                  {ticket.title}
                </TableCell>
                <TableCell className="p-3">
                  <StatusBadge status={ticket.priority} />
                </TableCell>
                <TableCell className="p-3">
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="p-3 text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </TableCell>
                <TableCell className="absolute inset-0 p-0">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="block w-full h-full"
                  />
                </TableCell>
              </TableRow>
            ))}
            {recentTickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No tickets yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
