import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getMe } from '@/actions/auth';
import { ChevronLeft } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/format';
import type { Ticket, User } from '@/types/api';
import { TicketActions } from './ticket-actions';
import { TicketComments } from './ticket-comments';

async function fetchTicket(id: string): Promise<Ticket> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/tickets/${id}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    if (res.status === 404) redirect('/tickets');
    throw new Error('Failed to fetch ticket');
  }
  return res.json();
}

async function fetchUsers(): Promise<User[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/users`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  const ticket = await fetchTicket(id);
  const canManage = user.role === 'ADMIN' || user.role === 'TECHNICIAN';

  // Only fetch users if user can manage tickets
  const users = canManage ? await fetchUsers() : [];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link
          href={user.role === 'USER' ? '/tickets/my' : '/tickets'}
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

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="space-y-6">

          <TicketComments
            ticketId={id}
            comments={ticket.comments || []}
          />
        </div>
      </div>
    </div>
  );
}
