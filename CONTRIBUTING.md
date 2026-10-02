# Contributing to Swell app templates

Keep each template independently usable. Do not add runtime imports from the repository root or sibling templates.

## Upstream provenance

`upstream.json` records the original generator versions and source revisions. Its `scaffoldCommand` entries use `frontend` as an example destination directory. The `init` commit preserves the original React scaffold. Vinext was restarted from `create-vinext-app@1.0.0`; regenerate with its recorded command to compare with upstream. The storefront starter is imported from the source revision recorded under `react-storefront`.

C3 is a scaffolding tool, not a dependency of the generated apps. The managed-template procedure currently uses C3 **2.72.7** with automatic updates disabled. Update the tested generator version and the Swell CLI invocation together when qualifying a new release.

## Managed template verification

Use Node.js 22.22.2 and Bun 1.3.14 for the current verification environment:

```sh
npm ci
npx playwright install chromium
npm ci --prefix ../swell-cli
npm run build --prefix ../swell-cli
npm run verify
```

This checks `react`, `vinext` and `react-storefront`. To select one, pass its directory name, for example `npm run verify -- react-storefront`. React and Vinext use npm lockfiles; the storefront uses its Bun lockfile.

The checks copy the template to an isolated directory, install its lockfile, simulate C3 configuration changes, run the finalizer, check types and the available lint/tests scripts, build, and exercise the local Worker and browser. Vinext has no lint or test script; its checks are typechecking, building, package capture and the local Worker and browser. React runs its `check` script (lint, typecheck and build) and has no test script. For React and Vinext, capture checks the shipped template: cache off and only `ASSETS`, no local variables file, and for Vinext the retained SSR modules. Their runtime checks share one mock platform (`scripts/mock-platform.mjs`) and use a local signing key and JWKS service with signature verification enabled, plus mock Storefront and Backend APIs. They cover no context, first and returning visitor sessions, a store user with and without permission to read the user, a failing name lookup, a failing Storefront API, invalid signatures, expired context, concurrent store isolation, and the shipped store-user-only POST. The React scenario runs the same cases through its Worker endpoints and in Chromium, where the catalog and cart are read with `swell-js`. Foreign-origin writes are represented by the visitor context the platform supplies; these checks do not test the proxy's origin enforcement. Chromium adds an item through `swell-js`, reloads, and checks that the same session is used afterwards: by the server render in Vinext, by the browser in React. Generated packages and the result summary are written under `.verification/`. Capture requires a built sibling `swell-cli` checkout; set `SWELL_CLI_PACKAGE_MODULE` to the absolute path of another built CLI's `dist/lib/apps/frontend-package.js` to use it instead. Platform responses are mocked. These checks do not establish real Swell session, tunnel or managed deployment behavior. The GitHub Actions workflow runs the same checks using the public npm package `@swell/cli@2.9.21` for capture. It requires no private repository credentials or temporary source branch. Local verification can continue to use the built sibling checkout; qualify a new published CLI version before changing the CI pin.

## Vinext 1.0.0 base: deviations from upstream

The scaffold uses Wrangler mode with CDN/data caches, image optimization,
prerendering and cache warming disabled. These are generator options, not patches.
The complete changes to the generated tree are:

- `package.json`: name `frontend` and template version `0.1.4` for CLI scaffolding;
  exact direct dependency versions and an npm lockfile for reproducible installs;
  Node `>=22.22.2` for the qualified toolchain. Remove the generator's npm-only
  `packageManager` declaration so Corepack permits the CLI-selected Yarn manager.
- Scripts: remove direct Cloudflare `deploy`, since Swell owns deployment; add
  `preview`, `cf-typegen`, `typecheck` and the one-shot `prepare:managed` expected
  by local qualification and CLI scaffolding. Upstream `dev`, `build` and `start`
  remain unchanged. No lint or test framework is added to the base.
- `wrangler.jsonc`: Worker name `swell-vinext`, qualified date `2026-09-08` and
  empty compatibility flags, and a leading comment that tells the app developer
  the profile is fixed. Everything else is upstream's ASSETS-only config.
- `vite.config.ts`: allow Swell's `.trycloudflare.com`, `.swell.store` and
  `.swell.test` tunnel hosts.
