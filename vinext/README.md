# Swell app frontend

The frontend of a Swell app, built with [vinext](https://github.com/cloudflare/vinext)
(the Next.js App Router API on Vite), TypeScript and Tailwind CSS. Swell builds
it, hosts it and connects it to the store where the app is installed. You do
not need a Cloudflare account.

## Develop

From the app folder, one level above this one:

```sh
swell app dev
```

Open the address it prints. The home page shows three working patterns, each
in its own file:

| Card | Pattern | File |
| --- | --- | --- |
| Catalog | Read store data on the server | `components/catalog-card.tsx` |
| Cart | Use `swell-js` in the browser | `components/cart-card.tsx` |
| Visitor or staff | Recognize store staff and read private data | `components/staff-card.tsx` |

`lib/swell.ts` holds the server helpers they use. Add HTTP endpoints under
`app/app-api`, like `app/app-api/hello/route.ts`; Swell reserves `/api`.

Running `npm run dev` in this folder starts the frontend without Swell. The
page then says "Not connected to a store", which is expected.

## Check and deploy

```sh
npm run check     # typecheck and build, in this folder
swell app push    # build and deploy, from the app folder
```

## Working with an AI coding agent

[AGENTS.md](AGENTS.md) tells an agent how this frontend talks to Swell, where
each pattern lives, and the rules the platform enforces.

Requires Node.js 22.22.2 or newer. Managed hosting is in preview.
