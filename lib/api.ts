'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function fetchAPI<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });

  if (res.status === 401) redirect('/login');
  if (res.status === 403) redirect('/dashboard');
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);

  return res.json();
}
