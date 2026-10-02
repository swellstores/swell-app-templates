# Swell app templates

Starting points for building Swell app frontends and custom storefronts. Each template is self-contained; copy the selected directory without the repository's root tooling or sibling templates.

| Template | Use case | Status |
| --- | --- | --- |
| [React + Vite](react/README.md) | Client-rendered app with a Worker for server-side endpoints and working Swell patterns | Managed hosting preview |
| [Vinext](vinext/README.md) | App with server and client components, server-side endpoints and working Swell patterns | Managed hosting preview |
| [React storefront](react-storefront/README.md) | AI-generated client-only storefront with commerce hooks and UI components | Managed hosting preview |

The managed templates are under development. Released Swell CLI integration and end-to-end deployment verification are pending; they are not yet a supported managed-hosting quickstart. The development CLI supports `--frontend swell-react`, `swell-vinext`, and `swell-spa`; see the template READMEs for preview commands. The repository directory names are unchanged.

The storefront starter has an empty route tree for AI-authored pages. It uses browser-side `swell-js` and has no `/app-api` layer; its Worker only serves assets and supplies public configuration. The React and Vinext app templates support server-side endpoints. React is Cloudflare's `react-ts` scaffold with the Swell SDK and the same home page and example endpoint as Vinext; it reads the catalog in the browser and checks the store user through its Worker. Vinext is a `create-vinext-app@1.0.0` base with the Swell SDK, a home page of three working patterns (a server-side storefront read, a browser cart and a store user check) and an example endpoint with a store-user-only POST, with guidance in the code and README. Its response cache is off and its only binding is `ASSETS`.

See the selected template's README for setup, configuration and limitations. See [CONTRIBUTING.md](CONTRIBUTING.md) for template verification, upstream provenance and release procedures.
