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
import { Skeleton } from '@/components/ui/skeleton';
import { useBuildings } from '@/hooks/use-buildings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useUserRole } from '@/stores/auth-store';
import type { TBuilding } from '@/types/api';

// Self-fetching: no buildings prop needed anymore
export function BuildingsTable() {
  const isAdmin = useUserRole() === 'ADMIN';
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: buildings = [], isPending, isError } = useBuildings();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const createBuilding = useMutation({
    mutationFn: (payload: { name: string; address: string | null }) =>
      apiClient<TBuilding>('/buildings', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });
      toast.success('Building created successfully');
      setOpen(false);
      setName('');
      setAddress('');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create building'),
  });

  const deleteBuilding = useMutation({
    mutationFn: (id: string) => apiClient(`/buildings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });
      toast.success('Building deleted');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to delete building'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBuilding.mutate({ name, address: address || null });
  };

  const labelClass = 'font-mono text-xs uppercase tracking-wider text-muted-foreground';

  if (isError) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load buildings. Please refresh.
      </div>
    );
  }

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
                <Button type="submit" className="w-full" disabled={createBuilding.isPending}>
                  {createBuilding.isPending ? 'Creating...' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isPending && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded border" />
          ))}
        </div>
      )}

      {!isPending && buildings.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No buildings yet</div>
      )}

      {!isPending && buildings.length > 0 && (
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Building</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{building.name}&quot;?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteBuilding.mutate(building.id)}
                        disabled={deleteBuilding.isPending}
                      >
                        Delete
                      </AlertDialogAction>
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
