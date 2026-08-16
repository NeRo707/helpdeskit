"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface TicketsTrendLineChartProps {
  tickets: TTicket[];
}

const DAYS = 14;

const chartConfig = {
  created: { label: "Created", color: "var(--chart-1)" },
  resolved: { label: "Resolved", color: "var(--chart-2)" },
} satisfies ChartConfig;

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatAxisDay(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00`);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function TicketsTrendLineChart({ tickets }: TicketsTrendLineChartProps) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const base = Array.from({ length: DAYS }, (_, index) => {
    const day = new Date(end);
    day.setDate(end.getDate() - (DAYS - 1 - index));

    return {
      day: toIsoDay(day),
      created: 0,
      resolved: 0,
    };
  });

  const byDay = new Map(base.map((item) => [item.day, item]));

  for (const ticket of tickets) {
    const createdDay = ticket.createdAt.slice(0, 10);
    const createdEntry = byDay.get(createdDay);
    if (createdEntry) createdEntry.created += 1;

    if (ticket.resolvedAt) {
      const resolvedDay = ticket.resolvedAt.slice(0, 10);
      const resolvedEntry = byDay.get(resolvedDay);
      if (resolvedEntry) resolvedEntry.resolved += 1;
    }
  }

  const data = Array.from(byDay.values());

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Ticket Trend (14 days)</CardTitle>
        <CardDescription>Created vs resolved ticket volume</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatAxisDay}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => formatAxisDay(String(label))}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="created"
              stroke="var(--color-created)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="var(--color-resolved)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
