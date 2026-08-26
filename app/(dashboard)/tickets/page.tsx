import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TicketsPageClient } from "./tickets-page-client";

export default function TicketsPage() {
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
      <TicketsPageClient />
    </div>
  );
}
