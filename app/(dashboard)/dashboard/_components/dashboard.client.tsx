"use client";

import { PageHeader } from "@/components/page-header";
import { ErrorBoundary } from "@/components/error-boundary";
import StatsCards from "./stats-cards";
import { RecentTickets } from "./recent-tickets";
import { TicketStatusPieChart } from "./ticket-status-pie-chart";
import { TicketsTrendLineChart } from "./tickets-trend-line-chart";

const errorFallback = (label: string) => (
  <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
    Couldn't load {label}. Try refreshing.
  </div>
);

export function DashboardClient() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="System overview" />

      <ErrorBoundary fallback={errorFallback("stats")}>
        <StatsCards />
      </ErrorBoundary>

      <div className="grid gap-4 lg:grid-cols-2">
        <ErrorBoundary fallback={errorFallback("ticket status chart")}>
          <TicketStatusPieChart />
        </ErrorBoundary>
        <ErrorBoundary fallback={errorFallback("ticket trend chart")}>
          <TicketsTrendLineChart />
        </ErrorBoundary>
      </div>

      <ErrorBoundary fallback={errorFallback("recent tickets")}>
        <RecentTickets />
      </ErrorBoundary>
    </div>
  );
}
