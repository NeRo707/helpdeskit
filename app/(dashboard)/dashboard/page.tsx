import { DashboardClient } from "./_components/DashboardClient";

/**
 * The request proxy owns access redirects. This page stays a small server shell
 * while DashboardClient owns its API data through React Query.
 */
export default function DashboardPage() {
  return <DashboardClient />;
}
