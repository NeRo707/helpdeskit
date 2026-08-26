import { NextRequest, NextResponse } from 'next/server';
import { parseSetCookie } from 'set-cookie-parser';

const BACKEND_URL = process.env.BACKEND_URL!;
const AUTH_COOKIES = new Set(['accessToken', 'refreshToken']);

function copyAuthCookies(upstream: Response, response: NextResponse) {
  for (const cookie of parseSetCookie(upstream)) {
    if (!AUTH_COOKIES.has(cookie.name)) continue;

    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookie.maxAge,
    });
  }
}

async function forwardRequest(req: NextRequest, segments: string[]) {
  const path = segments.join('/');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const headers = new Headers();

  const reqContentType = req.headers.get('content-type');
  if (reqContentType) headers.set('content-type', reqContentType);

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) headers.set('cookie', cookieHeader);

  const backendRes = await fetch(`${BACKEND_URL}/${path}${req.nextUrl.search}`, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    ...(hasBody && { duplex: 'half' }),
    cache: 'no-store',
  });

  const res = new NextResponse(backendRes.body, {
    status: backendRes.status
  });

  const resContentType = backendRes.headers.get('content-type');
  if (resContentType) res.headers.set('content-type', resContentType);

  copyAuthCookies(backendRes, res);

  return res;
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  return forwardRequest(req, proxy);
}
