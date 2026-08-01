import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

function splitSetCookieHeader(setCookieHeader: string): string[] {
  return setCookieHeader
    .split(/,(?=[^;\s]+=)/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractSetCookies(res: Response): string[] {
  const withGetSetCookie = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof withGetSetCookie.getSetCookie === 'function') {
    const values = withGetSetCookie.getSetCookie();
    if (values.length > 0) return values;
  }

  const combined = res.headers.get('set-cookie');
  if (!combined) return [];
  return splitSetCookieHeader(combined);
}

function getTokenExp(token?: string): number | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const json = JSON.parse(atob(padded)) as { exp?: number };
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}

async function refreshSession(req: NextRequest): Promise<NextResponse | null> {
  const refreshRes = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { cookie: req.headers.get('cookie') ?? '' },
    cache: 'no-store',
  });

  if (!refreshRes.ok) {
    return null;
  }

  const response = NextResponse.next();
  const setCookies = extractSetCookies(refreshRes);
  for (const cookie of setCookies) {
    response.headers.append('set-cookie', cookie);
  }

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.next();
  }

  const exp = getTokenExp(accessToken);
  const isMissingAccess = !accessToken;
  const isExpiredOrNearExpiry = exp !== null && exp * 1000 <= Date.now() + 60_000;

  if (!isMissingAccess && !isExpiredOrNearExpiry) {
    return NextResponse.next();
  }

  const refreshedResponse = await refreshSession(req);
  return refreshedResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|icon-light-32x32.png|icon-dark-32x32.png|apple-icon.png).*)',
  ],
};
