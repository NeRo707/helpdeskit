import { NextRequest, NextResponse } from "next/server";
import { parseSetCookie, type Cookie } from "set-cookie-parser";

const PUBLIC_PATHS = ["/login", "/register"];
const TOKEN_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const AUTH_COOKIES = new Set([TOKEN_COOKIE, REFRESH_COOKIE]);
const BACKEND_URL = process.env.BACKEND_URL!;

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
  if (payload.exp === undefined) return false;
  return payload.exp * 1000 > Date.now();
}

function authCookies(upstream: Response): Cookie[] {
  return parseSetCookie(upstream).filter((cookie) => AUTH_COOKIES.has(cookie.name));
}

function applyAuthCookies(response: NextResponse, upstreamCookies: Cookie[]) {
  for (const cookie of upstreamCookies) {
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: cookie.maxAge,
    });
  }
}

async function refreshSession(req: NextRequest) {
  if (!req.cookies.get(REFRESH_COOKIE)?.value) return null;

  try {
    const upstream = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!upstream.ok) return null;

    const refreshedCookies = authCookies(upstream);
    const accessToken = refreshedCookies.find((cookie) => cookie.name === TOKEN_COOKIE)?.value;
    const payload = decodeToken(accessToken);
    return isTokenValid(payload) ? { payload, refreshedCookies } : null;
  } catch {
    return null;
  }
}

type RouteRule = {
  path: string;
  match: "exact" | "prefix";
  blockedRoles: string[];
  redirectTo: string;
};

// Role-based route restrictions.
// These are navigation rules only; API guards remain the authorization source
// of truth for every data request.
const ROLE_RULES: RouteRule[] = [
  { path: "/dashboard", match: "exact", blockedRoles: ["USER"], redirectTo: "/tickets/my" },
  { path: "/tickets", match: "exact", blockedRoles: ["USER"], redirectTo: "/tickets/my" },
  { path: "/buildings", match: "prefix", blockedRoles: ["USER"], redirectTo: "/tickets/my" },
  { path: "/users", match: "prefix", blockedRoles: ["USER", "TECHNICIAN"], redirectTo: "/dashboard" },
];

function matchesRoute(pathname: string, rule: RouteRule) {
  return rule.match === "exact"
    ? pathname === rule.path
    : pathname === rule.path || pathname.startsWith(`${rule.path}/`);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  let payload = decodeToken(token);

  // Refresh before rendering a protected page. Redirecting back to the same
  // URL makes the new cookies available to the next server-component request.
  if (!isTokenValid(payload)) {
    const alreadyRetried = req.cookies.get("sessionRefreshed")?.value === "1";
    const refreshed = alreadyRetried ? null : await refreshSession(req);
    if (refreshed) {
      const response = NextResponse.redirect(req.nextUrl);
      applyAuthCookies(response, refreshed.refreshedCookies);
      response.cookies.set("sessionRefreshed", "1", {
        httpOnly: true,
        path: "/",
        maxAge: 10,
      });
      return response;
    }
  }

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
    if (token) response.cookies.delete(TOKEN_COOKIE);
    if (req.cookies.get(REFRESH_COOKIE)) response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // Role-based routing
  for (const rule of ROLE_RULES) {
    if (
      matchesRoute(pathname, rule) &&
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
