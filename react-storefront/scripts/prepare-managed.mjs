import fs from "node:fs/promises";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL("package.json", root), "utf8"));
const expected = {
  dependencies: {
    "@fontsource-variable/archivo": "5.3.0",
    "@fontsource-variable/bricolage-grotesque": "5.3.0",
    "@fontsource-variable/dm-sans": "5.3.0",
    "@fontsource-variable/epilogue": "5.3.0",
    "@fontsource-variable/fraunces": "5.3.0",
    "@fontsource-variable/geist": "5.3.0",
    "@fontsource-variable/hanken-grotesk": "5.3.0",
    "@fontsource-variable/inter": "5.3.0",
    "@fontsource-variable/jetbrains-mono": "5.3.0",
    "@fontsource-variable/libre-franklin": "5.3.0",
    "@fontsource-variable/manrope": "5.3.0",
    "@fontsource-variable/newsreader": "5.3.0",
    "@fontsource-variable/playfair-display": "5.3.0",
    "@fontsource-variable/plus-jakarta-sans": "5.3.0",
    "@fontsource-variable/sora": "5.3.0",
    "@fontsource-variable/source-serif-4": "5.3.0",
    "@fontsource-variable/space-grotesk": "5.3.0",
    "class-variance-authority": "0.7.1",
    clsx: "2.1.1",
    "embla-carousel-react": "8.6.0",
    "lucide-react": "0.525.0",
    "next-themes": "0.4.6",
    "radix-ui": "1.6.7",
    react: "19.3.0",
    "react-dom": "19.3.0",
    "react-router-dom": "6.30.0",
    sonner: "2.0.7",
    "swell-js": "5.8.1",
    "tailwind-merge": "3.6.0",
    "tw-animate-css": "1.4.0",
    vaul: "1.1.2",
    zustand: "5.0.14",
  },
  devDependencies: {
    "@cloudflare/vite-plugin": "1.54.9",
    "@eslint/js": "9.39.4",
    "@tailwindcss/vite": "4.3.3",
    "@types/node": "24.13.4",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.1",
    eslint: "9.39.4",
    "eslint-config-prettier": "10.1.8",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "eslint-plugin-react-refresh": "0.4.26",
    globals: "16.5.0",
    prettier: "3.8.3",
    shadcn: "4.16.0",
    tailwindcss: "4.3.3",
    typescript: "6.0.3",
    "typescript-eslint": "8.70.0",
    vite: "8.3.0",
    wrangler: "4.131.2",
  },
};
// C3 rewrites some of these declarations while scaffolding; restore the pinned set.
for (const [group, packages] of Object.entries(expected)) {
  manifest[group] = { ...manifest[group], ...packages };
}
const config = {
  $schema: "node_modules/wrangler/config-schema.json",
  name: "swell-storefront",
  main: "worker/index.ts",
  compatibility_date: "2026-09-08",
  compatibility_flags: [],
  assets: {
    binding: "ASSETS",
    html_handling: "none",
    not_found_handling: "single-page-application",
    run_worker_first: true,
  },
  observability: {
    enabled: false,
  },
  upload_source_maps: false,
};
await fs.writeFile(new URL("wrangler.jsonc", root), JSON.stringify(config, null, 2) + "\n");

// C3 may add a direct Cloudflare deploy command; managed apps deploy through Swell.
manifest.scripts = {
  ...manifest.scripts,
  ...{
    dev: "NODE_OPTIONS=--max-http-header-size=65536 vite --host 0.0.0.0 --port ${PORT:-3000}",
    build: "tsc -b && vite build",
    typecheck: "tsc -b",
    lint: "eslint --cache -f json --quiet .",
    preview: "tsc -b && vite build && vite preview --host 0.0.0.0 --port ${PORT:-4173}",
    "cf-typegen": "wrangler types",
    "claude:generate": "node --experimental-strip-types scripts/generate-claude-docs.ts",
    "claude:check": "node --experimental-strip-types scripts/generate-claude-docs.ts --check",
    format: "prettier --write .",
    "format:check": "prettier --check .",
    "prepare:managed": "node scripts/prepare-managed.mjs",
    test: "node --experimental-strip-types --test test/*.test.mjs",
  },
};
delete manifest.scripts.deploy;
await fs.writeFile(new URL("package.json", root), JSON.stringify(manifest, null, 2) + "\n");
