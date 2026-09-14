import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('package.json', root), 'utf8'));
const expected = {
  "dependencies": {
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "swell-js": "5.8.1"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "1.54.9",
    "@types/node": "24.13.4",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.1",
    "typescript": "6.0.3",
    "vite": "8.3.0",
    "wrangler": "4.131.2",
    "eslint": "10.10.0",
    "typescript-eslint": "8.70.0"
  }
};
for (const [group, packages] of Object.entries(expected)) {
  for (const [name, version] of Object.entries(packages)) {
    if (manifest[group]?.[name] !== version) {
      throw new Error(`Managed template requires ${name}@${version}; received ${manifest[group]?.[name]}`);
    }
  }
}
const config = {
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "swell-react",
  "main": "worker/index.ts",
  "compatibility_date": "2026-09-08",
  "compatibility_flags": [],
  "assets": {
    "binding": "ASSETS",
    "html_handling": "none",
    "not_found_handling": "single-page-application",
    "run_worker_first": true
  },
  "observability": {
    "enabled": false
  },
  "upload_source_maps": false
};
await fs.writeFile(new URL('wrangler.jsonc', root), JSON.stringify(config, null, 2) + '\n');

// C3 may add a direct Cloudflare deploy command; managed apps deploy through Swell.
manifest.scripts = { ...manifest.scripts, ...{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "npm run build && vite preview",
  "cf-typegen": "wrangler types",
  "typecheck": "tsc -b",
  "prepare:managed": "node scripts/prepare-managed.mjs",
  "test": "node --experimental-strip-types --test test/*.test.mjs"
} };
delete manifest.scripts.deploy;
await fs.writeFile(new URL('package.json', root), JSON.stringify(manifest, null, 2) + '\n');
