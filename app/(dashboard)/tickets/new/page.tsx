'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TicketPriority } from '@/types/api';

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [computerId, setComputerId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          computerId: computerId || null,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const err = await res.json();
        throw new Error(err.message || 'Failed to create ticket');
      }

      const ticket = await res.json();
      toast.success('Ticket created successfully');
      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'font-mono text-xs uppercase tracking-wider text-muted-foreground';

  return (
    <div className="max-w-xl">
      <PageHeader title="Submit Ticket" description="Report an IT issue" />
      <form onSubmit={handleSubmit} className="space-y-4 rounded border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label className={labelClass}>Title</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priorityValue) => (
                <SelectItem key={priorityValue} value={priorityValue}>
                  {priorityValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Computer ID (optional)</Label>
          <Input
            value={computerId}
            onChange={(event) => setComputerId(event.target.value)}
            placeholder="Computer UUID"
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Description</Label>
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </form>
    </div>
  );
}
