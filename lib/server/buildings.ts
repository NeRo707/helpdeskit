import { cookies } from "next/headers";

export async function getBuildingsServer() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/buildings`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch buildings");
  return res.json();
}
