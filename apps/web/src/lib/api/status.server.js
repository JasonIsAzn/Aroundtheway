import "server-only";
import { getBaseUrl } from "../http.server";

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
