import { ComputerDetailClient } from './ComputerDetailClient';

export default async function ComputerDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string; computerId: string }>;
}) {
  const { id: buildingId, roomId, computerId } = await params;
  return <ComputerDetailClient buildingId={buildingId} roomId={roomId} computerId={computerId} />;
}
