import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const TOKEN_COOKIE = "accessToken";

type TokenPayload = {
  exp?: number;
  role?: string;
};

function decodeToken(token?: string): TokenPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "=",
    );
    const json = JSON.parse(atob(padded)) as Record<string, unknown>;
    return {
      exp: typeof json.exp === "number" ? json.exp : undefined,
      role: typeof json.role === "string" ? json.role : undefined,
    };
  } catch {
    return null;
  }
}

function isTokenValid(payload: TokenPayload | null): boolean {
  if (!payload) return false;
  if (payload.exp !== undefined && payload.exp * 1000 <= Date.now())
    return false;
  return true;
}

type RouteRule = {
  path: string;
  blockedRoles: string[];
  redirectTo: string;
};

// Role-based route restrictions.
// Users matching `blockedRoles` visiting `path` will be redirected to `redirectTo`.
const ROLE_RULES: RouteRule[] = [
  { path: "/tickets", blockedRoles: ["USER"], redirectTo: "/tickets/my" },
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const payload = decodeToken(token);

  console.log("payload", payload);

  // Always allow public routes through, but redirect if already logged in
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (isTokenValid(payload)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // No token or expired → redirect to login
  if (!isTokenValid(payload)) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    if (token) response.cookies.delete(TOKEN_COOKIE); // clear stale cookie
    return response;
  }

  // Role-based routing
  for (const rule of ROLE_RULES) {
    if (
      pathname.startsWith(rule.path) &&
      payload?.role &&
      rule.blockedRoles.includes(payload.role)
    ) {
      return NextResponse.redirect(new URL(rule.redirectTo, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|icon-light-32x32.png|icon-dark-32x32.png|apple-icon.png).*)",
  ],
};
