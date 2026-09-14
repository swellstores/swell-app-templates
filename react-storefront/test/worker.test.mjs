import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker/index.ts";
import { extractSwellConfig } from "../worker/swell.ts";

const headers = {
  "Swell-Store-Id": "fixture",
  "Swell-Public-Key": "public-key",
  "Swell-Admin-Url": "https://fixture.swell.store",
  "Swell-API-Host": "https://backend.example.invalid",
  "Swell-Access-Token": "private-token",
  Cookie: "_swell_admin_session=private-session",
};
const request = (path = "/", extra = {}) =>
  new Request(`https://store.example${path}`, {
    headers: { ...headers, ...extra },
  });
const env = {
  ASSETS: {
    fetch: async () =>
      new Response('<html><head></head><body><div id="root"></div></body></html>', {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600",
          ETag: "static",
        },
      }),
  },
};

test("HTML contains only public request context and is never cached", async () => {
  const response = await worker.fetch(request(), env);
  const html = await response.text();
  assert.match(html, /window\.__SWELL__=/);
  assert.match(html, /fixture\.swell\.store/);
  for (const secret of ["private-token", "private-session", "backend.example.invalid"])
    assert(!html.includes(secret));
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(response.headers.get("ETag"), null);
});

test("context is extracted per request, including environment-specific API origin", async () => {
  for (const store of ["first", "second"]) {
    const response = await worker.fetch(
      request("/products/example", {
        "Swell-Store-Id": store,
        "Swell-Admin-Url": `https://${store}-test.swell.store`,
      }),
      env,
    );
    assert.match(await response.text(), new RegExp(`https://${store}-test.swell.store`));
  }
});

test("public values cannot close the script or act as replacement-string tokens", async () => {
  const value = "</script><script>alert(1)</script>$&";
  const html = await (await worker.fetch(request("/", { "Swell-Public-Key": value }), env)).text();
  assert(!html.includes("<script>alert(1)"));
  const serialized = html.match(/window\.__SWELL__=(.*);<\/script>/)[1];
  assert.equal(JSON.parse(serialized).publicKey, value);
});

test("local public variables are fallbacks; platform headers take precedence", () => {
  const local = {
    SWELL_STORE_ID: "local",
    SWELL_PUBLIC_KEY: "local-key",
    SWELL_ADMIN_URL: "http://localhost:4000",
  };
  assert.deepEqual(extractSwellConfig(new Request("http://localhost"), local), {
    storeId: "local",
    publicKey: "local-key",
    url: "http://localhost:4000",
  });
  assert.equal(extractSwellConfig(request(), local).storeId, "fixture");
});

test("static assets keep their original bytes and cache headers", async () => {
  const response = await worker.fetch(request("/assets/app.js"), {
    ASSETS: {
      fetch: async () =>
        new Response("export {};", {
          headers: {
            "Content-Type": "text/javascript",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        }),
    },
  });
  assert.equal(await response.text(), "export {};");
  assert.match(response.headers.get("Cache-Control"), /immutable/);
});

test("API paths never fall through to the SPA or provide backend operations", async () => {
  for (const path of [
    "/api",
    "/api/products",
    "/app-api",
    "/app-api/context",
    "/app-api/admin/product-count",
  ]) {
    const response = await worker.fetch(request(path), {
      ASSETS: {
        fetch: () => {
          throw new Error("API paths must not serve the SPA");
        },
      },
    });
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, "Not Found");
  }
});

test("HEAD HTML responses have no body and no shared caching", async () => {
  const response = await worker.fetch(
    new Request("https://store.example/", { method: "HEAD", headers }),
    env,
  );
  assert.equal(await response.text(), "");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
});
