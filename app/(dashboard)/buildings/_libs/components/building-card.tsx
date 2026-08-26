"use client";

import { toast } from "sonner";
import { Building2, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useDeleteBuilding } from "@/hooks/use-buildings";
import type { TBuilding } from "@/types/api";
import Link from "next/link";

interface BuildingCardProps {
  building: TBuilding;
}

export function BuildingCard({ building }: BuildingCardProps) {
  const deleteBuilding = useDeleteBuilding();

  const handleDelete = () => {
    deleteBuilding.mutate(building.id, {
      onSuccess: () => toast.success("Building deleted"),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to delete building",
        ),
    });
  };

  return (
    <Link href={`/buildings/${building.id}`} className="relative cursor-pointer rounded border border-border bg-card p-4 transition-colors hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
              onClick={handleDelete}
              disabled={deleteBuilding.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Link>
  );
}
