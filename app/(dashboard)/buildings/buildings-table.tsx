'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, PlusCircle, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Building } from '@/types/api';

interface BuildingsTableProps {
  buildings: Building[];
  isAdmin: boolean;
}

export function BuildingsTable({ buildings, isAdmin }: BuildingsTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/buildings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address: address || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create building');
      }

      toast.success('Building created successfully');
      setOpen(false);
      setName('');
      setAddress('');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create building');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (buildingId: string) => {
    try {
      const res = await fetch(`/api/buildings/${buildingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete building');
      }

      toast.success('Building deleted');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete building');
    }
  };

  const labelClass = 'font-mono text-xs uppercase tracking-wider text-muted-foreground';

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-1 h-4 w-4" /> Add Building
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Add Building</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {buildings.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No buildings yet</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="relative cursor-pointer rounded border border-border bg-card p-4 transition-colors hover:border-primary/50"
              onClick={() => router.push(`/buildings/${building.id}`)}
            >
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-semibold">{building.name}</h3>
              </div>
              {building.address ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {building.address}
                </p>
              ) : null}
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {building._count?.rooms ?? 0} rooms
              </p>
              {isAdmin ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Building</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{building.name}&quot;?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(building.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
