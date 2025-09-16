import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Aroundtheway</h1>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <Link className="underline" href="/server-playground">
            Server-side fetch playground
          </Link>
        </li>
        <li>
          <Link className="underline" href="/client-playground">
            Client-side fetch playground
          </Link>
        </li>
      </ul>
    </main>
  );
}
