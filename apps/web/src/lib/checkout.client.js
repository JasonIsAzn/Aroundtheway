"use client";

import { apiFetch } from "./http.client";

const ORIGIN = "http://localhost:3000";

// DTO shape: [{ Name, UnitAmountCents, Quantity, ImageUrl?, Currency? }]
export async function startCheckout(
  items,
  customerEmail = "demo-buyer@example.com"
) {
  const res = await apiFetch("/api/checkout/session", {
    method: "POST",
    body: JSON.stringify({
      Items: items,
      SuccessUrl: `${ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      CancelUrl: `${ORIGIN}/checkout/cancel`,
      CustomerEmail: customerEmail,
    }),
  });
  return res.json();
}

export async function getCheckoutSession(sessionId) {
  if (!sessionId) return null;

  const res = await apiFetch(`/api/checkout/session/${sessionId}`, {
    method: "GET",
  });
  return res.json();
}
