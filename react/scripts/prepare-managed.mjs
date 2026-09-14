import fs from "node:fs/promises";

// Restore the managed settings and pinned declarations that C3 rewrites while
// scaffolding. The snapshots beside this script are copies of the template's
// committed package.json and wrangler.jsonc; refresh them with `npm run sync`
// from the repository root after changing either file.
const scripts = new URL("./", import.meta.url);
const root = new URL("../", scripts);

const manifestPath = new URL("package.json", root);
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const pinned = JSON.parse(await fs.readFile(new URL("managed-manifest.json", scripts), "utf8"));
for (const group of ["scripts", "dependencies", "devDependencies"]) {
  manifest[group] = { ...manifest[group], ...pinned[group] };
}
// C3 may add a direct Cloudflare deploy command; managed apps deploy through Swell.
delete manifest.scripts.deploy;
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

await fs.copyFile(new URL("managed-wrangler.jsonc", scripts), new URL("wrangler.jsonc", root));
