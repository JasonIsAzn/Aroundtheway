import "server-only";
import { cookies } from "next/headers";
import { getBaseUrl } from "./http.server";

export async function getMeServer() {
  const base = await getBaseUrl();
  const cookieHeader = cookies().toString();
  const res = await fetch(new URL("/api/auth/me", base), {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
