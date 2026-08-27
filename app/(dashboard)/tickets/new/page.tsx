'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
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
import type { TTicketPriority } from '@/types/api';
import { useCreateTicket } from '@/hooks/use-tickets';

/**
 * KEY CONCEPT - useForm + useMutation:
 * react-hook-form manages field values, validation, and dirty/touched state.
 * useMutation manages the API call lifecycle (isPending, isError).
 * They are separate concerns and work great together.
 */

interface NewTicketFormValues {
  title: string;
  description: string;
  priority: TTicketPriority;
  computerId: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const createTicket = useCreateTicket();

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<NewTicketFormValues>({
      defaultValues: { title: '', description: '', priority: 'MEDIUM', computerId: '' },
    });

  const onSubmit = (data: NewTicketFormValues) => {
    createTicket.mutate(
      {
        title: data.title,
        description: data.description,
        priority: data.priority,
      },
      {
        onSuccess: (ticket) => {
          toast.success('Ticket created successfully');
          router.push(`/tickets/${ticket.id}`);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Failed to create ticket'),
      },
    );
  };

  const labelClass = 'font-mono text-xs uppercase tracking-wider text-muted-foreground';

  return (
    <div className="max-w-xl">
      <PageHeader title="Submit Ticket" description="Report an IT issue" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label className={labelClass}>Title</Label>
          <Input {...register('title', { required: true })} maxLength={200} />
          {errors.title && <p className="text-xs text-destructive">Title is required</p>}
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Priority</Label>
          <Select
            value={watch('priority')}
            onValueChange={(v) => setValue('priority', v as TTicketPriority)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Description</Label>
          <Textarea {...register('description')} rows={5} />
        </div>

        <Button type="submit" disabled={createTicket.isPending} className="w-full">
          {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </form>
    </div>
  );
}
