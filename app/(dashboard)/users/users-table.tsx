'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import type { TRole } from '@/types/api';
import { useUsers, useUpdateUserRole, useToggleUserActive } from '@/hooks/use-users';
import { useCurrentUser } from '@/stores/auth-store';

// Self-fetching: no users prop needed anymore
export function UsersTable() {
  const currentUser = useCurrentUser();
  const { data: users = [], isPending, isError } = useUsers();
  const updateRole = useUpdateUserRole();
  const toggleActive = useToggleUserActive();

  const handleRoleChange = (userId: string, newRole: TRole) => {
    updateRole.mutate(
      { id: userId, role: newRole },
      {
        onSuccess: () => toast.success('Role updated'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update role'),
      },
    );
  };

  const handleDeactivate = (userId: string, isActive: boolean) => {
    toggleActive.mutate(
      { id: userId, isActive: !isActive },
      {
        onSuccess: () => toast.success(isActive ? 'User deactivated' : 'User reactivated'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update user'),
      },
    );
  };

  if (isError) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Failed to load users. Please refresh.
      </div>
    );
  }

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
          {isPending && Array.from({ length: 4 }).map((_, i) => (
            <tr key={i} className="border-b border-border">
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} className="p-3"><Skeleton className="h-4 w-full" /></td>
              ))}
            </tr>
          ))}

          {!isPending && users.map((user) => (
            <tr key={user.id} className="border-b border-border">
              <td className="p-3 font-medium">{user.name ?? '-'}</td>
              <td className="p-3 text-muted-foreground">{user.email}</td>
              <td className="p-3">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as TRole)}
                  disabled={!currentUser || user.id === currentUser.id || updateRole.isPending}
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
                {user.id === currentUser?.id ? (
                  <span className="text-xs text-muted-foreground">You</span>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive"
                        disabled={toggleActive.isPending}
                      >
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to {user.isActive ? 'deactivate' : 'reactivate'}{' '}
                          {user.name ?? user.email}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeactivate(user.id, user.isActive)}
                          disabled={toggleActive.isPending}
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

          {!isPending && users.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
