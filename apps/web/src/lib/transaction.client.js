"use client";

import { apiFetch } from "./http.client";

export async function createTransaction(payload) {
  const res = await apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.title || err?.error || "Failed to create transaction");
  }
  return res.json();
}

export async function getMyTransactions() {
  const res = await apiFetch("/api/transactions/me", {
    method: "GET",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to load your transactions");
  }
  return res.json();
}
