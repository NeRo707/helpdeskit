'use client';

/**
 * RoomsTable - receives rooms from the parent's useBuilding() cache.
 * Mutations (create/update/delete) invalidate that same cache key,
 * which causes the parent to re-render with fresh data automatically.
 *
 * KEY CONCEPT - Cache as the single source of truth:
 * The rooms list lives inside the building detail query. When we create/
 * update/delete a room, we don't need to maintain a separate rooms state -
 * we just invalidate queryKeys.buildings.detail(buildingId) and React Query
 * re-fetches the building (with its rooms array) in the background.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { DataTable, type Column } from '@/components/data-table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import type { TRoom } from '@/types/api';
import { useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/use-buildings';

interface RoomsTableProps {
  buildingId: string;
  rooms: TRoom[];
  isAdmin: boolean;
}

export function RoomsTable({ buildingId, rooms, isAdmin }: RoomsTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<TRoom | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<TRoom | null>(null);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');

  // Mutations - all invalidate buildings.detail(buildingId) on success
  const createRoom = useCreateRoom(buildingId);
  const updateRoom = useUpdateRoom(buildingId);
  const deleteRoomMutation = useDeleteRoom(buildingId);

  const isPending = createRoom.isPending || updateRoom.isPending || deleteRoomMutation.isPending;

  const columns: Column<TRoom>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Floor', accessor: (row) => row.floor || '-' },
    { header: 'Computers', accessor: (row) => row.computers?.length ?? 0 },
    ...(isAdmin
      ? [
          {
            header: 'Actions',
            accessor: (row: TRoom) => (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteRoom(row)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleRowClick = (room: TRoom) => {
    router.push(`/buildings/${buildingId}/rooms/${room.id}`);
  };

  const handleEdit = (room: TRoom) => {
    setEditRoom(room);
    setName(room.name);
    setFloor(room.floor || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditRoom(null);
    setName('');
    setFloor('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, floor: floor || null };

    if (editRoom) {
      updateRoom.mutate(
        { roomId: editRoom.id, data },
        {
          onSuccess: () => { toast.success('Room updated'); handleClose(); },
          onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update room'),
        },
      );
    } else {
      createRoom.mutate(data, {
        onSuccess: () => { toast.success('Room created'); handleClose(); },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create room'),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteRoom) return;
    deleteRoomMutation.mutate(deleteRoom.id, {
      onSuccess: () => { toast.success('Room deleted'); setDeleteRoom(null); },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to delete room'),
    });
  };

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="room-name">Name</FieldLabel>
                    <Input
                      id="room-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Room name"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="room-floor">Floor</FieldLabel>
                    <Input
                      id="room-floor"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="Floor (optional)"
                    />
                  </Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Saving...' : editRoom ? 'Update Room' : 'Create Room'}
                  </Button>
                </FieldGroup>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rooms}
        onRowClick={handleRowClick}
        emptyMessage="No rooms found"
      />

      <ConfirmDialog
        open={!!deleteRoom}
        onOpenChange={(o) => !o && setDeleteRoom(null)}
        title="Delete Room"
        description={`Are you sure you want to delete "${deleteRoom?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
