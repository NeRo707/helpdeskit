import { format } from 'date-fns';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}
