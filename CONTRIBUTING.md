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

After publishing a candidate revision, substitute its commit SHA for `<COMMIT>`:

```sh
npm create cloudflare@2.72.7 -- frontend --template=swellstores/swell-app-templates/react#<COMMIT> --deploy=false --git=false --no-agents --no-auto-update
```

Replace `react` with `vinext` or `react-storefront` to qualify another template. Use Bun for the storefront install and scripts as described in its README. In the generated directory, run `npm run prepare:managed` before installing dependencies and generating types. Follow the template README for the remaining checks. C3 changes configuration and scripts; the finalizer restores managed settings and validates dependency declarations.

This remote-scaffold procedure still needs verification at a published candidate revision. Before releasing managed templates, verify fresh scaffolds with supported Node/package-manager versions, Swell CLI creation and finalization, dev/tunnels, and deployment through Swell to untrusted Workers for Platforms. Exercise real sessions and browser data access. Managed setup must not require a developer Cloudflare account. Record the tested template commit, tool versions, results and limitations, then update the CLI's template reference.

## Storefront template verification

The storefront check builds the empty starter, then composes a temporary page using its commerce hooks and blocks. Browser checks exercise SDK product reads, cart additions, the checkout link, deep links and the existing editor bridge with mocked platform responses. No fixture pages are added to the template. Its Worker must keep `/app-api` unsupported and expose only public configuration. Preserve the imported source revision in `upstream.json` when making changes.

## Maintenance

Review Cloudflare/C3, framework and dependency updates weekly. Aim for monthly routine updates; expedite security and compatibility fixes. For managed templates, update exact dependencies and lockfiles together with the finalizer's expected versions. Run template checks on pull requests and complete fresh-scaffold and deployment qualification before release.
