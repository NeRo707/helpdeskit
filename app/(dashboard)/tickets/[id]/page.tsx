import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { TicketDetailClient } from './TicketDetailClient';

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getMe();

  if (!user) redirect('/login');

  // Shell: only passes id to the client component.
  // Data (ticket + users) is fetched by TicketDetailClient via React Query.
  return <TicketDetailClient id={id} />;
}
