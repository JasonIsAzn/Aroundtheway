import "server-only";
import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}`;
}

export async function getStatus() {
  const base = await getBaseUrl();
  const res = await fetch(new URL("/api/status", base), { cache: "no-store" });
  if (!res.ok) throw new Error(`/api/status ${res.status}`);
  return res.json();
}

export async function getDbPing() {
  const base = await getBaseUrl();
  const res = await fetch(new URL("/api/status/db", base), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`/api/status/db ${res.status}`);
  return res.json();
}
