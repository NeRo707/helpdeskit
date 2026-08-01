import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getMe } from '@/actions/auth';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Ticket } from '@/types/api';
import { TicketsTable } from './tickets-table';

async function fetchTickets(searchParams: Record<string, string | undefined>): Promise<Ticket[]> {
  const cookieStore = await cookies();
  const query = new URLSearchParams();
  if (searchParams.status) query.set('status', searchParams.status);
  if (searchParams.priority) query.set('priority', searchParams.priority);

  const res = await fetch(`${process.env.BACKEND_URL}/tickets?${query.toString()}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error('Failed to fetch tickets');
  }
  return res.json();
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  // USER role sees only their own tickets
  if (user.role === 'USER') {
    redirect('/tickets/my');
  }

  const tickets = await fetchTickets(params);

  return (
    <div className="space-y-4">
      <PageHeader
        title="All Tickets"
        description="Manage support requests"
        actions={
          <Link href="/tickets/new">
            <Button size="sm">
              <PlusCircle className="mr-1 h-4 w-4" /> New Ticket
            </Button>
          </Link>
        }
      />

      <TicketsTable
        tickets={tickets}
        currentStatus={params.status}
        currentPriority={params.priority}
      />
    </div>
  );
}
