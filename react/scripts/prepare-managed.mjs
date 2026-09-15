import fs from "node:fs/promises";

// Restore the committed package.json and wrangler.jsonc that C3 rewrites while
// scaffolding. The snapshots beside this script are byte copies of those files;
// refresh them with `npm run sync` from the repository root after changing either.
// This runs once after scaffolding, then removes its command and setup files.
const scripts = new URL("./", import.meta.url);
const root = new URL("../", scripts);

await fs.copyFile(new URL("managed-manifest.json", scripts), new URL("package.json", root));
await fs.copyFile(new URL("managed-wrangler.jsonc", scripts), new URL("wrangler.jsonc", root));

const manifestPath = new URL("package.json", root);
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
delete manifest.scripts["prepare:managed"];
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

for (const file of ["prepare-managed.mjs", "managed-manifest.json", "managed-wrangler.jsonc"]) {
  await fs.unlink(new URL(file, scripts));
}
if ((await fs.readdir(scripts)).length === 0) await fs.rmdir(scripts);
