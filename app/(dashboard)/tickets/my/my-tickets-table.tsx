'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyTickets } from '@/hooks/use-tickets';

// No more props - this component self-fetches via React Query
export function MyTicketsTable() {
  const { data: tickets = [], isPending, isError } = useMyTickets();

  if (isError) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load your tickets. Please refresh.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Priority</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Assigned</th>
            <th className="p-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {isPending && Array.from({ length: 3 }).map((_, i) => (
            <tr key={i} className="border-b border-border">
              {Array.from({ length: 5 }).map((_, j) => (
                <td key={j} className="p-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}

          {!isPending && tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-border transition-colors hover:bg-accent/50">
              <td className="max-w-[220px] truncate p-3 font-medium">
                <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                  {ticket.title}
                </Link>
              </td>
              <td className="p-3">
                <StatusBadge status={ticket.priority} />
              </td>
              <td className="p-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="p-3 text-muted-foreground">{ticket.assignedTo?.name ?? 'Unassigned'}</td>
              <td className="whitespace-nowrap p-3 text-muted-foreground">{formatDate(ticket.createdAt)}</td>
            </tr>
          ))}

          {!isPending && tickets.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                You have no tickets yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
