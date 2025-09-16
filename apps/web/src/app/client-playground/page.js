"use client";

import { useEffect, useState } from "react";
import { getStatus, getDbPing } from "@/lib/api/status.client";

export default function ClientPlayground() {
  const [status, setStatus] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    (async () => {
      setStatus(await getStatus());
      setDb(await getDbPing());
    })();
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Client-side fetch</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">API Status (Client)</h2>
        <pre className="text-sm mt-2">{JSON.stringify(status, null, 2)}</pre>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">DB Ping (Client)</h2>
        <p className="mt-2 text-sm">Result: {JSON.stringify(db, null, 2)}</p>
      </section>
    </main>
  );
}
