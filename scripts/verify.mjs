import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareStorefrontFixture, verifyStorefrontBrowser } from './storefront-checks.mjs';

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requested = process.argv.slice(2);
const templates = requested.length ? requested : ['react', 'vinext', 'react-storefront'];
for (const name of templates) assert(['react', 'vinext', 'react-storefront'].includes(name), 'Unknown template');
const report = { node: process.version, templates: {} };

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
  try {
    await fs.cp(path.join(repository, name), cwd, { recursive: true,
      filter: (source) => !['node_modules', 'dist', '.wrangler', '.vinext', '.next', 'worker-configuration.d.ts', 'next-env.d.ts'].includes(path.basename(source)) && !source.endsWith('.tsbuildinfo') });
    if (name === 'react-storefront') await run(['install', '--frozen-lockfile'], cwd, 'bun');
    else await run(['ci', '--no-fund', '--no-audit'], cwd);
    await fs.writeFile(path.join(cwd, 'public/.dev.vars'), 'PRIVATE-ASSET-SENTINEL');
    const configFile = path.join(cwd, 'wrangler.jsonc');
    const expected = await fs.readFile(configFile, 'utf8');
    const changed = JSON.parse(expected);
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
    for (const script of ['cf-typegen', 'typecheck', 'lint', 'test', 'build']) await run(['run', script], cwd);
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
    assert.match(await fs.readFile(path.resolve(path.dirname(configPath), config.assets.directory, '_headers'), 'utf8'), /immutable/);
    const port = await availablePort();
    const origin = `http://127.0.0.1:${port}`;
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
    assert.match(await page.text(), name !== 'vinext' ? /id="root"/ : /Swell Vinext app/);
    if (name !== 'react-storefront') {
      const hello = await fetch(`${origin}/app-api/hello`, { headers: { Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate' } });
      assert.equal(hello.status, 200);
      assert.match((await hello.json()).message, /Hello/);
      const privateResult = await fetch(`${origin}/app-api/admin/product-count`);
      assert.equal(privateResult.status, 401);
      const context = await fetch(`${origin}/app-api/context`, { headers: {
        'Swell-Store-Id': 'fixture', 'Swell-Public-Key': 'fixture-public', 'Swell-Admin-Url': 'https://fixture.swell.store',
        'Swell-Access-Token': 'private-sentinel',
      } });
      assert.equal(context.status, 200);
      const publicData = await context.json();
      assert.equal(publicData.storeId, 'fixture');
      assert(!JSON.stringify(publicData).includes('private-sentinel'));
      if (name === 'react') {
        assert.equal((await fetch(`${origin}/example/deep-link`, { headers: { 'Sec-Fetch-Mode': 'navigate' } })).status, 200);
        const missing = await fetch(`${origin}/app-api/missing`, { headers: { Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate' } });
        assert.equal(missing.status, 404);
        assert.equal((await missing.json()).error, 'Not found');
      }
    } else {
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
      } else {
        const page = await browser.newPage({ extraHTTPHeaders: {
          'Swell-Store-Id': 'fixture', 'Swell-Public-Key': 'fixture-public', 'Swell-Admin-Url': origin,
        } });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let sdkRequests = 0;
        await page.route(`${origin}/api/products?*`, async (route) => {
          sdkRequests++;
          assert.equal(route.request().headers().authorization, `Basic ${btoa('fixture-public')}`);
          await route.fulfill({ json: { count: 1, results: [{ id: 'fixture', name: 'Fixture product' }] } });
        });
        await page.goto(origin);
        await page.getByRole('heading', { name: name === 'react' ? 'Swell React app' : 'Swell Vinext app' }).waitFor();
        await page.getByRole('button', { name: 'Load products with swell-js' }).click();
        await page.getByText('Fixture product', { exact: true }).waitFor();
        assert.equal(sdkRequests, 1);
        await page.getByRole('button', { name: 'Read backend count (staff)' }).click();
        await page.getByRole('status').filter({ hasText: 'Open this app from the Swell dashboard' }).waitFor();
        if (name === 'react') {
          await page.goto(`${origin}/example/deep-link`);
          await page.getByRole('heading', { name: 'Swell React app' }).waitFor();
        }
        assert.deepEqual(errors, []);
      }
    } finally { await browser.close(); }
    report.templates[name] = { cleanInstall: true, finalization: true, types: true, lint: true, unitTests: true, build: true, workerRoutes: true, browser: true, mockedSdkRead: true, privateAssetExclusion: true };
    console.log(`PASS ${name}: clean copy, finalization, build, Worker routes and Chromium SDK read`);
  } finally {
    if (worker && worker.exitCode === null) {
      const stopped = new Promise((resolve) => worker.once('exit', resolve));
      worker.kill('SIGTERM');
      await stopped;
    }
    await fs.rm(cwd, { recursive: true, force: true });
  }
}
await fs.mkdir(path.join(repository, '.verification'), { recursive: true });
await fs.writeFile(path.join(repository, '.verification/local.json'), JSON.stringify(report, null, 2) + '\n');
