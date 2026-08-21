import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;
const TOKEN_COOKIE = 'accessToken';

async function forwardRequest(req: NextRequest, segments: string[]) {
  const path = segments.join('/');
  const body = req.method !== 'GET' ? await req.text() : undefined;

  // Read the JWT from our httpOnly cookie and forward it as Bearer
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  const backendRes = await fetch(`${BACKEND_URL}/${path}${req.nextUrl.search}`, {
    method: req.method,
    headers,
    body,
    cache: 'no-store',
  });

  const resBody = await backendRes.text();
  const res = new NextResponse(resBody, { status: backendRes.status });

  const contentType = backendRes.headers.get('content-type');
  if (contentType) res.headers.set('content-type', contentType);

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
