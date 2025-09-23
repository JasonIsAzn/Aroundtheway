"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCart,
  addItem,
  removeItem,
  increment,
  decrement,
  setQuantity,
  clearCart,
} from "@/lib/cart";
import { startCheckout } from "@/lib/checkout.client";

const money = (cents, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((cents || 0) / 100);

const SAMPLE_PRODUCTS = [
  {
    id: "tee-classic",
    name: "ATW Classic Tee",
    unitAmountCents: 2500,
    imageUrl: "https://picsum.photos/seed/tee/600/600",
    currency: "usd",
  },
  {
    id: "comb-std",
    name: "ATW Comb",
    unitAmountCents: 1500,
    imageUrl: "https://picsum.photos/seed/comb/600/600",
    currency: "usd",
  },
  {
    id: "hoodie-black",
    name: "ATW Black Hoodie",
    unitAmountCents: 5900,
    imageUrl: "https://picsum.photos/seed/hoodie/600/600",
    currency: "usd",
  },
];

export default function CheckoutPage() {
  const [cart, setCartState] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initial load
  useEffect(() => {
    setCartState(getCart());
  }, []);

  // Stay in sync with other tabs / other parts of the app
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "atw_cart_v1") {
        setCartState(getCart());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const subtotalCents = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.unitAmountCents * i.quantity, 0);
  }, [cart]);

  const handleAdd = (p) => {
    const next = addItem(p, 1);
    setCartState(next);
  };

  const handleInc = (id) => setCartState(increment(id));
  const handleDec = (id) => setCartState(decrement(id));
  const handleRemove = (id) => setCartState(removeItem(id));
  const handleClear = () => {
    clearCart();
    setCartState([]);
  };

  const handleDirectQty = (id, val) => {
    const qty = Number.isFinite(+val) ? Math.max(0, Math.min(999, +val)) : 1;
    setCartState(setQuantity(id, qty));
  };

  const handlePay = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    setLoading(true);
    try {
      const items = cart.map((i) => ({
        Name: i.name,
        UnitAmountCents: i.unitAmountCents,
        Quantity: i.quantity,
        ImageUrl: i.imageUrl,
        Currency: i.currency,
      }));
      const { url } = await startCheckout(items);
      window.location.href = url; // Stripe Checkout redirect
    } catch (err) {
      console.error(err);
      alert(err?.message || "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Checkout (Local Cart)</h1>

      {/* Sample products with "Add to cart" */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Sample Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_PRODUCTS.map((p) => (
            <div key={p.id} className="rounded-xl border p-3 flex flex-col">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="mt-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {money(p.unitAmountCents, p.currency)}
                </div>
              </div>
              <button
                onClick={() => handleAdd(p)}
                className="mt-auto rounded-lg px-3 py-2 bg-black text-white"
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cart */}
      <section className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Cart</h2>
          <button
            onClick={handleClear}
            className="text-sm underline text-gray-600 hover:text-gray-900"
          >
            Clear cart
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-sm text-gray-600 mt-2">
            Your cart is empty. Add something above!
          </p>
        ) : (
          <ul className="divide-y mt-3">
            {cart.map((i) => (
              <li key={i.id} className="py-3 flex items-center gap-3">
                <img
                  src={i.imageUrl}
                  alt={i.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{i.name}</div>
                  <div className="text-xs text-gray-600">
                    {money(i.unitAmountCents, i.currency)} each
                  </div>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDec(i.id)}
                    className="px-2 py-1 rounded border"
                    aria-label="decrease quantity"
                  >
                    −
                  </button>
                  <input
                    className="w-14 px-2 py-1 rounded border text-center"
                    inputMode="numeric"
                    value={i.quantity}
                    onChange={(e) => handleDirectQty(i.id, e.target.value)}
                  />
                  <button
                    onClick={() => handleInc(i.id)}
                    className="px-2 py-1 rounded border"
                    aria-label="increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="w-24 text-right font-medium">
                  {money(i.unitAmountCents * i.quantity, i.currency)}
                </div>

                <button
                  onClick={() => handleRemove(i.id)}
                  className="ml-2 text-xs text-red-600 underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Subtotal</div>
          <div className="text-lg font-semibold">{money(subtotalCents)}</div>
        </div>
      </section>

      <button
        onClick={handlePay}
        disabled={loading || cart.length === 0}
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
