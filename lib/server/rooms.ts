import { cookies } from "next/headers";

export async function getRoomServer(id: string) {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.BACKEND_URL}/rooms/${id}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch Room");
  return res.json();
}
