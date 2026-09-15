# Contributing to Swell app templates

Keep each template independently usable. Do not add runtime imports from the repository root or sibling templates.

## Upstream provenance

`upstream.json` records the original generator versions and source revisions. Its `scaffoldCommand` entries use `frontend` as an example destination directory. The `init` commit preserves the original React and Vinext scaffold files; subsequent changes can be compared against that baseline. The storefront starter is imported from the source revision recorded under `react-storefront`.

C3 is a scaffolding tool, not a dependency of the generated apps. The managed-template procedure currently uses C3 **2.72.7** with automatic updates disabled. Update the tested generator version and the Swell CLI invocation together when qualifying a new release.

## Managed template verification

Use Node.js 22.22.2 and Bun 1.3.14 for the current verification environment:

```sh
npm ci
npx playwright install chromium
npm run verify
```

This checks `react`, `vinext` and `react-storefront`. To select one, pass its directory name, for example `npm run verify -- react-storefront`. React and Vinext use npm lockfiles; the storefront uses its Bun lockfile.

The checks copy the template to an isolated directory, install its lockfile, simulate C3 configuration changes, run the finalizer, check types/lint/tests, build, and exercise the local Worker and browser. Platform responses are mocked. These checks do not establish real Swell session, tunnel or managed deployment behavior. The GitHub Actions workflow runs the same checks.

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
