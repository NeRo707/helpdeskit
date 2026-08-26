import { NetDeviceDetailClient } from './net-device-detail.client';

export default async function NetDeviceDetailPage({
  params,
}: {
  params: Promise<{ netdeviceId: string }>;
}) {
  const { netdeviceId } = await params;
  return <NetDeviceDetailClient netdeviceId={netdeviceId} />;
}
