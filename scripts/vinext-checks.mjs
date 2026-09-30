import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';

const STORE = {
  'Swell-Store-Id': 'fixture',
  'Swell-Public-Key': 'fixture-public',
  'Swell-Access-Token': 'private-sentinel',
  'Swell-Environment-Id': 'test',
};
const STAFF_COOKIE = '_swell_admin_session=staff-ok';

// Qualification only: the template ships no staff-only endpoint, so the recipe in
// AGENTS.md is copied into the isolated build to prove it works as written.
export async function prepareVinextStaffWrite(cwd) {
  const guidance = await fs.readFile(path.join(cwd, 'AGENTS.md'), 'utf8');
  const recipe = guidance.match(/### Staff write[\s\S]*?```ts\n\/\/ (app\/app-api\/\S+)\n([\s\S]*?)```/);
  assert(recipe, 'AGENTS.md must contain the staff write recipe with its file path');
  const route = path.join(cwd, recipe[1]);
  await fs.mkdir(path.dirname(route), { recursive: true });
  await fs.writeFile(route, recipe[2]);
}

// Stands in for the Storefront API, the Backend API and the dashboard session check.
async function startSwellMock(appOrigin) {
  const state = { requests: [], quantity: 0, failCatalog: false, denyUsers: false };
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://fixture');
    let body = '';
    for await (const chunk of request) body += chunk;
    const cors = {
      'Access-Control-Allow-Origin': appOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'] || '',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Expose-Headers': 'X-Session',
    };
    if (request.method === 'OPTIONS') return response.writeHead(204, cors).end();
    state.requests.push({ method: request.method, url, headers: request.headers, body: body ? JSON.parse(body) : undefined });
    const send = (status, data) => {
      response.writeHead(status, { 'Content-Type': 'application/json', ...cors,
        ...(url.pathname.startsWith('/api/') && !request.headers['x-session'] ? { 'X-Session': 'issued-session' } : {}) });
      response.end(JSON.stringify(data));
    };
    const route = `${request.method} ${url.pathname}`;
    if (url.pathname.startsWith('/api/') && state.failCatalog) return send(500, { error: 'Fixture failure' });
    if (route === 'GET /api/products') return send(200, { count: 10, page: 1, results: [
      { id: 'p1', name: 'Fixture product', images: [{ file: { url: 'https://cdn.fixture.test/p1.jpg' } }] },
      { id: 'p2', name: 'No image' },
    ] });
    if (route === 'GET /api/categories') return send(200, { count: 4, page: 1, results: [] });
    if (route === 'GET /api/cart') return send(200, state.quantity ? { item_quantity: state.quantity } : null);
    if (route === 'POST /api/cart/items') return send(200, { item_quantity: ++state.quantity });
    if (route === 'GET /admin/api/session') {
      return request.headers['x-session'] === 'staff-ok' ? send(200, { user_id: 'u1', client_id: 'fixture' }) : send(401, null);
    }
    if (route === 'GET /:users/u1') return state.denyUsers ? send(403, 'The client does not have the required permissions') : send(200, { name: 'Fixture Staff' });
    if (route === 'PUT /products/p1') return send(200, { id: 'p1', name: state.requests.at(-1).body.name, cost: 1 });
    send(404, null);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { state, origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
}

function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

export async function verifyVinextTemplate(origin, asset, browser) {
  const hello = await fetch(`${origin}/app-api/hello`);
  assert.equal(hello.status, 200);
  assert.deepEqual(await hello.json(), { message: 'Hello from vinext on Cloudflare Workers' });
  assert.equal((await fetch(`${origin}/api/hello`)).status, 404);
  const hashed = await fetch(`${origin}${asset}`);
  assert.equal(hashed.status, 200);
  assert.match(hashed.headers.get('cache-control'), /max-age=31536000.*immutable/);

  // Opened without Swell: a designed page, not an error.
  const bare = await fetch(origin);
  assert.equal(bare.status, 200);
  assert.match(text(await bare.text()), /Not connected to a store\..*swell app dev/);

  const mock = await startSwellMock(origin);
  const { state } = mock;
  const swell = { ...STORE, 'Swell-Admin-Url': mock.origin, 'Swell-API-Host': mock.origin };
  const home = async (cookie) => {
    state.requests.length = 0;
    const response = await fetch(origin, { headers: { ...swell, ...(cookie ? { Cookie: cookie } : {}) } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert(!html.includes('private-sentinel'), 'the access token must never reach the browser');
    return { response, html, body: text(html) };
  };
  try {
    // First visit: no session cookie. The API issues one, the render cannot save it and must not fail.
    const visitor = await home();
    assert.match(visitor.body, /Your Swell app is connected\./);
    assert.match(visitor.body, /Store fixture · test environment/);
    assert.match(visitor.body, /10 products, 4 categories/);
    assert.match(visitor.html, /<img src="https:\/\/cdn\.fixture\.test\/p1\.jpg\?width=64&amp;height=64" alt="Fixture product"/);
    assert.match(visitor.body, /Visitor\. Open this app from the Swell dashboard/);
    assert.equal(visitor.response.headers.get('set-cookie'), null);
    assert.match(visitor.response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(state.requests.map((request) => `${request.method} ${request.url.pathname}`).sort(), ['GET /api/categories', 'GET /api/products']);
    assert(state.requests.every((request) => request.headers.authorization === `Basic ${btoa('fixture-public')}`));

    // A returning visitor's session reaches the Storefront API.
    await home('swell-session=visitor-session');
    assert(state.requests.every((request) => request.headers['x-session'] === 'visitor-session'));

    // Staff: the session is verified, then the name is read with the app's token.
    const staff = await home(STAFF_COOKIE);
    assert.match(staff.body, /Staff: Fixture Staff/);
    const userRead = state.requests.find((request) => request.url.pathname === '/:users/u1');
    assert.equal(userRead.url.searchParams.get('fields'), 'name');
    assert.equal(userRead.headers.authorization, `Basic ${btoa('fixture:private-sentinel')}`);

    // Declared permissions without the user read: still staff, no name, no error.
    state.denyUsers = true;
    assert.match((await home(STAFF_COOKIE)).body, /Staff\. This app has no permission to read your name\./);
    state.denyUsers = false;

    // A stale dashboard cookie is a visitor.
    assert.match((await home('_swell_admin_session=stale')).body, /Visitor\. Open this app/);

    // One failing card does not take the page down.
    state.failCatalog = true;
    const degraded = await home(STAFF_COOKIE);
    assert.match(degraded.body, /The catalog could not be loaded: /);
    assert.match(degraded.body, /Staff: Fixture Staff/);
    state.failCatalog = false;

    // The AGENTS.md staff write recipe: staff from this app's own pages only.
    const write = (headers) => {
      state.requests.length = 0;
      return fetch(`${origin}/app-api/products/p1`, { method: 'PUT', headers: { ...swell, ...headers }, body: JSON.stringify({ name: 'Renamed' }) });
    };
    const allowed = await write({ Origin: origin, Cookie: STAFF_COOKIE });
    assert.equal(allowed.status, 200);
    assert.deepEqual(await allowed.json(), { id: 'p1', name: 'Renamed' });
    assert.deepEqual(state.requests.at(-1).body, { name: 'Renamed' });
    assert.equal((await write({ Origin: 'https://other-app.swell.store', Cookie: STAFF_COOKIE })).status, 403);
    assert.equal(state.requests.length, 0);
    assert.equal((await write({ Origin: origin })).status, 401);
    assert.equal((await write({ Origin: origin, Cookie: '_swell_admin_session=stale' })).status, 401);
    assert(!state.requests.some((request) => request.method === 'PUT'));

    // Browser: swell-js adds to the cart, and after a reload the server reads the same session.
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(`${origin}/**`, (route) => route.continue({ headers: { ...route.request().headers(), ...swell } }));
    await page.goto(origin);
    await page.getByRole('heading', { name: 'Your Swell app is connected.' }).waitFor();
    const badge = page.locator('span.rounded-full');
    await page.waitForFunction(() => document.querySelector('span.rounded-full')?.textContent === '0');
    await page.getByRole('button', { name: 'Add an item' }).click();
    await page.waitForFunction(() => document.querySelector('span.rounded-full')?.textContent === '1');
    const added = state.requests.find((request) => request.method === 'POST' && request.url.pathname === '/api/cart/items');
    assert.deepEqual(added.body, { product_id: 'p1', quantity: 1 });
    state.requests.length = 0;
    await page.reload();
    await page.waitForFunction(() => document.querySelector('span.rounded-full')?.textContent === '1');
    assert.equal(await badge.textContent(), '1');
    const sessions = new Set(state.requests.filter((request) => request.url.pathname.startsWith('/api/')).map((request) => request.headers['x-session']));
    assert.deepEqual([...sessions], ['issued-session'], 'server render and browser must use the one session cookie');
    assert(state.requests.some((request) => request.url.pathname === '/api/products'), 'the reload must include a server-side read');
    await page.getByRole('button', { name: 'Try an API request' }).click();
    await page.getByRole('status').filter({ hasText: 'Hello from vinext on Cloudflare Workers' }).waitFor();
    assert.equal(page.url(), `${origin}/`);
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await mock.close();
  }
}
