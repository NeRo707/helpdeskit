import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getMe } from '@/actions/auth';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Ticket } from '@/types/api';
import { MyTicketsTable } from './my-tickets-table';

async function fetchMyTickets(): Promise<Ticket[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/tickets/my`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error('Failed to fetch tickets');
  }
  return res.json();
}

export default async function MyTicketsPage() {
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  const tickets = await fetchMyTickets();

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Tickets"
        description="Your submitted tickets"
        actions={
          <Link href="/tickets/new">
            <Button size="sm">
              <PlusCircle className="mr-1 h-4 w-4" /> New Ticket
            </Button>
          </Link>
        }
      />

      <MyTicketsTable tickets={tickets} />
    </div>
  );
}
