import { cookies, headers } from "next/headers";
import { getStorefrontConfig, requireStoreUser as checkStoreUser, SwellBackendAPI, SwellError, verifySwellContext, type SwellRequestContext } from "@swell/apps-sdk";
import { createStorefrontClient } from "@swell/apps-sdk/storefront";

// Server-only request context, including credentials. Never pass it to the browser.
// Verified once per request, keyed by the request's headers: the signed context is
// valid for about a minute, so verifying it again late in a slow request would fail.
// No context means plain `npm run dev`; an invalid context still throws.
const verified = new WeakMap<Headers, Promise<SwellRequestContext | null>>();

export async function getSwellContext() {
  const incoming = await headers();
  let context = verified.get(incoming);
  if (!context) {
    context = incoming.get("Swell-Context") === null ? Promise.resolve(null) : verifySwellContext(incoming);
    verified.set(incoming, context);
  }
  return context;
}

async function requireContext() {
  const context = await getSwellContext();
  if (!context) {
    throw new SwellError("Not connected to a store. Run `swell app dev` from the app folder and open the address it prints.", {
      status: 401,
      code: "invalid_swell_context",
    });
  }
  return context;
}

// Only this public projection may be passed to swell-js in the browser.
export async function getPublicConfig() {
  const context = await getSwellContext();
  return context ? getStorefrontConfig(context) : null;
}

// Storefront API client on the visitor's session: products, cart, account.
// Swell may issue or refresh the session cookie on any call. Route handlers and
// server actions save it; a page cannot set cookies while it renders, so there
// the write is skipped and the browser keeps the session it has.
export async function getStorefront() {
  const config = getStorefrontConfig(await requireContext());
  const jar = await cookies();
  return createStorefrontClient(config, {
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

// Backend API with this app's access token. Authorize the caller before exposing
// private data; see context.storeUser in the store user card and requireStoreUser
// in the POST.
export async function getBackend() {
  return new SwellBackendAPI({ context: await requireContext() });
}

// For store-user-only route handlers or server actions; throws a 401 for visitors.
// Swell's proxy authenticates store users and withholds their identity on
// foreign-origin writes. Any dashboard role counts; the app decides further permissions.
// Pages and GET handlers must not change data.
export async function requireStoreUser() {
  return checkStoreUser(await requireContext());
}