- Move `app/api/hello` to `app/app-api/hello` because Swell owns `/api`.
- `scripts/prepare-managed.mjs` and its two byte-for-byte snapshots restore the
  managed settings after C3 rewrites them, then delete themselves.
- `.gitignore`: exclude generated Worker types, TypeScript build metadata and
  `.dev.vars` files.
- `.dev.vars`: names the header-signature verification switch, left enabled.
  It is tracked in this repository although `.gitignore` covers it, so a
  generated app gets the file and its git ignores it. Use `git add -f` to add
  it again.
  Managed package capture verifies that the file is excluded from deployment.
- No custom `_headers`, cache adapter or application tests are shipped.

The generated Vinext `_headers` comment and immutable static-asset rule are
accepted unchanged by backend admission. The backend replaces the beta profile:
cache-on packages and `CF_VERSION_METADATA` are rejected. C3 2.72.7 remote template
mode must still be qualified from a pushed candidate branch before moving `v0.1`;
the local-template CLI override and finalizer simulation do not qualify it.

## Vinext: the Swell layer

Everything Swell-specific sits on top of that base, written for the app developer
and their coding agent. Keep it minimal: one way to do each thing.

- `package.json`: `@swell/apps-sdk` and `swell-js`, pinned, and a `check` script
  (route type generation, typecheck without incremental state, and build).
- `lib/swell.ts`: the server helpers that bind the framework-neutral SDK to
  `headers()` and `cookies()`, with render-local context verification.
- `components/`: three cards, one pattern per file (server storefront read, browser
  cart through `swell-js`, store user check with a Backend API read), plus the card
  shell, the `swell-js` provider and `SwellImage`.
- `app/layout.tsx` passes the public config to the provider. `app/page.tsx` replaces
  the upstream sample cards with the three pattern cards and a "not connected"
  state for a page opened without Swell, and keeps upstream's "API route" link. The
  upstream layout and styling are kept.
- The code and `README.md` guide the app developer and coding agent. The shipped
  `POST /app-api/hello` demonstrates store user authorization without mutating data.
  Advanced recipes belong in the Swell app skill; no `AGENTS.md` is shipped.

## React: deviations from upstream

The base is C3's `react-ts` scaffold, preserved in the `init` commit. A fresh
scaffold with C3 2.73.2 and `create-vite` 9.2.1 on 2026-10-02 has the same source
files; only dependency ranges moved. The complete changes to the generated tree are:

- `package.json`: name `frontend` and template version `0.1.3` for CLI scaffolding;
  exact direct dependency versions and an npm lockfile for reproducible installs;
  Node `>=22.22.2`. Vite, `@cloudflare/vite-plugin` and Wrangler use the versions
  Vinext is qualified on, so both templates build with one Workers toolchain.
  TypeScript stays on upstream's 6.0 line.
