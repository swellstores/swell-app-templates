"use client";

import { useState } from "react";
import Card from "@/components/card";

export default function ApiCard() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState("");

  async function sendRequest(method: "GET" | "POST") {
    setPending(true);
    setResult("");
    try {
      const response = await fetch("/app-api/hello", { method });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      setResult(JSON.stringify(body, null, 2));
    } catch (error) {
      setResult(`Request failed: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="API routes" runs="Route handler · server" file="app/app-api/hello/route.ts">
      <p>GET is public. POST requires a store user and changes no data.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {(["GET", "POST"] as const).map((method) => (
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
            type="button"
            onClick={() => sendRequest(method)}
            disabled={pending}
            key={method}
          >
            Try {method}
          </button>
        ))}
      </div>
      <div role="status" aria-busy={pending}>
        {pending ? <p className="mt-3">Requesting…</p> : result && (
          <pre className="mt-3 whitespace-pre-wrap break-words text-sm">{result}</pre>
        )}
      </div>
    </Card>
  );
}
