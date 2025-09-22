"use client";

import { useState, useMemo } from "react";
import { startCheckout } from "@/lib/checkout.client";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  // Sample cart
  const items = useMemo(
    () => [
      {
        Name: "ATW Classic Tee",
        UnitAmountCents: 2500,
        Quantity: 1,
        ImageUrl: "https://picsum.photos/seed/tee/600/600",
        Currency: "usd",
      },
      {
        Name: "ATW Comb",
        UnitAmountCents: 1500,
        Quantity: 2,
        ImageUrl: "https://picsum.photos/seed/comb/600/600",
        Currency: "usd",
      },
    ],
    []
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.UnitAmountCents * i.Quantity, 0),
    [items]
  );

  const handlePay = async () => {
    setLoading(true);
    try {
      const { url } = await startCheckout(items);
      window.location.href = url; // redirect to Stripe Checkout
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout (Sample Cart)</h1>

      <div className="rounded-xl border p-4 space-y-2">
        <h2 className="text-lg font-medium">Items</h2>
        <ul className="text-sm list-disc ml-5 space-y-1">
          {items.map((i, idx) => (
            <li key={idx}>
              {i.Name} — ${(i.UnitAmountCents / 100).toFixed(2)} × {i.Quantity}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-medium">
          Subtotal: ${(subtotal / 100).toFixed(2)}
        </p>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Pay with Stripe"}
      </button>

      <p className="text-xs text-gray-500">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>
    </main>
  );
}
