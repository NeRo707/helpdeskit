'use client';

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
import type { Room } from '@/types/api';

interface RoomsTableProps {
  buildingId: string;
  rooms: Room[];
  isAdmin: boolean;
}

export function RoomsTable({ buildingId, rooms, isAdmin }: RoomsTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [loading, setLoading] = useState(false);

  const columns: Column<Room>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Floor', accessor: (row) => row.floor || '—' },
    { header: 'Computers', accessor: (row) => row._count?.computers ?? 0 },
    ...(isAdmin
      ? [
          {
            header: 'Actions',
            accessor: (row: Room) => (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(row)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteRoom(row)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleRowClick = (room: Room) => {
    router.push(`/buildings/${buildingId}/rooms/${room.id}`);
  };

  const handleEdit = (room: Room) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editRoom
        ? `/api/buildings/${buildingId}/rooms/${editRoom.id}`
        : `/api/buildings/${buildingId}/rooms`;
      const method = editRoom ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          floor: floor || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save room');
      }

      toast.success(editRoom ? 'Room updated successfully' : 'Room created successfully');
      handleClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRoom) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/buildings/${buildingId}/rooms/${deleteRoom.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete room');
      }

      toast.success('Room deleted successfully');
      setDeleteRoom(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete room');
    } finally {
      setLoading(false);
    }
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : editRoom ? 'Update Room' : 'Create Room'}
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
