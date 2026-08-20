import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { getMe } from "@/actions/auth";
import { Role } from "@/types/api";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TicketsPageClient } from "./TicketsPageClient";

export default async function TicketsPage() {
  const user = await getMe();

  if (!user) redirect("/login");
  if (user.role === Role.USER) redirect("/tickets/my");

  // Shell: auth guard only. Data fetching delegated to TicketsPageClient.
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
