'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const { headers: optionHeaders, ...restOptions } = options ?? {};

  const res = await fetch(`${process.env.BACKEND_URL}${path}`, {
    cache: 'no-store',
    ...restOptions,
    headers: {
      cookie: cookieStore.toString(),
      ...(optionHeaders as Record<string, string>),
    },
  });

  if (res.status > 400 && res.status < 500) redirect('/login');
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);

  return res.json();
}
