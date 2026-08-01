import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

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

function cookieHeaderToMap(cookieHeader: string): Map<string, string> {
  const cookieMap = new Map<string, string>();

  for (const part of cookieHeader.split(';')) {
    const token = part.trim();
    if (!token) continue;
    const index = token.indexOf('=');
    if (index <= 0) continue;

    const name = token.slice(0, index).trim();
    const value = token.slice(index + 1).trim();
    if (name) cookieMap.set(name, value);
  }

  return cookieMap;
}

function mergeCookies(baseCookieHeader: string, setCookies: string[]): string {
  const cookieMap = cookieHeaderToMap(baseCookieHeader);

  for (const setCookie of setCookies) {
    const [nameValue] = setCookie.split(';');
    if (!nameValue) continue;

    const index = nameValue.indexOf('=');
    if (index <= 0) continue;

    const name = nameValue.slice(0, index).trim();
    const value = nameValue.slice(index + 1).trim();
    if (!name) continue;

    cookieMap.set(name, value);
  }

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

function appendSetCookies(response: NextResponse, setCookies: string[]) {
  for (const setCookie of setCookies) {
    response.headers.append('set-cookie', setCookie);
  }
}

async function fetchBackend(req: NextRequest, path: string, cookieHeader: string, body?: string) {
  const headers = new Headers();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  return fetch(`${BACKEND_URL}/${path}${req.nextUrl.search}`, {
    method: req.method,
    headers,
    body,
    cache: 'no-store',
  });
}

function isAuthPath(path: string) {
  return path.startsWith('auth/login') || path.startsWith('auth/register') || path.startsWith('auth/refresh');
}

async function refreshTokens(cookieHeader: string): Promise<Response | null> {
  const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });

  if (!refreshRes.ok) {
    return null;
  }

  return refreshRes;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  return forwardRequest(req, proxy);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  return forwardRequest(req, proxy);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  return forwardRequest(req, proxy);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  return forwardRequest(req, proxy);
}

async function forwardRequest(req: NextRequest, segments: string[]) {
  const path = segments.join('/');
  const cookieHeader = req.headers.get('cookie') ?? '';
  const body = req.method !== 'GET' ? await req.text() : undefined;
  let backendRes = await fetchBackend(req, path, cookieHeader, body);
  let extraSetCookies: string[] = [];

  if (backendRes.status === 401 && !isAuthPath(path)) {
    const refreshRes = await refreshTokens(cookieHeader);

    if (refreshRes) {
      const refreshSetCookies = extractSetCookies(refreshRes);
      const mergedCookieHeader = mergeCookies(cookieHeader, refreshSetCookies);
      backendRes = await fetchBackend(req, path, mergedCookieHeader, body);
      extraSetCookies = refreshSetCookies;
    }
  }

  const resBody = await backendRes.text();
  const res = new NextResponse(resBody, { status: backendRes.status });
  const contentType = backendRes.headers.get('content-type');
  if (contentType) res.headers.set('content-type', contentType);

  appendSetCookies(res, extraSetCookies);
  appendSetCookies(res, extractSetCookies(backendRes));

  return res;
}