- Scripts: remove direct Cloudflare `deploy`, since Swell owns deployment; add
  `typecheck`, `check` and the one-shot `prepare:managed`. Upstream `dev`, `build`,
  `lint` (oxlint with upstream's `.oxlintrc.json`), `preview` and `cf-typegen`
  remain unchanged. No test framework is added.
- `wrangler.jsonc`: Worker name `swell-react`, qualified date `2026-09-08` and
  empty compatibility flags; the `ASSETS` binding with `html_handling: none` and
  `run_worker_first`, so the Worker answers `/app-api` and passes everything else
  to the assets; observability and source-map upload off; and a leading comment
  that tells the app developer the profile is fixed, in place of upstream's
  configuration hints.
- `vite.config.ts`: allow Swell's `.trycloudflare.com`, `.swell.store` and
  `.swell.test` tunnel hosts.
- `public/_headers`: immutable caching for hashed `/assets/*`.
- `scripts/prepare-managed.mjs` and its two byte-for-byte snapshots restore the
  managed settings after C3 rewrites them, then delete themselves.
- `.gitignore`: upstream's.
- `.dev.vars`: names the header-signature verification switch, left enabled.
  Tracked in this repository although `.gitignore` covers it, as in Vinext.
  Managed package capture verifies that the file is excluded from deployment.
- `index.html`: the title.
- Removed: upstream's README, the hero image and Cloudflare logo, and the social
  links section with its styles.

`src/main.tsx`, `src/index.css`, the TypeScript configs, `.oxlintrc.json` and the
files under `public/` other than `_headers` are upstream's, unchanged.

## React: the Swell layer

The same patterns as Vinext, mapped to a client-rendered app with a Worker. Keep
it minimal: one way to do each thing.

- `package.json`: `@swell/apps-sdk` and `swell-js`, pinned.
- `worker/swell.ts`: reads and verifies Swell's context from the request.
  `worker/index.ts` replaces upstream's `/api/` example with a small route list
  under `/app-api`: the public config for `swell-js`, the store user check with a
  Backend API read, and the example endpoint with a store-user-only POST.
- `src/swell.ts` and `src/components/`: `useSwell()` and the `swell-js` provider,
  three cards, one pattern per file (browser catalog read, browser cart, store
  user check through the Worker), plus the card shell and `SwellImage`.
- `src/App.tsx` keeps upstream's page structure and replaces its two demo buttons
  with the three pattern cards, adds "connecting", "not connected" and "failed"
  states, and puts the Swell docs and the "API route" link among upstream's
  documentation links. `src/App.css` is upstream's, less the removed sections,
  plus the card styles on upstream's variables.
- The code and `README.md` guide the app developer and coding agent. No
  `AGENTS.md` is shipped.

## Fresh scaffold qualification

The Swell CLI scaffolds from the moving `v0.1` compatibility tag of this repository. degit resolves only branch and tag tips, never arbitrary commits, so qualify a candidate from a pushed branch before moving the tag:

```sh
npm create cloudflare@2.72.7 -- frontend --template=swellstores/swell-app-templates/react#<BRANCH> --deploy=false --git=false --no-agents --no-auto-update
```

Replace `react` with `vinext` or `react-storefront` to qualify another template. Use Bun for the storefront install and scripts as described in its README. In the generated directory, run `npm run prepare:managed` once before installing dependencies and generating types. C3 changes configuration, scripts and some dependency versions; the finalizer restores the committed manifest, including the template's package name, and restores `wrangler.jsonc` byte for byte. It then removes `prepare:managed` from the manifest and deletes itself and both snapshots, removing `scripts/` only if empty. The Swell CLI already performs this step during scaffolding. Follow the template README for the remaining checks.

Before releasing managed templates, verify fresh scaffolds with supported Node/package-manager versions, Swell CLI creation and finalization, dev/tunnels, and deployment through Swell to untrusted Workers for Platforms. Exercise real sessions and browser data access. Managed setup must not require a developer Cloudflare account. Record the tested template revision, tool versions, results and limitations.

## Storefront template verification

The storefront check builds the empty starter, then composes a temporary page using its commerce hooks and blocks. Browser checks exercise SDK product reads, cart additions, the checkout link, deep links and the existing editor bridge with mocked platform responses. No fixture pages are added to the template. Its Worker must keep `/app-api` unsupported and expose only public configuration. Preserve the imported source revision in `upstream.json` when making changes.

## Maintenance

Review Cloudflare/C3, framework and dependency updates weekly. Aim for monthly routine updates; expedite security and compatibility fixes. Run template checks on pull requests and complete fresh-scaffold and deployment qualification before release.

## Releases

The Swell CLI pins C3 and references the `v0.1` tag. A patch release moves that tag, so template hotfixes need no CLI release. A breaking template change gets the next minor tag and a CLI release that updates `FRONTEND_TEMPLATE_REF` to it.

1. Update exact dependencies and lockfiles, and bump each template's `version`.
2. Run `npm run sync` from the repository root. Each finalizer restores `scripts/managed-manifest.json` and `scripts/managed-wrangler.jsonc`, which are byte copies of the template's committed `package.json` and `wrangler.jsonc`; `npm run verify` fails while those snapshots are stale.
3. Run `npm run verify`, then qualify fresh scaffolds as described above.
4. Commit and push, then move the tag for a patch (`git tag -f v0.1 && git push --force origin v0.1`) or create the next minor tag.
5. Rerun the CLI's `npm run test:frontend-scaffolds` against the tag.
