"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCheckoutSession } from "@/lib/checkout.client";

export default function SuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSummary = async () => {
      try {
        const data = await getCheckoutSession(sessionId);
        setSummary(data);
      } catch {
        setSummary(null);
      }
    };

    fetchSummary();
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
