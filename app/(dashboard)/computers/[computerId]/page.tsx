import { ComputerDetailClient } from './ComputerDetailClient';

export default async function ComputerDetailPage({
  params,
}: {
  params: Promise<{ computerId: string }>;
}) {
  const { computerId } = await params;
  return <ComputerDetailClient computerId={computerId} />;
}
