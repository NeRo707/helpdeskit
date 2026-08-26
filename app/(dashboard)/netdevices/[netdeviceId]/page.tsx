import { NetDeviceDetailClient } from './NetDeviceDetailClient';

export default async function NetDeviceDetailPage({
  params,
}: {
  params: Promise<{ netdeviceId: string }>;
}) {
  const { netdeviceId } = await params;
  return <NetDeviceDetailClient netdeviceId={netdeviceId} />;
}
