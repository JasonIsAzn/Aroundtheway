import Link from "next/link";
import { getMeServer } from "@/lib/auth.server";
import LogoutButton from "./components/LogoutButton";

export default async function Home() {
  const user = await getMeServer();

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        🛠️ Dev Debug Area
      </h1>

      {user && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg shadow w-full max-w-md">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            ✅ Logged In User
          </h2>
          <ul className="text-sm text-green-700 space-y-1">
            <li>
              <strong>ID:</strong> {user.id}
            </li>
            <li>
              <strong>Email:</strong> {user.email}
            </li>
            <li>
              <strong>CreatedAt:</strong> {user.createdAt}
            </li>
            <li>
              <strong>UpdatedAt:</strong> {user.updatedAt}
            </li>
            <li>
              <strong>IsAdmin:</strong> {String(user.isAdmin)}
            </li>
            <li>
              <strong>Address:</strong> {user.address}
            </li>
            <li>
              <strong>CreditCard:</strong> {user.creditCard}
            </li>
          </ul>
          <LogoutButton />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <Link
          href="/client-playground"
          className="block bg-white shadow hover:shadow-lg rounded-lg p-4 text-center border border-gray-200 hover:border-blue-500 transition"
        >
          <p className="text-lg font-semibold text-gray-700">
            Client Playground
          </p>
          <p className="text-sm text-gray-500">Test Connection</p>
        </Link>

        <Link
          href="/server-playground"
          className="block bg-white shadow hover:shadow-lg rounded-lg p-4 text-center border border-gray-200 hover:border-blue-500 transition"
        >
          <p className="text-lg font-semibold text-gray-700">
            Server Playground
          </p>
          <p className="text-sm text-gray-500">Test Connection</p>
        </Link>

        <Link
          href="/login"
          className="block bg-white shadow hover:shadow-lg rounded-lg p-4 text-center border border-gray-200 hover:border-green-500 transition"
        >
          <p className="text-lg font-semibold text-gray-700">Login Page</p>
          <p className="text-sm text-gray-500">Go to login form</p>
        </Link>

        <Link
          href="/register"
          className="block bg-white shadow hover:shadow-lg rounded-lg p-4 text-center border border-gray-200 hover:border-purple-500 transition"
        >
          <p className="text-lg font-semibold text-gray-700">Register Page</p>
          <p className="text-sm text-gray-500">Go to register form</p>
        </Link>
      </div>
    </main>
  );
}
