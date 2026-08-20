"use client";

/**
 * KEY CONCEPT - useMutation vs Server Actions + router.refresh():
 *
 * Old pattern:
 *   1. Call server action (round trip to Node.js)
 *   2. Call router.refresh() (triggers full server re-render)
 *   3. Wait for the page to re-render with fresh data
 *   → No optimistic update, user sees a delay
 *
 * New pattern (React Query):
 *   1. useMutation fires - cache is updated OPTIMISTICALLY (instant)
 *   2. API call runs in background
 *   3. On success: query is invalidated → background refetch confirms the change
 *   4. On error: cache is rolled back to previous state automatically
 *   → User sees the update immediately, server confirms silently
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import type { TTicketStatus, TUser } from "@/types/api";
import { useUpdateTicketStatus, useAssignTicket } from "@/hooks/use-tickets";

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TTicketStatus;
  currentAssigneeId: string | null;
  users: TUser[];
}

export function TicketActions({
  ticketId,
  currentStatus,
  currentAssigneeId,
  users,
}: TicketActionsProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId || "");

  // -- React Query mutations --------------------------------------------------
  // These hooks handle loading state, optimistic updates, and cache invalidation.
  // No need for useTransition, local loading state, or router.refresh().
  const updateStatus = useUpdateTicketStatus();
  const assignTicket = useAssignTicket();

  const handleStatusChange = (newStatus: TTicketStatus) => {
    updateStatus.mutate(
      { id: ticketId, status: newStatus },
      {
        // onSuccess/onError are per-call overrides on top of the hook's defaults
        onSuccess: () => toast.success("Status updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to update status"),
      },
    );
  };

  const handleAssign = () => {
    if (!selectedUserId) return;
    assignTicket.mutate(
      { id: ticketId, assignedToId: selectedUserId },
      {
        onSuccess: () => {
          toast.success("Ticket assigned");
          setAssignOpen(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to assign ticket"),
      },
    );
  };

  const assignableUsers = users.filter(
    (u) => u.role === "ADMIN" || u.role === "TECHNICIAN",
  );

  // isPending comes from the mutation - true while the API call is in-flight
  const isPending = updateStatus.isPending || assignTicket.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Update Status
          </label>
          <Select
            value={currentStatus}
            onValueChange={(v) => handleStatusChange(v as TTicketStatus)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Assign Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Ticket</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Select User</FieldLabel>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Button
                onClick={handleAssign}
                className="w-full"
                disabled={!selectedUserId || isPending}
              >
                {assignTicket.isPending ? "Assigning..." : "Assign"}
              </Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
