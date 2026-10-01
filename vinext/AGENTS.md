# Swell app frontend

This folder is the frontend of a Swell app. The folder above it is the app
itself (`swell.json`, models, functions, settings). Swell builds this frontend,
hosts it, and sends every request to it with the store's context attached.

## vinext, not Next.js

The framework is [vinext](https://github.com/cloudflare/vinext): the Next.js
App Router API running on Vite. Write App Router code as usual (`app/`, server
and client components, route handlers, `next/headers`, `next/navigation`,
`next/link`). vinext provides the `next/*` imports; there is no `next` package
and you must not add one. The commands are `vite dev` and `vite build`.

Every page renders on each request. Caching, prerendering and image
optimization are off.

## See your work

1. `npm run check` typechecks and builds. Run it after every change.
2. The app has a store only when it is opened through Swell. From the app
   folder run `swell app dev -y`, leave it running, and open the address it
   prints. Edits reload in place. That address opens as a visitor. The Swell
   dashboard shows the deployed frontend (the last `swell app push`), not this
   preview.

## Where things are

| Need | File |
| --- | --- |
| Reach Swell from server code | `lib/swell.ts` |
| Read store data while rendering a page | `components/catalog-card.tsx` |
| Use `swell-js` in the browser (cart, account, checkout) | `components/cart-card.tsx`, `components/swell-provider.tsx` |
| Show something to staff only | `components/staff-card.tsx` |
| Show an image stored in Swell | `components/swell-image.tsx` |
| Add an HTTP endpoint | `app/app-api/hello/route.ts` |
| Browser setup for `swell-js` | `app/layout.tsx` |

The home page (`app/page.tsx`) is a demonstration. Replace it and delete the
cards you do not need; keep `lib/swell.ts` and the provider.

## The two APIs

- **Storefront API**: what a shopper may see and do, on the shopper's own
  session. Products, cart, account, checkout. On the server use
  `getStorefront()`; in the browser use `useSwell()`. Both have the same
  methods and share one session cookie, so a cart changed in the browser is
  the cart the server reads.
- **Backend API**: everything in the store, with this app's access token.
  Server only: `getBackend()`. Whatever it returns is private until you have
  checked who is asking.

Staff open the app inside the Swell dashboard, and the dashboard's session
cookie comes with their requests. `getStaff()` and `requireStaffRequest()`
verify it. On a staff-only page, show a "staff only" message or call
`notFound()` when `getStaff()` returns `null`.

`@swell/apps-sdk` is the server library behind `lib/swell.ts`; `swell-js` is
the browser library. API reference: <https://developers.swell.is>.

Things that are easy to get wrong:

- Backend lists take `limit`, `page`, `sort` (`"date_created desc"`), `fields`
  (`"name,price"`), `where` and `expand`, and return `{ count, results, page }`
  (type `SwellCollection<T>` from `@swell/apps-sdk`).
- A Backend `put` to an id that does not exist creates the record. Read it
  first when that matters.
- Backend failures throw `SwellError`, which has a `status`. With the
  Storefront client a missing record is `null`, a refused cart or account
  change is returned as `{ errors }`, and anything else throws an `Error`.
- Prices are numbers next to a `currency` code. Format them with
  `Intl.NumberFormat`.
- For cart and account actions prefer the browser (`useSwell()`). Use a server
  action only when the change has to happen on the server.

## Recipes for what the template does not include

### Staff write

A change that only store staff may make is a route handler that starts with
`requireStaffRequest`. Call it from a client component with `fetch`.

```ts
// app/app-api/products/[id]/route.ts
import { SwellError } from "@swell/apps-sdk";
import { getBackend, requireStaffRequest } from "@/lib/swell";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaffRequest(request);
  } catch (error) {
    if (!(error instanceof SwellError)) throw error;
    return Response.json({ error: error.message }, { status: error.status });
  }

  const { id } = await params;
  const { name } = (await request.json()) as { name: string };
  const backend = await getBackend();
  const product = await backend.put<{ id: string; name: string }>(`/products/${encodeURIComponent(id)}`, { name });
  return Response.json({ id: product.id, name: product.name });
}
```

```ts
await fetch(`/app-api/products/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
```

`request.url` is this app's public address, under `swell app dev` and when
deployed. The origin check depends on that.

### Visitor cart write on the server

A server action may change the visitor's cart. The session cookie is saved
because actions can set cookies.

```ts
// app/actions.ts
"use server";

import { getStorefront } from "@/lib/swell";

export async function addToCart(productId: string) {
  const storefront = await getStorefront();
  const cart = await storefront.cart.addItem({ product_id: productId, quantity: 1 });
  if ("errors" in cart) throw new Error("This product cannot be added as it is.");
  return cart.item_quantity ?? 0;
}
```

### App settings

Settings are defined in the app's `settings/` folder and edited by the merchant.
Values are grouped by file name.

```ts
const backend = await getBackend();
const settings = await backend.settings();
const greeting = settings.general?.greeting; // settings/general.json, field "greeting"
```

### App function

Call a function from the app's `functions/` folder.

```ts
const swell = await getSwellContext();
const backend = await getBackend();
const result = await backend.functions.call(swell!.appId!, "function-name", { any: "data" });
```

### Custom model

Records of a model from the app's `models/` folder live under the app's id.

```ts
const swell = await getSwellContext();
const backend = await getBackend();
const reviews = await backend.get(`/apps/${swell!.appId}/reviews`, { limit: 10 });
```

## Rules

- **Endpoints live under `/app-api`.** Swell owns `/api`, `/functions` and
  other platform paths; a request to them never reaches this app.
- **Backend data is private.** Before returning anything from `getBackend()`,
  check the viewer with `getStaff()` in a page or `requireStaffRequest()` in a
  route handler, unless the data is meant for every visitor. The handler
  decides which Backend path and query are used; the browser supplies only ids
  and values, and ids are encoded into the path.
- **Staff writes are route handlers, not server actions.** The staff check
  compares the request's origin with this app's address to stop other sites
  from acting as the signed-in staff member. A server action has no request to
  take that address from.
- **Pages and `GET` handlers do not change data.** The origin check applies to
  other methods only.
