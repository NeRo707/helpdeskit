import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { RoomDetailServer } from './rooms-detail';
import { getRoomServer } from '@/lib/server/rooms';
import { TRoom } from '@/types/api';


export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  const room: TRoom = await getRoomServer(roomId);
  console.log(room);

  // Seed the query cache with data we already fetched — no second request.
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.buildings.room(roomId), room);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoomDetailServer room={room} roomId={roomId} />
    </HydrationBoundary>
  );
}
