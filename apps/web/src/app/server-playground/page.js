import { getStatus, getDbPing } from "@/lib/api/status.server";

export default async function ServerPlayground() {
  const [status, db] = await Promise.all([getStatus(), getDbPing()]);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Server-side fetch</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">API Status (SSR)</h2>
        <pre className="text-sm mt-2">{JSON.stringify(status, null, 2)}</pre>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">DB Ping (SSR)</h2>
        <p className="mt-2 text-sm">Result: {JSON.stringify(db, null, 2)}</p>
      </section>
    </main>
  );
}
