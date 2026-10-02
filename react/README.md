# Swell app frontend

The frontend of a Swell app, built with React, Vite and TypeScript. Swell builds
it, hosts it and connects it to the store where the app is installed. You do not
need a Cloudflare account.

The app has two parts. `src/` is a React app that renders in the browser.
`worker/` is a small server, a Cloudflare Worker, for the endpoints the browser
calls. There is no server rendering and no router: every page address serves the
same app, so add a client-side router when the app needs more pages.

## Develop

From the app folder, one level above this one:

```sh
swell app dev
```

Open the address it prints. Edits reload in place. This preview opens as a
visitor. Run `swell app dev --store-user` to be recognized as the store user
logged in to the CLI; anyone with the preview address then shares that access.
The Swell dashboard shows the deployed build, after `swell app push`.

Running `npm run dev` in this folder starts the frontend without Swell. The
home page then says "Not connected to a store", which is expected.

Swell signs the context it sends with each request, and the Worker verifies the
signature. To skip verification, for example when developing against a local
Swell instance, set `SWELL_VERIFY_HEADERS` to `"false"` in `.dev.vars`.
`swell app push` excludes this file; deployed apps always verify.

## Working patterns

The home page is a demonstration. Replace it and delete cards you do not need.
The code and this table are the starting points for extending the app:

| Need | Example |
| --- | --- |
| Read the catalog in the browser | `src/components/catalog-card.tsx` |
| Use the cart in the browser | `src/components/cart-card.tsx` |
| Recognize store users and read private Backend data | `getStoreUser` in `worker/index.ts`, `src/components/store-user-card.tsx` |
| Add a public endpoint or store-user-only POST | `getHello` and `postHello` in `worker/index.ts` |
| Configure the browser's `swell-js` client | `getConfig` in `worker/index.ts`, `src/App.tsx`, `src/components/swell-provider.tsx` |
| Display a Swell image | `src/components/swell-image.tsx` |

`worker/swell.ts` reads Swell's context from the request. The context contains
credentials: keep it in the Worker. Only `getStorefrontConfig(context)` goes to
the browser. Verify the context once per request and pass it on.

- **Storefront API:** call `useSwell()` from `src/swell.ts` in a component for
  products, cart, account and checkout. It works on the visitor's session
  cookie. Call its methods in effects and event handlers, not while rendering.
- **Backend API:** use `new SwellBackendAPI({ context })` in the Worker. It uses
  the app's access token, not the viewer's permissions. Authorize the caller
  before exposing private data. The Worker chooses the endpoint and query; the
  browser supplies only the inputs the operation needs.
- **Store users:** read `context.storeUser` for optional identity or call
  `requireStoreUser(context)` in a store-user-only handler. Anyone signed in to
  the store's dashboard counts, including partners and Swell support. The app
  decides what each store user may do. Swell's proxy withholds their identity on
  a request from another origin, unless it is a GET, HEAD or OPTIONS. So GET
  handlers must not change data.

Put endpoints under `/app-api`: Swell reserves `/api` and `/functions`. To add
one, write a handler in `worker/index.ts` and list it in `routes`. A `:name`
segment in the path arrives in the handler's `params` as it is in the URL, still
percent-encoded. The example POST only returns the store user; it changes no data.

`getSwellContext(request)` returns `null` when no context was supplied. An
invalid context or verification failure throws; it must not be treated as a
visitor. `requireContext(request)` is for endpoints that need the store and
explains how to start a connection.

Code under `src/` cannot use `@swell/apps-sdk`: the build fails when browser
code imports it, directly or through a file in `worker/`.

API reference: <https://developers.swell.is>. `@swell/apps-sdk` is the server
library; `swell-js` is the browser library. The SDK's README, installed under
`node_modules/@swell/apps-sdk`, covers the rest of the Backend client: app
settings (`backend.settings()`), function calls, transactions and workflows.

## Check and deploy

```sh
npm run check     # lint, typecheck and build, in this folder
swell app push    # build and deploy, from the app folder
```

Requires Node.js 22.22.2 or newer. Managed hosting is in preview.
