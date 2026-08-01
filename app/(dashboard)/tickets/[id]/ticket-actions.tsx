'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import type { TicketStatus, User } from '@/types/api';

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TicketStatus;
  currentAssigneeId: string | null;
  users: User[];
}

export function TicketActions({ 
  ticketId, 
  currentStatus, 
  currentAssigneeId,
  users 
}: TicketActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId || '');
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update status');
      }

      toast.success('Status updated');
      router.refresh();
    } catch (err) {
      setStatus(currentStatus);
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to assign ticket');
      }

      toast.success('Ticket assigned');
      setAssignOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign ticket');
    } finally {
      setLoading(false);
    }
  };

  // Filter to only show technicians and admins for assignment
  const assignableUsers = users.filter((u) => 
    u.role === 'ADMIN' || u.role === 'TECHNICIAN'
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
            onValueChange={(v) => handleStatusChange(v as TicketStatus)}
            disabled={loading}
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
                disabled={!selectedUserId || loading}
              >
                {loading ? 'Assigning...' : 'Assign'}
              </Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
