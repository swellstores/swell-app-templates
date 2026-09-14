import { type Env, extractSwellConfig } from "./swell.ts";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Swell owns /api. This client-only template has no application API layer.
    if (
      ["/api", "/app-api"].some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )
    ) {
      return Response.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    // Static assets: fetch from ASSETS binding, inject public Swell config.
    const assetResponse = await env.ASSETS.fetch(request);

    const contentType = assetResponse.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return assetResponse;
    }

    // Extract public config from Swell platform headers, inject into HTML
    const swellConfig = extractSwellConfig(request, env);

    const html = stripViteDevClient(await assetResponse.text());
    // Escape '<' so public context cannot terminate the inline script element.
    const configJson = JSON.stringify(swellConfig).replace(/</g, "\\u003c");
    const injectedHtml = html.replace(
      "</head>",
      () => `<script>window.__SWELL__=${configJson};</script>\n</head>`,
    );

    const headers = new Headers(assetResponse.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "private, no-store");
    headers.delete("content-length");
    headers.delete("etag");

    return new Response(request.method === "HEAD" ? null : injectedHtml, {
      status: assetResponse.status,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;

function stripViteDevClient(html: string) {
  return html.replace(/\s*<script\b[^>]*\bsrc=["']\/@vite\/client["'][^>]*><\/script>\s*/g, "\n");
}
