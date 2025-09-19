import { apiFetch } from "./http";

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
