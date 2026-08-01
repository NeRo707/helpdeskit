import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getMe } from "@/actions/auth";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Building2, Ticket as TicketIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Building, Ticket as TicketType } from "@/types/api";

async function fetchWithAuth(path: string) {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function DashboardPage() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  // USER role should not see the main dashboard
  if (user.role === "USER") {
    redirect("/tickets/my");
  }

  const [buildings, tickets] = await Promise.all([
    fetchWithAuth("/buildings") as Promise<Building[]>,
    fetchWithAuth(user.role === "USER" ? "/tickets/my" : "/tickets") as Promise<
      TicketType[]
    >,
  ]);

  const totalBuildings = buildings.length;
  const totalComputers = buildings.reduce((sum, building) => {
    const roomComputers =
      building.rooms?.reduce(
        (roomSum, room) => roomSum + (room._count?.computers ?? 0),
        0,
      ) ?? 0;
    return sum + roomComputers;
  }, 0);

  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const stats = [
    {
      label: "Total Buildings",
      value: totalBuildings,
      color: "text-foreground",
    },
    {
      label: "Total Computers",
      value: totalComputers,
      color: "text-foreground",
    },
    { label: "Open Tickets", value: openTickets, color: "text-primary" },
    { label: "In Progress", value: inProgressTickets, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="System overview"
        actions={
          <div className="flex gap-2">
            <Link href="/tickets/new">
              <Button size="sm">
                <TicketIcon className="mr-1 h-4 w-4" /> New Ticket
              </Button>
            </Link>
            <Link href="/buildings">
              <Button size="sm" variant="secondary">
                <Building2 className="mr-1 h-4 w-4" /> Assets
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded border border-border bg-card p-4"
          >
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </div>
            <div
              className={`mt-1 font-heading text-2xl font-bold ${stat.color}`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <h3 className="font-heading text-sm font-semibold">Recent Tickets</h3>
      </div>
      <div className="rounded border border-border">
        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-border transition-colors hover:bg-accent/50 cursor-pointer relative"
                >
                  <td className="p-3 font-medium">{ticket.title}</td>
                  <td className="p-3">
                    <StatusBadge status={ticket.priority} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </td>

                  <td className="absolute inset-0 p-0">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="block w-full h-full"
                    />
                  </td>
                </tr>
              ))}
              {recentTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No tickets yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
