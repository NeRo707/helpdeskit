// actions/tickets.ts
'use server';
import { fetchAPI } from '@/lib/api';
import { TTicketStatus } from '@/types/api';
import { revalidatePath } from 'next/cache';

export async function assignTicket(ticketId: string, assignedToId: string) {
  await fetchAPI(`/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedToId }),
  });
  revalidatePath(`/tickets/${ticketId}`);
}

export async function updateTicketStatus(ticketId: string, status: TTicketStatus) {
  await fetchAPI(`/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  revalidatePath(`/tickets/${ticketId}`);
}
