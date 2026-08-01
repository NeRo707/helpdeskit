import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function TicketsLoading() {
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

      <div className="rounded-md border border-border">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 p-3">
          {['Title', 'Status', 'Priority', 'Reported By', 'Assigned To', 'Computer', 'Created'].map((h) => (
            <span key={h} className="text-sm font-medium text-muted-foreground">{h}</span>
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 items-center border-b border-border p-3 last:border-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
