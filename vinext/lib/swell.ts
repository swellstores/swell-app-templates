import { cookies, headers } from "next/headers";
import { getStorefrontConfig, parseSwellHeaders, requireStaff, SwellBackendAPI, SwellError } from "@swell/apps-sdk";
import { createStorefrontClient } from "@swell/apps-sdk/storefront";

// Server-side access to Swell. Swell adds the store's context and credentials
// to every request it sends to this app; these helpers read them per request.

// Store context, or null when the page was opened without Swell (plain `npm run dev`).
export async function getSwellContext() {
  const { storeId, appId, environmentId, storefrontId } = parseSwellHeaders(await headers());
  return storeId ? { storeId, appId, environmentId, storefrontId } : null;
}

// Swell's request headers, or an error that says how to get them.
async function swellHeaders() {
  const swell = await headers();
  if (!swell.get("Swell-Store-Id")) {
    throw new Error("Not connected to a store. Run `swell app dev` from the app folder and open the address it prints.");
  }
  return swell;
}

// Public store settings for swell-js in the browser, or null when not connected.
export async function getPublicConfig() {
  return (await getSwellContext()) ? getStorefrontConfig(await headers()) : null;
}

// Storefront API client on the visitor's session: products, cart, account.
// Swell may issue or refresh the session cookie on any call. Route handlers and
// server actions save it; a page cannot set cookies while it renders, so there
// the write is skipped and the browser keeps the session it has.
export async function getStorefront() {
  const jar = await cookies();
  return createStorefrontClient(getStorefrontConfig(await swellHeaders()), {
    cookies: {
      get: (name) => jar.get(name)?.value,
      set: (name, value, options) => {
        try {
          jar.set(name, value, options);
        } catch {
          // Rendering a page: cookies are read-only.
        }
      },
    },
  });
}

// Backend API client with this app's access token. Its data is not public:
// check who is asking (getStaff, requireStaffRequest) before returning any of it.
export async function getBackend() {
  return new SwellBackendAPI({ headers: await swellHeaders() });
}

// The staff member viewing a page in the Swell dashboard, or null for a visitor.
// For reads in pages only. Anything that changes data goes through a route
// handler and requireStaffRequest.
export async function getStaff() {
  const jar = await cookies();
  if (!jar.has("_swell_admin_session")) return null;
  try {
    return await requireStaff({
      headers: await headers(),
      method: "GET",
      origin: "", // Checked for writes only; see requireStaffRequest.
      cookies: { get: (name) => jar.get(name)?.value },
    });
  } catch (error) {
    if (error instanceof SwellError && error.status === 401) return null;
    throw error;
  }
}

// Staff check for route handlers under /app-api. Throws a SwellError with status
// 401 when the caller is not staff of this store, and 403 when a request that
// changes data did not come from this app's own pages.
export async function requireStaffRequest(request: Request) {
  const jar = await cookies();
  return requireStaff({
    headers: request.headers,
    method: request.method,
    origin: new URL(request.url).origin,
    cookies: { get: (name) => jar.get(name)?.value },
  });
}
