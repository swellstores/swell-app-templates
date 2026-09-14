# Swell app templates

Starting points for building Swell app frontends and custom storefronts. Each template is self-contained; copy the selected directory without the repository's root tooling or sibling templates.

| Template | Use case | Status |
| --- | --- | --- |
| [React + Vite](react/README.md) | Client-rendered app with a Worker for server-side endpoints | Managed hosting preview |
| [Vinext](vinext/README.md) | App with server and client components and server-side endpoints | Managed hosting preview |
| [React storefront](react-storefront/README.md) | AI-generated client-only storefront with commerce hooks and UI components | Managed hosting preview |

The managed templates are under development. Released Swell CLI integration and end-to-end deployment verification are pending; they are not yet a supported managed-hosting quickstart. The development CLI supports `--frontend swell-react`, `swell-vinext`, and `swell-spa`; see the template READMEs for preview commands. The repository directory names are unchanged.

The storefront starter has an empty route tree for AI-authored pages. It uses browser-side `swell-js` and has no `/app-api` layer; its Worker only serves assets and supplies public configuration. The React and Vinext app templates support server-side endpoints.

See the selected template's README for setup, configuration and limitations. See [CONTRIBUTING.md](CONTRIBUTING.md) for template verification, upstream provenance and release procedures.
