import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prepareStorefrontFixture, verifyStorefrontBrowser } from './storefront-checks.mjs';
import { startMockPlatform } from './mock-platform.mjs';
import { verifyReactTemplate } from './react-checks.mjs';
import { verifyVinextTemplate } from './vinext-checks.mjs';

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requested = process.argv.slice(2);
const templates = requested.length ? requested : ['react', 'vinext', 'react-storefront'];
for (const name of templates) assert(['react', 'vinext', 'react-storefront'].includes(name), 'Unknown template');
const report = { node: process.version, templates: {} };
// Verification tooling only; no CLI dependency is copied into a generated app.
const captureModule = process.env.SWELL_CLI_PACKAGE_MODULE || path.resolve(repository, '../swell-cli/dist/lib/apps/frontend-package.js');
const capture = templates.some((name) => name !== 'react-storefront') ? await import(pathToFileURL(captureModule).href) : null;

function run(args, cwd, manager = 'npm') {
  return new Promise((resolve, reject) => {
    const child = spawn(manager, args, { cwd, stdio: 'inherit', env: {
      ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: path.join(cwd, '.wrangler/build.log'),
    } });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${manager} ${args.join(' ')} exited ${code}`)));
  });
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

for (const name of templates) {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), `swell-template-${name}-`));
  let worker;
  let mock;
  try {
    await fs.cp(path.join(repository, name), cwd, { recursive: true,
      filter: (source) => !['node_modules', 'dist', '.wrangler', '.vinext', '.next', 'worker-configuration.d.ts', 'next-env.d.ts'].includes(path.basename(source)) && !source.endsWith('.tsbuildinfo') });
    // Local experiment tarballs must retain their source-relative meaning in a clean copy.
    const originalManifest = JSON.parse(await fs.readFile(path.join(cwd, 'package.json'), 'utf8'));
    const localDependencies = Object.values({ ...originalManifest.dependencies, ...originalManifest.devDependencies })
      .filter((value) => value.startsWith('file:') && !path.isAbsolute(value.slice(5)));
    for (const file of ['package.json', 'package-lock.json', 'bun.lock', 'scripts/managed-manifest.json']) {
      const target = path.join(cwd, file);
      let source = await fs.readFile(target, 'utf8').catch(() => null);
      if (source === null) continue;
      for (const value of localDependencies) {
        source = source.replaceAll(value.slice(5), path.resolve(repository, name, value.slice(5)));
      }
      await fs.writeFile(target, source);
    }
    if (name === 'react-storefront') await run(['install', '--frozen-lockfile'], cwd, 'bun');
    else await run(['ci', '--no-fund', '--no-audit'], cwd);
    await fs.mkdir(path.join(cwd, 'public'), { recursive: true });
    await fs.writeFile(path.join(cwd, 'public/.dev.vars'), 'PRIVATE-ASSET-SENTINEL');
    const configFile = path.join(cwd, 'wrangler.jsonc');
    const expected = await fs.readFile(configFile, 'utf8');
    // wrangler.jsonc may carry comment lines; C3 rewrites the file without them.
    const changed = JSON.parse(expected.replace(/^\s*\/\/.*$/gm, ''));
    changed.compatibility_date = '2026-09-14';
    changed.observability = { enabled: true };
    changed.upload_source_maps = true;
    changed.images = { binding: 'IMAGES' };
    await fs.writeFile(configFile, JSON.stringify(changed));
    const manifestPath = path.join(cwd, 'package.json');
    const expectedManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const manifest = structuredClone(expectedManifest);
    delete expectedManifest.scripts['prepare:managed'];
    const scriptsPath = path.join(cwd, 'scripts');
    const setupFiles = ['prepare-managed.mjs', 'managed-manifest.json', 'managed-wrangler.jsonc'];
    const remainingScripts = (await fs.readdir(scriptsPath)).filter((file) => !setupFiles.includes(file)).sort();
    const remainingContents = await Promise.all(remainingScripts.map((file) => fs.readFile(path.join(scriptsPath, file))));
    manifest.name = 'frontend';
    manifest.scripts.deploy = 'wrangler deploy';
    manifest.devDependencies.wrangler = '0.0.0-c3';
    manifest.devDependencies['@types/node'] = '0.0.0-c3';
    await fs.writeFile(manifestPath, JSON.stringify(manifest));
    await run(['run', 'prepare:managed'], cwd);
    assert.equal(await fs.readFile(configFile, 'utf8'), expected, 'managed settings must be restored after C3; run npm run sync');
    assert.deepEqual(JSON.parse(await fs.readFile(manifestPath, 'utf8')), expectedManifest, 'finalizer must restore package.json without prepare:managed; run npm run sync');
    for (const file of setupFiles) {
      await assert.rejects(fs.access(path.join(scriptsPath, file)), { code: 'ENOENT' });
    }
    if (remainingScripts.length === 0) {
      await assert.rejects(fs.access(scriptsPath), { code: 'ENOENT' });
    } else {
      assert.deepEqual((await fs.readdir(scriptsPath)).sort(), remainingScripts);
      for (const [index, file] of remainingScripts.entries()) {
        assert.deepEqual(await fs.readFile(path.join(scriptsPath, file)), remainingContents[index]);
      }
    }
    if (name === 'vinext') {
      // New route types must work before a build and after a route is removed.
      const route = path.join(cwd, 'app/check-route/[id]/page.tsx');
      await fs.mkdir(path.dirname(route), { recursive: true });
      await fs.writeFile(route, 'export default async function Page({ params }: PageProps<"/check-route/[id]">) { return <p>{(await params).id}</p>; }\n');
      await run(['run', 'typecheck'], cwd);
      await fs.rm(path.join(cwd, 'app/check-route'), { recursive: true });
    }
    const checks = { vinext: ['cf-typegen', 'typecheck', 'build'], react: ['cf-typegen', 'check'] }[name]
      ?? ['cf-typegen', 'typecheck', 'lint', 'test', 'build'];
    for (const script of checks) await run(['run', script], cwd);
    if (name !== 'react-storefront') {
      const pkg = await capture.captureFrontendPackage(cwd, name);
      capture.verifyFrontendPackage(pkg);
      if (name === 'vinext') assert(pkg.files.some((file) => file.kind === 'module' && file.path.startsWith('ssr/')), 'capture must include SSR modules');
      assert.deepEqual(pkg.runtime, { compatibility_date: '2026-09-08', compatibility_flags: [], bindings: ['ASSETS'], cache: false });
      report[`${name}Capture`] = { digest: pkg.digest, files: pkg.files.length, runtime: pkg.runtime };
      await fs.mkdir(path.join(repository, '.verification'), { recursive: true });
      await fs.writeFile(path.join(repository, `.verification/${name}-package.json`), JSON.stringify(pkg));
      console.log(`PASS ${name}: CLI managed-package capture`);
      assert(!pkg.files.some((file) => file.path.includes('.dev.vars')), 'local variables must not enter the managed package');
    }
    if (name === 'react-storefront') {
      await run(['run', 'claude:check'], cwd);
      await prepareStorefrontFixture(cwd);
      await run(['run', 'build'], cwd);
    }
    const pointer = JSON.parse(await fs.readFile(path.join(cwd, '.wrangler/deploy/config.json'), 'utf8'));
    const configPath = path.resolve(cwd, '.wrangler/deploy', pointer.configPath);
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    assert.equal(config.compatibility_date, '2026-09-08');
    assert.equal(config.assets.binding, 'ASSETS');
    assert(!config.images);
    const assetsDir = path.resolve(path.dirname(configPath), config.assets.directory);
    const headersText = await fs.readFile(path.join(assetsDir, '_headers'), 'utf8');
    // The immutable rule must match where this framework actually emits hashed assets.
    const blocks = [];
    for (const line of headersText.split('\n').map((entry) => entry.trim()).filter(Boolean)) {
      if (line.startsWith('/')) blocks.push({ path: line, headers: [] });
      else blocks.at(-1)?.headers.push(line);
    }
    const immutableRules = blocks
      .filter((block) => block.headers.some((header) => /^cache-control:.*\bimmutable\b/i.test(header)))
      .map((block) => block.path);
    assert(immutableRules.length > 0, '_headers must set an immutable Cache-Control rule');
    const hashedAssets = (await fs.readdir(assetsDir, { recursive: true }))
      .map((file) => `/${file.split(path.sep).join('/')}`)
      .filter((file) => /-[A-Za-z0-9_-]{6,}\.js$/.test(file));
    assert(hashedAssets.length > 0, 'build must emit hashed JS assets');
    assert(
      hashedAssets.some((asset) => immutableRules.some((rule) => (rule.endsWith('*') ? asset.startsWith(rule.slice(0, -1)) : rule === asset))),
      `immutable _headers rules (${immutableRules.join(', ')}) do not cover hashed assets such as ${hashedAssets[0]}`,
    );
    const port = await availablePort();
    const origin = `http://127.0.0.1:${port}`;
    if (name !== 'react-storefront') {
      mock = await startMockPlatform(origin);
      // Override the copied local-development file only in this isolated runtime.
      await fs.writeFile(path.join(path.dirname(configPath), '.dev.vars'),
        `SWELL_VERIFY_HEADERS=true\nSWELL_HEADERS_JWKS_URL=${mock.origin}/.well-known/jwks.json\n`);
    }
    let logs = '';
    worker = spawn(process.execPath, [path.join(cwd, 'node_modules/wrangler/bin/wrangler.js'), 'dev', '--config', configPath,
      '--ip', '127.0.0.1', '--port', String(port), '--inspector-port', '0', '--local'], {
      cwd, env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: path.join(cwd, '.wrangler/dev.log') }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    worker.stdout.on('data', (data) => { logs += data; });
    worker.stderr.on('data', (data) => { logs += data; });
    let ready = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      if (worker.exitCode !== null) throw new Error(`Worker exited: ${logs}`);
      try { await fetch(origin); ready = true; break; } catch { await new Promise((resolve) => setTimeout(resolve, 200)); }
    }
    assert(ready, `Worker did not start: ${logs}`);
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    if (name !== 'vinext') assert.match(await page.text(), /id="root"/);
    if (name === 'react-storefront') {
      for (const pathname of ['/api/products', '/app-api', '/app-api/context']) {
        assert.equal((await fetch(`${origin}${pathname}`, { headers: { 'Sec-Fetch-Mode': 'navigate' } })).status, 404);
      }
    }
    for (const pathname of ['/.dev.vars', '/wrangler.jsonc', '/worker/index.ts']) {
      const response = await fetch(`${origin}${pathname}`, { headers: { 'Sec-Fetch-Mode': 'navigate' } });
      assert(!(await response.text()).includes('PRIVATE-ASSET-SENTINEL'));
    }
    const browser = await chromium.launch({
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
    });
    try {
      if (name === 'react-storefront') {
        await verifyStorefrontBrowser(browser, origin);
      } else if (name === 'vinext') {
        await verifyVinextTemplate(origin, hashedAssets[0], browser, mock);
      } else {
        await verifyReactTemplate(origin, hashedAssets[0], browser, mock);
      }
    } finally { await browser.close(); }
    report.templates[name] = { cleanInstall: true, finalization: true, checks, workerRoutes: true, browser: true, privateAssetExclusion: true };
    console.log(`PASS ${name}: clean copy, finalization, build, Worker routes and Chromium`);
  } finally {
    if (worker && worker.exitCode === null) {
      const stopped = new Promise((resolve) => worker.once('exit', resolve));
      worker.kill('SIGTERM');
      await stopped;
    }
    if (mock) await mock.close();
    await fs.rm(cwd, { recursive: true, force: true });
  }
}
await fs.mkdir(path.join(repository, '.verification'), { recursive: true });
await fs.writeFile(path.join(repository, '.verification/local.json'), JSON.stringify(report, null, 2) + '\n');
