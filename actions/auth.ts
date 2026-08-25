"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { parseSetCookie } from "set-cookie-parser";

const BACKEND_URL = process.env.BACKEND_URL!;
const AUTH_COOKIE_NAMES = new Set(["accessToken", "refreshToken"]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | undefined> {
  return (await cookies()).get("accessToken")?.value;
}

async function authCookieHeader() {
  const cookieStore = await cookies();
  return ["accessToken", "refreshToken"]
    .map((name) => cookieStore.get(name))
    .filter((cookie): cookie is NonNullable<typeof cookie> => Boolean(cookie))
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

async function saveAuthCookies(upstream: Response) {
  const upstreamCookies = parseSetCookie(upstream).filter((cookie) =>
    AUTH_COOKIE_NAMES.has(cookie.name),
  );

  if (!upstreamCookies.some((cookie) => cookie.name === "accessToken")) {
    throw new Error("Auth response did not include an access token cookie");
  }

  const cookieStore = await cookies();
  for (const cookie of upstreamCookies) {
    cookieStore.set(cookie.name, cookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: cookie.maxAge,
    });
  }
}

async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the current user via /auth/me using the server-held httpOnly cookies.
 */
const loadCurrentUser = cache(async () => {
  try {
    if (!(await getToken())) return null;
    const cookie = await authCookieHeader();

    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (!res.ok) return null;

    // Backend returns { id, name, email, role, isActive }
    return res.json();
  } catch (err) {
    console.error("loadCurrentUser error:", err);
    return null;
  }
});

/**
 * Returns the API-validated current user. React memoizes this once per server
 * render, so nested layouts/pages can safely reuse it without extra API calls.
 */
export async function getMe() {
  return loadCurrentUser();
}

/**
 * Authenticated fetch helper for server actions / server components.
 * Automatically relays the session cookies and redirects to /login on 401.
 */
export async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  const cookie = await authCookieHeader();
  const { headers: optionHeaders, ...restOptions } = options ?? {};

  const res = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...restOptions,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(optionHeaders as Record<string, string>),
    },
  });

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok && res.status >= 500) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res;
}

// ─── Auth Actions ────────────────────────────────────────────────────────────

export async function loginAction(email: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message ?? "Login failed");
  }

  // Nest's Set-Cookie response reaches this server action, not the browser.
  // Relay both httpOnly session cookies to the browser without exposing JWTs.
  await saveAuthCookies(res);
  redirect("/dashboard");
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
) {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err.message ?? "Registration failed");
  }

  await saveAuthCookies(res);
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookie = await authCookieHeader();

  try {
    if (cookie) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { cookie },
      });
    }
  } catch {
    console.error("Failed to notify backend of logout, clearing local token anyway");
  }

  await clearToken();
  redirect("/login");
}
