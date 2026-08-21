import { redirect } from "next/navigation";
import { getMe } from "@/actions/auth";
import { DashboardClient } from "./_components/DashboardClient";

/**
 * Server shell: handles auth guard & role redirect.
 * All data fetching happens client-side via React Query in DashboardClient.
 *
 * KEY CONCEPT - Shell Pattern:
 * Server pages in Next.js App Router are great for auth guards and SEO metadata,
 * but they can't use React Query. The pattern is:
 *   Server page  → auth check + redirect
 *   Client component → useQuery for data, renders loading/error/data states
 */
export default async function DashboardPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.role === "USER") redirect("/tickets/my");

  // No data fetching here! DashboardClient handles it with React Query.
  return <DashboardClient />;
}
