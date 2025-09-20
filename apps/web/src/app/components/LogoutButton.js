"use client";

import { logout } from "@/lib/auth.client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    try {
      await logout();
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
