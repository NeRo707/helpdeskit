"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL!;
const TOKEN_COOKIE = "accessToken";
const MAX_AGE = 60 * 60 * 2; // 2 hours – matches backend JWT expiry

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

async function saveToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

async function clearToken() {
  (await cookies()).delete(TOKEN_COOKIE);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the current user via /auth/me.
 * Sends the stored JWT as a Bearer token (backend uses JwtBearer, not cookie auth).
 */
export async function getMe() {
  try {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    // Backend returns { id, name, email, role, isActive }
    return res.json();
  } catch (err) {
    console.error("getMe error:", err);
    return null;
  }
}

/**
 * Authenticated fetch helper for server actions / server components.
 * Automatically attaches the Bearer token and redirects to /login on 401.
 */
export async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const { headers: optionHeaders, ...restOptions } = options ?? {};

  const res = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...restOptions,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // Backend returns { accessToken, user } in the JSON body
  const data = await res.json();
  const token: string = data.accessToken;

  if (!token) throw new Error("No token received from server");

  await saveToken(token);
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

  const data = await res.json();
  const token: string = data.accessToken;

  if (!token) throw new Error("No token received from server");

  await saveToken(token);
  redirect("/dashboard");
}

export async function logoutAction() {
  const token = await getToken();

  try {
    if (token) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    console.error("Failed to notify backend of logout, clearing local token anyway");
  }

  await clearToken();
  redirect("/login");
}
