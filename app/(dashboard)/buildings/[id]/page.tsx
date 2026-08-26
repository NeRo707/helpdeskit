import { BuildingDetailClient } from './building-detail.client';

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BuildingDetailClient id={id} />;
}
