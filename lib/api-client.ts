/**
 * Browser-side API client used by all React Query hooks.
 *
 * All requests go to Next.js /api/[...proxy]. The browser sends its httpOnly
 * cookies only to Next.js; the proxy relays them to the backend. The browser
 * never reads or handles a JWT.
 */

// This client is used by browser-side React Query hooks, so a relative URL is
// both safer and portable across local ports and deployed domains.
const BASE_URL = '/api';

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

  const request = () => fetch(`${BASE_URL}/${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
  });

  let res = await request();

  // Access tokens are intentionally short-lived. Refresh through the same
  // origin proxy so new httpOnly cookies are applied by the browser, then
  // retry the original request once.
  if (res.status === 401 && normalizedPath !== 'auth/refresh') {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST' });
    if (refreshRes.ok) res = await request();
  }

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
