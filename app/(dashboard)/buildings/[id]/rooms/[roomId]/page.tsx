import { RoomDetailClient } from './RoomDetailClient';

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id: buildingId, roomId } = await params;
  return <RoomDetailClient buildingId={buildingId} roomId={roomId} />;
}
