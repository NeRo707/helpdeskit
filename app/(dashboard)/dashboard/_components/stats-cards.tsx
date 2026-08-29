import { Skeleton } from "@/components/ui/skeleton";
import { useBuildings } from "@/hooks/use-buildings";
import { useTickets } from "@/hooks/use-tickets";

export default function StatsCards() {
  const ticketsQuery = useTickets({}, { throwOnError: true });
  const buildingsQuery = useBuildings({ throwOnError: true });

  if (ticketsQuery.isPending || buildingsQuery.isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded border" />
        ))}
      </div>
    );
  }

  const tickets = ticketsQuery.data ?? [];
  const buildings = buildingsQuery.data ?? [];

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

  const stats = [
    { label: "Total Buildings", value: totalBuildings, color: "text-foreground" },
    { label: "Total Computers", value: totalComputers, color: "text-foreground" },
    { label: "Open Tickets", value: openTickets, color: "text-primary" },
    { label: "In Progress", value: inProgressTickets, color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded border border-border bg-card p-4"
        >
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </div>
          <div className={`mt-1 font-heading text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
