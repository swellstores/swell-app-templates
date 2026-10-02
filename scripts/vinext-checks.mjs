import assert from 'node:assert/strict';

// Every tag becomes a space, so an emphasized word is followed by one: "a visitor ."
function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

export async function verifyVinextTemplate(origin, asset, browser, mock) {
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

  const { state } = mock;
  const home = async (storeUser = false, cookie) => {
    state.requests.length = 0;
    const response = await fetch(origin, { headers: { ...mock.headers(storeUser), ...(cookie ? { Cookie: cookie } : {}) } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert(!html.includes('private-sentinel'), 'the access token must never reach the browser');
    return { response, html, body: text(html) };
  };
  // First visit: no session cookie. The API issues one, the render cannot save it and must not fail.
  const visitor = await home();
  assert.match(visitor.body, /Your Swell app is connected\./);
  assert.match(visitor.body, /Live data from store fixture \(test environment\)\./);
  assert.match(visitor.body, /10 products in this store, read on the server\./);
  assert.match(visitor.html, /<img src="https:\/\/cdn\.fixture\.test\/p1\.jpg\?width=64&amp;height=64" alt="Fixture product"/);
  assert.match(visitor.html, /<li title="No image"><span[^>]*>N<\/span>/, 'a product without a photo shows its initial');
  assert.match(visitor.html, /<img src="\/local\/p3\.jpg" alt="Relative image"/, 'an image URL that is not absolute is used as it is');
  assert.match(visitor.body, /You are viewing as a visitor \. Run swell app dev --store-user to view it the way it opens inside the Swell dashboard\./);
  assert.equal(visitor.response.headers.get('set-cookie'), null);
  assert.match(visitor.response.headers.get('cache-control'), /no-store/);
  assert.deepEqual(state.requests.map((request) => `${request.method} ${request.url.pathname}`).sort(), ['GET /api/products']);
  assert(state.requests.every((request) => request.headers.authorization === `Basic ${btoa('fixture-public')}`));

  // A returning visitor's session reaches the Storefront API.
  await home(false, 'swell-session=visitor-session');
  assert(state.requests.every((request) => request.headers['x-session'] === 'visitor-session'));

  // Store user identity comes from signed context; the name is read with the app's token.
  const storeUser = await home(true);
  assert.match(storeUser.body, /You are viewing as store user Fixture User \./);
  const userRead = state.requests.find((request) => request.url.pathname === '/:users/u1');
  assert.equal(userRead.url.searchParams.get('fields'), 'name');
  assert.equal(userRead.headers.authorization, `Basic ${btoa('fixture:private-sentinel')}`);

  // Declared permissions without the user read: still a store user, no name, no error.
  state.denyUsers = true;
  assert.match((await home(true)).body, /You are viewing as a store user \. This app has no permission to read your name\./);
  state.denyUsers = false;

  // Legacy cookies cannot grant store user access; the signed context decides.
  assert.match((await home(false, '_swell_admin_session=user-ok')).body, /You are viewing as a visitor \./);

  state.failUsers = true;
  assert.match((await home(true)).body, /You are viewing as a store user \. Your name could not be loaded/);
  state.failUsers = false;

  // One failing card does not take the page down.
  state.failCatalog = true;
  const degraded = await home(true);
  assert.match(degraded.body, /The catalog could not be loaded\./);
  assert.match(degraded.body, /You are viewing as store user Fixture User \./);
  state.failCatalog = false;

  // Exercise the shipped store-user-only endpoint. The proxy owns origin checks;
  // after a foreign-origin write it supplies visitor context, represented here.
  const write = (headers) => fetch(`${origin}/app-api/hello`, { method: 'POST', headers });
  state.requests.length = 0;
  const allowed = await write(mock.headers(true));
  assert.equal(allowed.status, 200);
  assert.match(allowed.headers.get('cache-control'), /private, no-store/);
  assert.deepEqual(await allowed.json(), { storeUser: { userId: 'u1', storeId: 'fixture' } });
  for (const headers of [mock.headers(), {}, { ...mock.headers(), Origin: 'https://other-app.swell.store' },
    mock.headers(true, { exp: Math.floor(Date.now() / 1000) - 10 }), { 'Swell-Context': 'invalid' }]) {
    assert.equal((await write(headers)).status, 401);
  }
  const forged = mock.headers(true);
  const parts = forged['Swell-Context'].split('.');
  const signature = Buffer.from(parts[2], 'base64url');
  signature[0] ^= 1;
  parts[2] = signature.toString('base64url');
  forged['Swell-Context'] = parts.join('.');
  assert.equal((await write(forged)).status, 401, 'signature verification must be enabled in qualification');
  assert.equal(state.requests.length, 0, 'the example must not call the Backend API');

  // Concurrent renders cannot share cached store context or store user identity.
  const [storeUserPage, otherPage] = await Promise.all([
    fetch(origin, { headers: mock.headers(true) }).then(response => response.text()),
    fetch(origin, { headers: mock.headers(false, { store_id: 'other-store' }) }).then(response => response.text()),
  ]);
  assert.match(text(storeUserPage), /store fixture .*store user Fixture User \./);
  assert.match(text(otherPage), /store other-store .*You are viewing as a visitor \./);
  assert(!otherPage.includes('Fixture User'));

  // Browser: swell-js adds to the cart, and after a reload the server reads the same session.
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(`${origin}/**`, (route) => route.continue({ headers: { ...route.request().headers(), ...mock.headers() } }));
  await page.goto(origin);
  await page.getByRole('heading', { name: 'Your Swell app is connected.' }).waitFor();
  const badge = page.locator('span.rounded-full');
  await page.waitForFunction(() => document.querySelector('span.rounded-full')?.textContent === '0');
  await page.getByRole('button', { name: 'Add to cart' }).click();
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
  // The endpoint link leaves the page in place: the dashboard shows the app in a frame.
  const apiRoute = page.getByRole('link', { name: 'API route /app-api/hello' });
  assert.equal(await apiRoute.getAttribute('href'), '/app-api/hello');
  assert.equal(await apiRoute.getAttribute('target'), '_blank');
  // A failing Storefront API shows a general message; the details go to the console.
  state.failCatalog = true;
  await page.reload();
  await page.getByText('The cart could not be loaded. Please try again.').waitFor();
  state.failCatalog = false;
  assert.deepEqual(errors, []);
  await page.close();
}
