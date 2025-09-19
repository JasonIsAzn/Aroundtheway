import { apiFetch } from "./http.client";

export async function register({ email, password }) {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login({ email, password }) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMe() {
  const res = await apiFetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });
  return res.json();
}
