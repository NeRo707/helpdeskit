import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MyTicketsTable } from './my-tickets-table';

export default function MyTicketsPage() {
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
      {/* MyTicketsTable fetches its own data via useMyTickets() */}
      <MyTicketsTable />
    </div>
  );
}
