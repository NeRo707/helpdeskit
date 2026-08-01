'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { formatDate } from '@/lib/format';
import type { User, Role } from '@/types/api';

interface UsersTableProps {
  users: User[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update role');
      }

      toast.success('Role updated');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleDeactivate = async (targetUser: User) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to deactivate user');
      }

      toast.success('User deactivated');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Joined</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border">
              <td className="p-3 font-medium">{user.name ?? '—'}</td>
              <td className="p-3 text-muted-foreground">{user.email}</td>
              <td className="p-3">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                  disabled={user.id === currentUserId}
                >
                  <SelectTrigger className="h-7 w-[130px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="TECHNICIAN">TECHNICIAN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3">
                <span
                  className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-medium ${
                    user.isActive
                      ? 'border-success/30 bg-success/20 text-success'
                      : 'border-destructive/30 bg-destructive/20 text-destructive'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="whitespace-nowrap p-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
              <td className="p-3">
                {user.id === currentUserId ? (
                  <span className="text-xs text-muted-foreground">You</span>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive"
                        disabled={!user.isActive}
                      >
                        Deactivate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to deactivate {user.name ?? user.email}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDeactivate(user)}
                          disabled={loading}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No users found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
