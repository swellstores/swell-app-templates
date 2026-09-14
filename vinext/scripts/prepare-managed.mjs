import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('package.json', root), 'utf8'));
const expected = {
  "dependencies": {
    "@vinext/cloudflare": "1.0.0-beta.7",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "react-server-dom-webpack": "19.3.0",
    "vinext": "1.0.0-beta.9",
    "swell-js": "5.8.1"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "1.54.9",
    "@tailwindcss/postcss": "4.3.3",
    "@types/node": "26.5.1",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.1",
    "@vitejs/plugin-rsc": "0.5.34",
    "tailwindcss": "4.3.3",
    "typescript": "6.0.3",
    "vite": "8.3.0",
    "wrangler": "4.131.2",
    "eslint": "10.10.0",
    "typescript-eslint": "8.70.0"
  }
};
// C3 rewrites some of these declarations while scaffolding; restore the pinned set.
for (const [group, packages] of Object.entries(expected)) {
  manifest[group] = { ...manifest[group], ...packages };
}
const config = {
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "swell-vinext",
  "main": "vinext/server/fetch-handler",
  "compatibility_date": "2026-09-08",
  "compatibility_flags": [],
  "assets": {
    "binding": "ASSETS",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "none",
    "run_worker_first": false
  },
  "observability": {
    "enabled": false
  },
  "upload_source_maps": false,
  "cache": {
    "enabled": true
  },
  "version_metadata": {
    "binding": "CF_VERSION_METADATA"
  }
};
await fs.writeFile(new URL('wrangler.jsonc', root), JSON.stringify(config, null, 2) + '\n');

// C3 may add a direct Cloudflare deploy command; managed apps deploy through Swell.
manifest.scripts = { ...manifest.scripts, ...{
  "dev": "vinext dev",
  "build": "vinext build",
  "start": "wrangler dev --config dist/server/wrangler.json",
  "preview": "npm run build && npm run start --",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv ./worker-configuration.d.ts",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "prepare:managed": "node scripts/prepare-managed.mjs",
  "test": "node --experimental-strip-types --test test/*.test.mjs"
} };
delete manifest.scripts.deploy;
await fs.writeFile(new URL('package.json', root), JSON.stringify(manifest, null, 2) + '\n');
