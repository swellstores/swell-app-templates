# Swell app frontend

The frontend of a Swell app, built with [vinext](https://github.com/cloudflare/vinext),
TypeScript and Tailwind CSS. Swell builds it, hosts it and connects it to the
store where the app is installed. You do not need a Cloudflare account.

Vinext implements the Next.js App Router API on Vite. Use `app/`, server and
client components, route handlers and `next/*` imports. Vinext provides those
imports; do not install the `next` package. Pages render on each request;
response caching, prerendering and image optimization are off.

## Develop

From the app folder, one level above this one:

```sh
swell app dev
```

Open the address it prints. Edits reload in place. This preview opens as a
visitor. To see store user access, run `swell app push` and open the app from the
Swell dashboard, which shows the deployed build.

Running `npm run dev` in this folder starts the frontend without Swell. The
home page then says "Not connected to a store", which is expected.

`.dev.vars` disables Swell header-signature verification for local development,
including development against a local Swell instance. Remove `SWELL_VERIFY_HEADERS`
or set it to `"true"` to enable verification. `swell app push` excludes this file;
deployed apps verify signatures by default.

## Working patterns

The home page is a demonstration. Replace it and delete cards you do not need.
The code and this table are the starting points for extending the app:

| Need | Example |
| --- | --- |
| Read catalog data on the server | `components/catalog-card.tsx` |
| Use the visitor's cart in the browser | `components/cart-card.tsx` |
| Recognize store users and read private Backend data | `components/store-user-card.tsx` |
| Add a public endpoint or store-user-only POST | `app/app-api/hello/route.ts` |
| Call an endpoint from the browser | `components/api-card.tsx` |
| Configure the browser's `swell-js` client | `app/layout.tsx`, `components/swell-provider.tsx` |
| Display a Swell image | `components/swell-image.tsx` |

`lib/swell.ts` connects the server SDK to the framework. It reads Swell's context
per request and shares verification within a server render. The context contains
credentials: keep it on the server. Only `getPublicConfig()` goes to the browser.

- **Storefront API:** use `getStorefront()` on the server or `useSwell()` in a
  client component for products, cart, account and checkout. They share the
  visitor's session cookie. Prefer browser effects and event handlers for cart
  and account changes; server actions and route handlers can also save cookies,
  while a page render cannot.
- **Backend API:** use `getBackend()` on the server. It uses the app's access
  token, not the viewer's permissions. Authorize the caller before exposing
  private data. The server chooses the endpoint and query; the browser supplies
  only the inputs the operation needs.
- **Store users:** read `context.storeUser` for optional identity or call
  `requireStoreUser()` from `lib/swell` in a store-user-only route handler or
  server action. Anyone signed in to the store's dashboard counts, including
  partners and Swell support. The app decides what each store user may do.
  Swell's proxy withholds their identity on foreign-origin writes. Pages and GET
  handlers must not change data.

Put frontend endpoints under `app/app-api`: Swell reserves `/api` and
`/functions`. The example POST only returns the store user; it changes no data.

`getSwellContext()` returns `null` when no context was supplied. An invalid
context or verification failure throws; it must not be treated as a visitor.
The other server helpers require a connection and explain how to start one.

API reference: <https://developers.swell.is>. `@swell/apps-sdk` is the server
library; `swell-js` is the browser library.

## Check and deploy

```sh
npm run check     # generate route types, typecheck and build, in this folder
swell app push    # build and deploy, from the app folder
```

Requires Node.js 22.22.2 or newer. Managed hosting is in preview.
