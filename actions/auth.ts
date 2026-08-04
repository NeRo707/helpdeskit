"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@/types/api";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function splitSetCookieHeader(setCookieHeader: string): string[] {
  return setCookieHeader
    .split(/,(?=[^;\s]+=)/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractSetCookies(res: Response): string[] {
  const withGetSetCookie = res.headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof withGetSetCookie.getSetCookie === "function") {
    const values = withGetSetCookie.getSetCookie();
    if (values.length > 0) return values;
  }

  const combined = res.headers.get("set-cookie");
  if (!combined) return [];
  return splitSetCookieHeader(combined);
}

async function setAuthCookiesFromResponse(res: Response) {
  const cookieStore = await cookies();
  const setCookies = extractSetCookies(res);

  for (const cookieString of setCookies) {
    const [nameValue] = cookieString.split(";");
    if (!nameValue) continue;

    const eqIndex = nameValue.indexOf("=");
    if (eqIndex <= 0) continue;

    const name = nameValue.slice(0, eqIndex).trim();
    const value = nameValue.slice(eqIndex + 1).trim();
    if (!name) continue;

    if (name === "accessToken") {
      cookieStore.set(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      continue;
    }

    if (name === "refreshToken") {
      cookieStore.set(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }
  }
}

export async function getMe(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const meRes = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });

    if (meRes.ok) {
      return meRes.json();
    }

    return null;
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
}

export async function loginAction(email: string, password: string) {
  const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  await setAuthCookiesFromResponse(res);
  redirect("/dashboard");
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
) {
  const res = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }

  await setAuthCookiesFromResponse(res);
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
    method: "POST",
    headers: { cookie: cookieStore.toString() },
  });
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  redirect("/login");
}
