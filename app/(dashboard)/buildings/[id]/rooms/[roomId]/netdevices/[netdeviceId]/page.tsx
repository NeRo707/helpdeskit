import { redirect } from "next/navigation";
import { getMe } from "@/actions/auth";
import { NetDeviceDetailClient } from "./NetDeviceDetailClient";

export default async function NetworkDeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string; netdeviceId: string }>;
}) {
  const { id: buildingId, roomId, netdeviceId } = await params;
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "USER") {
    redirect("/tickets/my");
  }

  return (
    <NetDeviceDetailClient
      buildingId={buildingId}
      roomId={roomId}
      netdeviceId={netdeviceId}
      canEdit={user.role === "ADMIN" || user.role === "TECHNICIAN"}
    />
  );
}
