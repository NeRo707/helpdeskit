import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";

import { getMe } from "@/actions/auth";
import { fetchAPI } from "@/lib/api";
import { Role, type TTicket } from "@/types/api";
import { ticketParamsCache } from "@/lib/searchparams";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TicketsTable } from "./tickets-table";
import SearchParamsForm from "./_components/SearchParamsForm";

// fetchTickets accepts the plain object parsed by nuqs
async function fetchTickets(params: {
  status: string;
  priority: string;
  sort: string;
  dir: string;
  by: string;
  q: string;
}): Promise<TTicket[]> {
  const query = new URLSearchParams();

  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.priority && params.priority !== "all")
    query.set("priority", params.priority);
  if (params.sort) query.set("sort", params.sort);
  if (params.dir) query.set("dir", params.dir);
  if (params.by) query.set("by", params.by);
  if (params.q) query.set("q", params.q);

  return fetchAPI<TTicket[]>(`/tickets?${query.toString()}`);
}

export default async function TicketsPage({
  searchParams,
}: {
  // Next.js 15 treats searchParams as a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the raw searchParams promise, then pass it to the nuqs cache parser
  const rawParams = await searchParams;
  const params = ticketParamsCache.parse(rawParams);

  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.role === Role.USER) {
    redirect("/tickets/my");
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
      <SearchParamsForm initialValues={params} />
      <TicketsTable tickets={tickets} />
    </div>
  );
}
