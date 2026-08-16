import { redirect } from "next/navigation";
import { getMe } from "@/actions/auth";
import { PageHeader } from "@/components/page-header";
import type { TBuilding, TTicket } from "@/types/api";
import { fetchAPI } from "@/lib/api";
import StatsCards from "./_components/StatsCards";
import { RecentTickets } from "./_components/RecentTickets";
import { TicketStatusPieChart } from "./_components/TicketStatusPieChart";
import { TicketsTrendLineChart } from "./_components/TicketsTrendLineChart";

export default async function DashboardPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.role === "USER") redirect("/tickets/my");

  const [buildings, tickets] = await Promise.all([
    fetchAPI<TBuilding[]>("/buildings"),
    fetchAPI<TTicket[]>("/tickets"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="System overview" />
      <StatsCards buildings={buildings} tickets={tickets} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TicketStatusPieChart tickets={tickets} />
        <TicketsTrendLineChart tickets={tickets} />
      </div>
      <RecentTickets tickets={tickets} />
    </div>
  );
}
