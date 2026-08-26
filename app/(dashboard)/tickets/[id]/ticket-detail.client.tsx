'use client';

/**
 * TicketDetailClient - fetches ticket details and renders all sub-components.
 *
 * KEY CONCEPT - Why pass id as a prop instead of using useParams()?
 * Both work, but passing id from the server shell is more explicit and testable.
 * The server page has already validated the route params exist.
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/format';
import { Role } from '@/types/api';
import { useCurrentUser } from '@/stores/auth-store';
import { useTicket } from '@/hooks/use-tickets';
import { useUsers } from '@/hooks/use-users';
import { TicketActions } from './ticket-actions';
import { TicketComments } from './ticket-comments';

interface TicketDetailClientProps {
  id: string;
}

export function TicketDetailClient({ id }: TicketDetailClientProps) {
  const user = useCurrentUser();
  const { data: ticket, isPending, isError } = useTicket(id);
  const canManage = user?.role === Role.ADMIN || user?.role === Role.TECHNICIAN;

  // Only fetch users list if this person can manage tickets
  const { data: users = [] } = useUsers();

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-4 rounded border border-border bg-card p-6">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load ticket. It may not exist or you may not have access.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link
          href={user?.role === Role.USER ? '/tickets/my' : '/tickets'}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Tickets
        </Link>
      </div>

      <div className="space-y-4 rounded border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold">{ticket.title}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Reported by {ticket.reportedBy?.name ?? 'Unknown'} · {formatDate(ticket.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-mono text-xs uppercase text-muted-foreground">Assigned To</span>
            <div className="mt-1">{ticket.assignedTo?.name ?? 'Unassigned'}</div>
          </div>
          {ticket.computer ? (
            <div>
              <span className="font-mono text-xs uppercase text-muted-foreground">Computer</span>
              <div className="mt-1">{ticket.computer.hostname}</div>
            </div>
          ) : null}
        </div>

        {ticket.description ? (
          <div>
            <span className="font-mono text-xs uppercase text-muted-foreground">Description</span>
            <p className="mt-1 whitespace-pre-wrap text-sm">{ticket.description}</p>
          </div>
        ) : null}

        {canManage ? (
          <div className="border-t border-border pt-2">
            <TicketActions
              ticketId={id}
              currentStatus={ticket.status}
              currentAssigneeId={ticket.assignedToId}
              users={users}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <TicketComments
          ticketId={id}
          comments={ticket.comments ?? []}
        />
      </div>
    </div>
  );
}
