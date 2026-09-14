# src

## Children

- [hooks](hooks/CLAUDE.md)
- [pages](pages/CLAUDE.md)
- [storefront](storefront/CLAUDE.md)

## Files

### main.tsx

Storefront runtime bootstrap.

Generation agents should not edit this file during normal storefront authoring.
Define route mapping in App.tsx; pages then compose agent-authored sections.

### App.tsx

Storefront route composition surface.

Generation agents may edit this file to define the route tree only.
Import page components from concrete files in src/pages. Do not import
sections, blocks, hooks, Swell clients, or commerce actions in App.tsx. Use
the standard commerce route vocabulary for products/categories, and add custom
routes when the generated storefront needs custom pages.

Expected generated shape:

- import `Route` and `Routes` from `react-router-dom`;
- import generated page components from concrete files in `src/pages`;
- map standard commerce routes such as `/products`, `/products/:slug`,
  `/categories`, and `/categories/:slug` to page components;
- add custom page routes when needed by the storefront concept;
- optionally map `*` to a generated not-found page.

### theme.css

Agent-editable storefront design token values.

Allowed edits:

- change existing declaration values in :root and .dark;
- choose font-family values from fonts.ts and keep matching imports in
  fonts.css;
- keep every token name and both scopes intact.

Do not add selectors, token names, utilities, keyframes, media queries,
component CSS, remote font URLs, or package imports here.

:root:

- `--background`: `oklch(1 0 0)`
- `--foreground`: `oklch(0.145 0 0)`
- `--card`: `oklch(1 0 0)`
- `--card-foreground`: `oklch(0.145 0 0)`
- `--popover`: `oklch(1 0 0)`
- `--popover-foreground`: `oklch(0.145 0 0)`
- `--primary`: `oklch(0.205 0 0)`
- `--primary-foreground`: `oklch(0.985 0 0)`
- `--secondary`: `oklch(0.97 0 0)`
- `--secondary-foreground`: `oklch(0.205 0 0)`
- `--muted`: `oklch(0.97 0 0)`
- `--muted-foreground`: `oklch(0.556 0 0)`
- `--accent`: `oklch(0.97 0 0)`
- `--accent-foreground`: `oklch(0.205 0 0)`
- `--destructive`: `oklch(0.577 0.245 27.325)`
- `--destructive-foreground`: `oklch(0.985 0 0)`
- `--border`: `oklch(0.922 0 0)`
- `--input`: `oklch(0.922 0 0)`
- `--ring`: `oklch(0.708 0 0)`
- `--type-body`: `"Inter Variable", ui-sans-serif, system-ui, sans-serif`
- `--type-heading`: `"Inter Variable", ui-sans-serif, system-ui, sans-serif`
- `--type-mono`: `"JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace`
- `--radius`: `0.625rem`
- `--elevation-sm`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- `--elevation-md`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- `--elevation-lg`: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`

.dark:

- `--background`: `oklch(0.145 0 0)`
- `--foreground`: `oklch(0.985 0 0)`
- `--card`: `oklch(0.205 0 0)`
- `--card-foreground`: `oklch(0.985 0 0)`
- `--popover`: `oklch(0.205 0 0)`
- `--popover-foreground`: `oklch(0.985 0 0)`
- `--primary`: `oklch(0.922 0 0)`
- `--primary-foreground`: `oklch(0.205 0 0)`
- `--secondary`: `oklch(0.269 0 0)`
- `--secondary-foreground`: `oklch(0.985 0 0)`
- `--muted`: `oklch(0.269 0 0)`
- `--muted-foreground`: `oklch(0.708 0 0)`
- `--accent`: `oklch(0.269 0 0)`
- `--accent-foreground`: `oklch(0.985 0 0)`
- `--destructive`: `oklch(0.704 0.191 22.216)`
- `--destructive-foreground`: `oklch(0.985 0 0)`
- `--border`: `oklch(1 0 0 / 10%)`
- `--input`: `oklch(1 0 0 / 15%)`
- `--ring`: `oklch(0.556 0 0)`
- `--elevation-sm`: `none`
- `--elevation-md`: `none`
- `--elevation-lg`: `none`

### fonts.ts

Template-owned catalog used by generation and the storefront editor.

Available fonts:

- `archivo`: Archivo (sans) = `"Archivo Variable", ui-sans-serif, system-ui, sans-serif`
- `bricolage-grotesque`: Bricolage Grotesque (display) = `"Bricolage Grotesque Variable", ui-sans-serif, system-ui, sans-serif`
- `dm-sans`: DM Sans (sans) = `"DM Sans Variable", ui-sans-serif, system-ui, sans-serif`
- `epilogue`: Epilogue (sans) = `"Epilogue Variable", ui-sans-serif, system-ui, sans-serif`
- `fraunces`: Fraunces (display) = `"Fraunces Variable", ui-serif, Georgia, serif`
- `geist`: Geist (sans) = `"Geist Variable", ui-sans-serif, system-ui, sans-serif`
- `hanken-grotesk`: Hanken Grotesk (sans) = `"Hanken Grotesk Variable", ui-sans-serif, system-ui, sans-serif`
- `inter`: Inter (sans) = `"Inter Variable", ui-sans-serif, system-ui, sans-serif`
- `jetbrains-mono`: JetBrains Mono (mono) = `"JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace`
- `libre-franklin`: Libre Franklin (sans) = `"Libre Franklin Variable", ui-sans-serif, system-ui, sans-serif`
- `manrope`: Manrope (sans) = `"Manrope Variable", ui-sans-serif, system-ui, sans-serif`
- `newsreader`: Newsreader (serif) = `"Newsreader Variable", ui-serif, Georgia, serif`
- `playfair-display`: Playfair Display (display) = `"Playfair Display Variable", ui-serif, Georgia, serif`
- `plus-jakarta-sans`: Plus Jakarta Sans (sans) = `"Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif`
- `sora`: Sora (sans) = `"Sora Variable", ui-sans-serif, system-ui, sans-serif`
- `source-serif-4`: Source Serif 4 (serif) = `"Source Serif 4 Variable", ui-serif, Georgia, serif`
- `space-grotesk`: Space Grotesk (display) = `"Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif`

### fonts.css

Controlled storefront font catalog.

Keep only the font families selected by the storefront theme. Every import
must correspond to an installed entry from fonts.ts. Do not add remote font
URLs or font packages during storefront generation.

Current imports:

- `@fontsource-variable/inter/wght.css`
- `@fontsource-variable/jetbrains-mono/wght.css`
