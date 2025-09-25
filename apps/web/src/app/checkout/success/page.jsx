"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCheckoutSession } from "@/lib/checkout.client";
import { createTransaction } from "@/lib/transaction.client";
import { clearCart } from "@/lib/cart";

export default function SuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!sessionId) return;

      try {
        const data = await getCheckoutSession(sessionId).catch(() => null);
        if (!cancelled) setSummary(data);

        const key = `atw_checkout_pending_${sessionId}`;
        const doneKey = `atw_txn_done_${sessionId}`;

        const fallbackKey = "atw_checkout_pending";

        const raw =
          sessionStorage.getItem(key) || sessionStorage.getItem(fallbackKey);
        if (!raw) return;

        if (sessionStorage.getItem(doneKey)) return;

        const pending = JSON.parse(raw);

        await createTransaction({
          currency: pending.currency || "USD",
          address: pending.address,
          items: pending.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            unitAmountCents: i.unitAmountCents,
            quantity: i.quantity,
          })),
        });

        sessionStorage.setItem(doneKey, "1");
        sessionStorage.removeItem(key);
        sessionStorage.removeItem(fallbackKey);
        clearCart();
      } catch (e) {
        console.error("Transaction creation failed:", e);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Payment Successful 🎉</h1>

      {summary ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm">
            Amount: <b>${(summary.amount_total / 100).toFixed(2)}</b>{" "}
            {summary.currency?.toUpperCase()}
          </p>
          <p className="text-sm">
            Status: <b>{summary.payment_status}</b>
          </p>
          <p className="text-xs text-gray-500">
            Session: <code>{summary.id}</code>
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-700">
          Thanks! Your payment went through.
        </p>
      )}

      <Link href="/" className="text-blue-600 underline">
        Go home
      </Link>
    </main>
  );
}
