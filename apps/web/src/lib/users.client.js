"use client";

import { apiFetch } from "./http.client";

export async function getMe() {
  const res = await apiFetch("/api/users/me", {
    method: "GET",
  });
  return res.json();
}

export async function updateMyAddress(addressDto) {
  const res = await apiFetch("/api/users/me/address", {
    method: "PUT",
    body: JSON.stringify(addressDto),
  });
  return res.json();
}
