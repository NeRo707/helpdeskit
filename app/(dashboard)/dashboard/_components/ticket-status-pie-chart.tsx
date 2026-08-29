"use client";

import { Pie, PieChart } from "recharts";
import type { TTicket } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTickets } from "@/hooks/use-tickets";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketStatusPieChartProps {
  tickets: TTicket[];
}

type StatusEntry = {
  key: TTicket["status"];
  label: string;
  color: string;
};

const STATUS_ENTRIES: StatusEntry[] = [
  { key: "OPEN", label: "Open", color: "var(--chart-1)" },
  { key: "IN_PROGRESS", label: "In Progress", color: "var(--chart-3)" },
  { key: "ON_HOLD", label: "On Hold", color: "var(--chart-6)" },
  { key: "RESOLVED", label: "Resolved", color: "var(--chart-2)" },
  { key: "CLOSED", label: "Closed", color: "var(--chart-5)" },
];

const chartConfig = {
  count: { label: "Tickets" },
  OPEN: { label: "Open", color: "var(--chart-1)" },
  IN_PROGRESS: { label: "In Progress", color: "var(--chart-3)" },
  ON_HOLD: { label: "On Hold", color: "var(--chart-6)" },
  RESOLVED: { label: "Resolved", color: "var(--chart-2)" },
  CLOSED: { label: "Closed", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function TicketStatusPieChart() {
  const { data, isPending } = useTickets({}, { throwOnError: true });

  if (isPending) {
    return <Skeleton className="h-80 rounded border" />;
  }

  const tickets = data ?? [];

  const chartData = STATUS_ENTRIES.map((entry) => ({
    status: entry.key,
    label: entry.label,
    count: tickets.filter((ticket) => ticket.status === entry.key).length,
    fill: entry.color,
  }));

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Ticket Status Mix</CardTitle>
        <CardDescription>Distribution of ticket statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto max-h-80">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={58}
              outerRadius={96}
              paddingAngle={2}
            />
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
