# Managed React storefront

This is a client-rendered template for AI-generated storefronts on Swell managed hosting. Includes Swell's storefront visual editor support.

- Build storefront pages in `src/pages`, compose sections, and use the public commerce hooks from `@/hooks`. Keep the empty route tree until storefront pages are authored.
- All commerce data exchange uses `swell-js` in the browser. No SSR, server actions, Backend API client or `/app-api` layer. The Worker is infrastructure for assets and public HTML configuration only.
- Preserve request-time `window.__SWELL__` configuration. Never embed store/environment values during a build or expose backend headers, credentials or admin sessions.
- Swell owns `/api`, `/functions` and its other platform routes. Do not intercept platform requests with storefront handlers.
- Keep the managed Wrangler profile, only the `ASSETS` binding, and immutable hashed-asset headers. Never publish source maps, `.dev.vars` or private configuration.
- Deploy from the parent Swell app using `swell app push`; do not add direct Cloudflare deployment scripts.
