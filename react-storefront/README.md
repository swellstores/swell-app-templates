# Swell React storefront starter

A client-only React + Vite starter for AI-generated Swell storefronts, with React Router, Tailwind CSS, commerce hooks and reusable UI components. All commerce data exchange uses `swell-js` in the browser. There is no SSR or `/app-api` layer; the Worker only serves assets and injects public store configuration.

**Preview:** this template targets Swell managed hosting. Released CLI integration and live deployment qualification are pending. The original source revision from `swellstores/storefront-react-ai-template` is recorded in the repository's `upstream.json`; the toolchain and hosting configuration have since been updated.

**This is a starter library, not a finished storefront.** `src/App.tsx` contains an empty route tree. Add pages and routes before expecting a visible storefront.

## Local setup

Use Node.js 22.22.2 (see `.nvmrc`) and Bun 1.3.14. From this directory:

```sh
bun run prepare:managed
bun install --frozen-lockfile
bun run cf-typegen
bun run dev
```

`prepare:managed` restores the managed Wrangler settings and scripts after C3 and checks the pinned dependency declarations. Keep the compatibility date aligned with the supported `2026-09-08` profile.

The development server uses port 3000 by default; set `PORT` to choose another port. Hot module replacement is disabled in the existing Vite configuration, so refresh the browser after edits.

For direct local development, create `.dev.vars` in this directory using your store's public configuration:

```dotenv
SWELL_STORE_ID=your-store-id
SWELL_PUBLIC_KEY=your-public-key
SWELL_ADMIN_URL=https://your-store-id.swell.store
```

The included `.gitignore` excludes `.dev.vars` from version control. Use a public Frontend API key, never a Backend API secret. The Worker injects these public values into HTML as `window.__SWELL__`. Requests routed through Swell use the platform's public headers in preference to these local fallback values.

## Build your storefront

- Define routes in `src/App.tsx` and page components in `src/pages/`.
- Compose pages from sections; sections use the public commerce hooks in `src/hooks/`.
- Use `src/storefront/blocks/` and `src/storefront/primitives/` for UI composition.
- Adjust the design tokens in `src/theme.css` and the font selection in `src/fonts.css`.

Read the [commerce hooks](src/docs/commerce-hooks.md) and [storefront architecture](src/docs/storefront-library-architecture.md) guides. The `CLAUDE.md` files describe the authoring boundaries for AI-assisted development.

## Checks and deployment

```sh
bun run typecheck
bun run lint
bun run test
bun run claude:check
bun run build
```

`bun run preview` builds and previews the app locally. For managed-hosting evaluation, put this directory at `frontend/` inside a Swell storefront app. Add `"hosting": "managed"` to the parent `swell.json` frontend configuration, preserving other settings:

```json
{ "frontend": { "hosting": "managed" } }
```

With a compatible Swell CLI and platform build, deploy using `swell app push` from the parent app. The package includes the infrastructure Worker and client assets; store configuration is supplied per request, so one build can serve multiple stores and environments. Deployment uses Swell's Cloudflare account.

Swell retains `/api` and its other platform routes. This template does not provide custom backend handlers. Add storefront features through the browser commerce hooks; do not add Backend API credentials or an application API layer.

## Assets and verification

The build emits no source maps. `public/_headers` marks hashed `/assets/*` immutable; Swell retains private browser caching while HTML containing store configuration stays no-store. Keep private files out of `public/`. Only the `ASSETS` binding is used, with no Cloudflare Images or other service bindings.

The root verification script builds this template and a temporary generated page, then checks public configuration, SDK reads, cart additions, checkout links, deep links and editor selection using local Workers and mocked platform responses. These checks do not qualify live Swell storefront passwords, customer purchase flows, dev/tunnels or deployment. Managed runtime logs are not currently exposed.
