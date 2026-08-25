import { NetDeviceDetailClient } from "./NetDeviceDetailClient";

export default async function NetworkDeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string; netdeviceId: string }>;
}) {
  const { id: buildingId, roomId, netdeviceId } = await params;
  return <NetDeviceDetailClient buildingId={buildingId} roomId={roomId} netdeviceId={netdeviceId} />;
}
