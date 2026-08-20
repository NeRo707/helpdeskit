/**
 * Browser-side API client used by all React Query hooks.
 *
 * All requests go to Next.js /api/[...proxy] which reads the httpOnly
 * accessToken cookie server-side and forwards it to the backend as
 * Authorization: Bearer <token>. The browser never touches the token directly.
 */

// In the browser, use a relative path so it always hits the same origin.
// On the server (SSR), we need an absolute URL.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// --- Custom error classes -----------------------------------------------------

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API Error ${status}`);
    this.name = 'ApiError';
  }
}

// --- Core fetch wrapper -------------------------------------------------------

export async function apiClient<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  // Normalize: strip leading slash, proxy adds it back
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  const res = await fetch(`${BASE_URL}/${normalizedPath}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });

  if (res.status === 401) {
    throw new UnauthorizedError();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new ApiError(res.status, body);
  }

  // 204 No Content – return undefined cast to T
  if (res.status === 204) return undefined as T;

  return res.json();
}
