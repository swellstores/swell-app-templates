# Swell managed frontend

Build locally with the pinned dependencies. Run `npm run cf-typegen`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` after changes. Deploy through `swell app push` from the parent Swell app; do not deploy directly to Cloudflare.

- Use `@swell/apps-sdk` on the server and `swell-js` in the browser. Pass public config from `/app-api/config` or a server component; never serialize the server context. Create server storefront clients per request. Render reads cookies; actions/routes own writes.
- Swell owns `/api`, `/functions`, GraphQL and existing platform routes. Frontend HTTP endpoints belong under `/app-api`; do not rewrite their public paths.
- Backend credentials stay in Worker code. For embedded apps, validate the existing `_swell_admin_session` against Swell and authorize each protected operation. Trusted store headers are not user authentication. Never create an unrestricted Backend API proxy.
- Public pages remain public. Cookie-authenticated mutations need CSRF protection; GET handlers must not mutate state.
- No additional customer bindings, secrets, KV, R2 or Cloudflare Images. Use Swell CDN and `SwellImage` for product images, and Workers Assets for bundled files.
- Swell controls CSP, CORS, deployment placement and response cache policy. Private responses must remain no-store. Do not expose source maps, `.dev.vars`, configuration or credentials as public assets.
