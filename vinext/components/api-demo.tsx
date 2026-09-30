"use client";

import { useState } from "react";

export default function ApiDemo() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState("");

  async function sendRequest() {
    setPending(true);
    setResult("");
    try {
      const response = await fetch("/app-api/hello");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setResult(JSON.stringify(await response.json(), null, 2));
    } catch (error) {
      setResult(`Request failed: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label="API route example" className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
          type="button"
          onClick={sendRequest}
          disabled={pending}
        >
          {pending ? "Requesting…" : "Try an API request"}
        </button>
        <code className="text-xs text-slate-600">GET /app-api/hello</code>
      </div>
      <div role="status">
        {result && <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-600">{result}</pre>}
      </div>
    </section>
  );
}
