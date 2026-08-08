import type { TBuilding, TTicket } from "@/types/api";

interface StatsCardsProps {
  buildings: TBuilding[];
  tickets: TTicket[];
}

export default function StatsCards({ buildings, tickets }: StatsCardsProps) {
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
