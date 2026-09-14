import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Copy each template's committed package.json and wrangler.jsonc into the
// snapshots its finalizer restores after C3. Run after changing either file;
// `npm run verify` fails while the snapshots are stale.
const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
for (const name of ['react', 'vinext', 'react-storefront']) {
  const template = path.join(repository, name);
  await fs.copyFile(path.join(template, 'package.json'), path.join(template, 'scripts/managed-manifest.json'));
  await fs.copyFile(path.join(template, 'wrangler.jsonc'), path.join(template, 'scripts/managed-wrangler.jsonc'));
}
