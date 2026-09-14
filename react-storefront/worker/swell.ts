/**
 * Swell infrastructure — header extraction and HTML config injection.
 *
 * The Swell platform proxy forwards request headers; this module reads only
 * the public ones (swell-store-id, swell-public-key, swell-admin-url) for
 * injection into HTML as window.__SWELL__, which initializes swell-js.
 * Server-only credentials (e.g. swell-access-token) are intentionally not
 * exposed to the client.
 */

export interface Env {
  ASSETS: Fetcher;
  // Local-dev fallback: the platform proxy sets the swell-* request headers on
  // the deployed path, but the local vite/worker preview is hit directly (no
  // proxy), so these vars provide the same config via .dev.vars.
  SWELL_STORE_ID?: string;
  SWELL_PUBLIC_KEY?: string;
  SWELL_ADMIN_URL?: string;
}

/** Public Swell config injected into HTML as window.__SWELL__. */
export interface SwellClientConfig {
  storeId: string;
  publicKey: string;
  url: string;
}

/** Extract public Swell config from platform-injected request headers. */
export function extractSwellConfig(request: Request, env?: Env): SwellClientConfig {
  const storeId =
    request.headers.get("swell-store-id") || env?.SWELL_STORE_ID || "";
  const publicKey =
    request.headers.get("swell-public-key") || env?.SWELL_PUBLIC_KEY || "";
  const url =
    request.headers.get("swell-admin-url") ||
    env?.SWELL_ADMIN_URL ||
    `https://${storeId}.swell.store`;
  return { storeId, publicKey, url };
}
