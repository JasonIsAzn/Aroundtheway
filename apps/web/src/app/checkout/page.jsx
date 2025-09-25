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
import { getMe, updateMyAddress } from "@/lib/users.client";

const money = (cents, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((cents || 0) / 100);

function formatAddress(fs) {
  return [fs.address, fs.city, fs.state, fs.zipCode, fs.country]
    .filter(Boolean)
    .join(", ");
}

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function CheckoutPage() {
  // cart
  const [cart, setCartState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // address form
  const [formState, setFormState] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [addrErrors, setAddrErrors] = useState({});
  const [isAddrSubmitting, setIsAddrSubmitting] = useState(false);
  const [isAddrLoading, setIsAddrLoading] = useState(true);

  // initial cart load
  useEffect(() => {
    setCartState(getCart());
  }, []);

  // sync cart across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "atw_cart_v1") setCartState(getCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const u = getStoredUser();
    setIsLoggedIn(!!u);

    const onAuthChanged = () => setIsLoggedIn(!!getStoredUser());
    const onStorage = (e) => {
      if (e.key === "user") onAuthChanged();
    };

    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    let canceled = false;

    const loadProfile = async () => {
      setIsAddrLoading(true);
      try {
        if (!isLoggedIn) {
          if (!canceled) {
            setFormState({
              address: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            });
            setIsAddrLoading(false);
          }
          return;
        }
        const data = await getMe();
        if (canceled) return;

        setUserEmail(data?.email || null);

        setFormState({
          address: data?.address?.address || "",
          city: data?.address?.city || "",
          state: data?.address?.state || "",
          zipCode: data?.address?.zipCode || "",
          country: data?.address?.country || "",
        });
      } catch (e) {
        console.error("Failed to load address", e);
      } finally {
        if (!canceled) setIsAddrLoading(false);
      }
    };

    loadProfile();
    return () => {
      canceled = true;
    };
  }, [isLoggedIn]);

  const subtotalCents = useMemo(
    () => cart.reduce((sum, i) => sum + i.unitAmountCents * i.quantity, 0),
    [cart]
  );

  // cart handlers
  const handleAdd = (p) => setCartState(addItem(p, 1));
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

  // address form logic
  const handleAddrChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (addrErrors[name])
      setAddrErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateAddrForm = () => {
    let ok = true;
    const next = {};
    if (formState.zipCode && formState.zipCode.length > 20) {
      next.zipCode = "ZIP/Postal code looks too long";
      ok = false;
    }
    if (formState.state && formState.state.length > 100) {
      next.state = "State/Province looks too long";
      ok = false;
    }
    if (formState.country && formState.country.length > 100) {
      next.country = "Country looks too long";
      ok = false;
    }
    setAddrErrors(next);
    return ok;
  };

  const handleSaveAddress = async (e) => {
    e?.preventDefault?.();
    if (!validateAddrForm()) return;

    setIsAddrSubmitting(true);
    try {
      const payload = {
        address: formState.address || null,
        city: formState.city || null,
        state: formState.state || null,
        zipCode: formState.zipCode || null,
        country: formState.country || null,
      };

      if (isLoggedIn) {
        await updateMyAddress(payload);
        alert("Address saved to your profile!");
      } else {
        alert("Address saved for this checkout (guest).");
      }
    } catch (e) {
      console.error("Address update error:", e);
      alert("Could not save address. Please try again.");
    } finally {
      setIsAddrSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (
      !formState.address ||
      !formState.city ||
      !formState.state ||
      !formState.zipCode ||
      !formState.country
    ) {
      alert("Please complete your shipping address before paying.");
      return;
    }

    setLoading(true);
    try {
      const snapshot = {
        address: formatAddress(formState),
        currency: "USD",
        items: getCart().map((i) => ({
          productId: i.id,
          name: i.name,
          unitAmountCents: i.unitAmountCents,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
      };

      const { url, sessionId } = await startCheckout(
        getCart().map((i) => ({
          Name: i.name,
          UnitAmountCents: i.unitAmountCents,
          Quantity: i.quantity,
          ImageUrl: i.imageUrl,
          Currency: i.currency,
        })),
        userEmail || "guest@example.com"
      );

      const key = sessionId
        ? `atw_checkout_pending_${sessionId}`
        : `atw_checkout_pending`;
      sessionStorage.setItem(key, JSON.stringify(snapshot));

      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert(err?.message || "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <h1 className="text-2xl font-semibold">
        {isLoggedIn ? "Checkout" : "Guest Checkout"}
      </h1>

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

      {/* Address form ONLY */}
      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium">Shipping Address</h2>

        {isAddrLoading ? (
          <p className="text-sm text-gray-500 mt-2">Loading address…</p>
        ) : (
          <form onSubmit={handleSaveAddress} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Street Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formState.address}
                onChange={handleAddrChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your street address"
              />
              {addrErrors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {addrErrors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formState.city}
                  onChange={handleAddrChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  placeholder="City"
                />
                {addrErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{addrErrors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State/Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formState.state}
                  onChange={handleAddrChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  placeholder="State"
                />
                {addrErrors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {addrErrors.state}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  ZIP/Postal Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formState.zipCode}
                  onChange={handleAddrChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  placeholder="ZIP Code"
                />
                {addrErrors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {addrErrors.zipCode}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formState.country}
                onChange={handleAddrChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Enter your country"
              />
              {addrErrors.country && (
                <p className="mt-1 text-sm text-red-600">
                  {addrErrors.country}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAddrSubmitting}
                className="rounded-lg px-4 py-2 bg-blue-600 text-white disabled:opacity-50"
              >
                {isAddrSubmitting ? "Saving…" : "Save Address"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Pay */}
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
