"use client";

import { useEffect, useState } from "react";
import { getMe, updateMyAddress } from "@/lib/users.client";
import LogoutButton from "../components/LogoutButton";
import { getMyTransactions } from "@/lib/transaction.client";

const money = (cents, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format((cents || 0) / 100);

export default function UserProfile() {
  const [email, setEmail] = useState("");
  const [googleSub, setGoogleSub] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [formState, setFormState] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMe();
        setEmail(data.email || "");
        setGoogleSub(data.googleSub || "");
        setCreatedAt(data.createdAt || "");
        setUpdatedAt(data.updatedAt || "");
        setFormState({
          address: data.address?.address || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zipCode: data.address?.zipCode || "",
          country: data.address?.country || "",
        });
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsLoading(false);
      }
    };

    const loadTransactions = async () => {
      setTxLoading(true);
      try {
        const list = await getMyTransactions();
        setTransactions(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to load transactions", e);
        setTransactions([]);
      } finally {
        setTxLoading(false);
      }
    };

    loadProfile();
    loadTransactions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
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
    setErrors(next);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        address: formState.address || null,
        city: formState.city || null,
        state: formState.state || null,
        zipCode: formState.zipCode || null,
        country: formState.country || null,
      };

      await updateMyAddress(payload);
      const me = await getMe();
      if (me?.updatedAt) setUpdatedAt(me.updatedAt);
      alert("Address updated successfully!");
    } catch (e) {
      console.error("Profile update error:", e);
      alert(
        "Profile update failed. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-gray-600">Update your address</p>
          </div>

          <div className="px-6 pt-6 space-y-4">
            {/* Email display */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email (read-only)
              </label>
              <div className="mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">
                {email || "—"}
              </div>
            </div>

            {/* Optional metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500">Google Sub</span>
                <span className="block text-gray-900 break-all">
                  {googleSub || "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Created At</span>
                <span className="block text-gray-900">
                  {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Last Updated</span>
                <span className="block text-gray-900">
                  {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Address Information
              </h2>

              <div className="space-y-4">
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
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your street address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
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
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
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
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.state}
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
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      placeholder="ZIP Code"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.zipCode}
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
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    placeholder="Enter your country"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              My Transactions
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Your recent purchases (most recent first).
            </p>
          </div>

          <div className="px-6 py-4 overflow-x-auto">
            {txLoading ? (
              <p className="text-gray-500">Loading transactions…</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Address</th>
                    <th className="py-2 pr-4">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 pr-4 font-mono">{t.id}</td>
                      <td className="py-2 pr-4">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {money(
                          t.totalCents,
                          (t.currency || "USD").toUpperCase()
                        )}
                      </td>
                      <td
                        className="py-2 pr-4 truncate max-w-[280px]"
                        title={t.address}
                      >
                        {t.address || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {Array.isArray(t.items) && t.items.length > 0
                          ? t.items
                              .map((i) => `${i.name} ×${i.quantity}`)
                              .join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}
