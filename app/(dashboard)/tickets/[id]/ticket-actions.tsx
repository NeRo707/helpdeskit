"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { fetchAPI } from "@/lib/api";
import { assignTicket, updateTicketStatus } from "@/actions/tickets";

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
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId || "");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: TTicketStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateTicketStatus(ticketId, newStatus);
        toast.success("Status updated");
        router.refresh();
      } catch (err) {
        setStatus(currentStatus); // rollback
        toast.error(
          err instanceof Error ? err.message : "Failed to update status",
        );
      }
    });
  };

  const handleAssign = () => {
    if (!selectedUserId) return;
    startTransition(async () => {
      try {
        await assignTicket(ticketId, selectedUserId);
        toast.success("Ticket assigned");
        setAssignOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to assign ticket",
        );
      }
    });
  };

  // Filter to only show technicians and admins for assignment
  const assignableUsers = users.filter(
    (u) => u.role === "ADMIN" || u.role === "TECHNICIAN",
  );

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
            value={status}
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
                {isPending ? "Assigning..." : "Assign"}
              </Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
