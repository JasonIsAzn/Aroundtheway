"use client";

export async function getStatus() {
  const res = await fetch("/api/status", { cache: "no-store" });
  if (!res.ok) throw new Error(`/api/status ${res.status}`);
  return res.json();
}

export async function getDbPing() {
  const res = await fetch("/api/status/db", { cache: "no-store" });
  if (!res.ok) throw new Error(`/api/status/db ${res.status}`);
  return res.json();
}
