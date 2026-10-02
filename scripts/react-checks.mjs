import assert from 'node:assert/strict';

export async function verifyReactTemplate(origin, asset, browser, mock) {
  const { state } = mock;
  const api = (pathname, init) => fetch(`${origin}${pathname}`, init);

  const hello = await api('/app-api/hello');
  assert.equal(hello.status, 200);
  assert.match(hello.headers.get('cache-control'), /private, no-store/);
  assert.deepEqual(await hello.json(), { message: 'Hello from your app Worker' });
  const missing = await api('/app-api/missing', { headers: { Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate' } });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Not found' });
  assert.equal((await api('/app-api/hello', { method: 'PUT' })).status, 405);
  const hashed = await api(asset);
  assert.equal(hashed.status, 200);
  assert.match(hashed.headers.get('cache-control'), /max-age=31536000.*immutable/);
  const deepLink = await api('/example/deep-link', { headers: { 'Sec-Fetch-Mode': 'navigate' } });
  assert.equal(deepLink.status, 200);
  assert.match(await deepLink.text(), /id="root"/);

  // Opened without Swell: the config says so, and store endpoints explain how to connect.
  const bare = await api('/app-api/config');
  assert.equal(bare.status, 200);
  assert.equal(await bare.json(), null);
  const unconnected = await api('/app-api/store-user');
  assert.equal(unconnected.status, 401);
  assert.match((await unconnected.json()).error, /Not connected to a store\..*swell app dev/);

  // Only the public projection of the context reaches the browser.
  const config = await api('/app-api/config', { headers: mock.headers(true) });
  assert.equal(config.status, 200);
  assert.match(config.headers.get('cache-control'), /private, no-store/);
  assert.deepEqual(await config.json(),
    { storeId: 'fixture', publicKey: 'fixture-public', url: mock.origin, vaultUrl: 'https://vault.schema.io' });

  const storeUser = async (headers) => {
    state.requests.length = 0;
    const response = await api('/app-api/store-user', { headers });
    const body = await response.text();
    assert(!body.includes('private-sentinel'), 'the access token must never reach the browser');
    assert.match(response.headers.get('cache-control'), /private, no-store/);
    return { status: response.status, body: JSON.parse(body) };
  };
  assert.deepEqual(await storeUser(mock.headers()), { status: 200, body: { storeUser: null } });
  assert.equal(state.requests.length, 0, 'a visitor needs no Backend call');

  // Store user identity comes from signed context; the name is read with the app's token.
  assert.deepEqual(await storeUser(mock.headers(true)), { status: 200, body: { storeUser: { name: 'Fixture User' } } });
  const userRead = state.requests.find((request) => request.url.pathname === '/:users/u1');
  assert.equal(userRead.url.searchParams.get('fields'), 'name');
  assert.equal(userRead.headers.authorization, `Basic ${btoa('fixture:private-sentinel')}`);

  // Declared permissions without the user read: still a store user, no name, no error.
  state.denyUsers = true;
  assert.deepEqual(await storeUser(mock.headers(true)),
    { status: 200, body: { storeUser: {}, message: 'This app has no permission to read your name.' } });
  state.denyUsers = false;
  state.failUsers = true;
  assert.deepEqual(await storeUser(mock.headers(true)),
    { status: 200, body: { storeUser: {}, message: 'Your name could not be loaded. Please try again.' } });
  state.failUsers = false;

  // Legacy cookies cannot grant store user access; the signed context decides.
  assert.deepEqual(await storeUser({ ...mock.headers(), Cookie: '_swell_admin_session=user-ok' }), { status: 200, body: { storeUser: null } });
  assert.equal((await storeUser({ 'Swell-Context': 'invalid' })).status, 401);

  // Exercise the shipped store-user-only endpoint. The proxy owns origin checks;
  // after a foreign-origin write it supplies visitor context, represented here.
  const write = (headers) => api('/app-api/hello', { method: 'POST', headers });
  state.requests.length = 0;
  const allowed = await write(mock.headers(true));
  assert.equal(allowed.status, 200);
  assert.match(allowed.headers.get('cache-control'), /private, no-store/);
  assert.deepEqual(await allowed.json(), { storeUser: { userId: 'u1', storeId: 'fixture' } });
  const visitorWrite = await write(mock.headers());
  assert.equal(visitorWrite.status, 401);
  assert.deepEqual(await visitorWrite.json(), { error: 'Store user access required.' });
  for (const headers of [{}, { ...mock.headers(), Origin: 'https://other-app.swell.store' },
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

  // Concurrent requests cannot share store context or store user identity.
  const [first, second] = await Promise.all([
    api('/app-api/config', { headers: mock.headers(true) }).then((response) => response.json()),
    api('/app-api/config', { headers: mock.headers(false, { store_id: 'other-store' }) }).then((response) => response.json()),
  ]);
  assert.deepEqual([first.storeId, second.storeId], ['fixture', 'other-store']);

  // Browser. Each page gets the context Swell's proxy would add to its requests.
  const errors = [];
  const bodies = [];
  const open = async (storeUser, connected = true) => {
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.url().startsWith(`${origin}/app-api/`)) bodies.push(response.text().catch(() => ''));
    });
    if (connected) {
      await page.route(`${origin}/**`, (route) => route.continue({ headers: { ...route.request().headers(), ...mock.headers(storeUser) } }));
    }
    await page.goto(origin);
    return page;
  };
  const badge = async (page, value) => page.waitForFunction((expected) => document.querySelector('.badge')?.textContent === expected, value);

  // Opened without Swell: a designed page, not an error.
  const unconnectedPage = await open(false, false);
  await unconnectedPage.getByRole('heading', { name: 'Not connected to a store.' }).waitFor();
  await unconnectedPage.getByText('swell app dev', { exact: true }).waitFor();
  await unconnectedPage.close();

  // First visit: no session cookie. swell-js reads the catalog, adds to the cart,
  // and after a reload still uses the session the API issued.
  state.requests.length = 0;
  const page = await open(false);
  await page.getByRole('heading', { name: 'Your Swell app is connected.' }).waitFor();
  await page.getByText('Live data from store fixture.').waitFor();
  await page.getByText('10 products in this store, read in the browser.').waitFor();
  assert.equal(await page.getByAltText('Fixture product').getAttribute('src'), 'https://cdn.fixture.test/p1.jpg?width=64&height=64');
  assert.equal(await page.locator('li[title="No image"] span').textContent(), 'N', 'a product without a photo shows its initial');
  await page.getByText('You are viewing as a visitor.').waitFor();
  await page.getByText('swell app dev --store-user').waitFor();
  assert(state.requests.every((request) => request.headers.authorization === `Basic ${btoa('fixture-public')}`));
  await badge(page, '0');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await badge(page, '1');
  const added = state.requests.find((request) => request.method === 'POST' && request.url.pathname === '/api/cart/items');
  assert.deepEqual(added.body, { product_id: 'p1', quantity: 1 });
  state.requests.length = 0;
  await page.reload();
  await badge(page, '1');
  const sessions = new Set(state.requests.filter((request) => request.url.pathname.startsWith('/api/')).map((request) => request.headers['x-session']));
  assert.deepEqual([...sessions], ['issued-session'], 'the browser must keep the session the API issued');
  // The endpoint link leaves the page in place: the dashboard shows the app in a frame.
  const apiRoute = page.getByRole('link', { name: 'API route /app-api/hello' });
  assert.equal(await apiRoute.getAttribute('href'), '/app-api/hello');
  assert.equal(await apiRoute.getAttribute('target'), '_blank');
  // A deep link serves the same app.
  await page.goto(`${origin}/example/deep-link`);
  await page.getByRole('heading', { name: 'Your Swell app is connected.' }).waitFor();
  assert(!(await page.content()).includes('private-sentinel'));
  await page.close();

  // A store user, and one failing API does not take the page down.
  state.failCatalog = true;
  const storeUserPage = await open(true);
  await storeUserPage.getByText('You are viewing as store user Fixture User.').waitFor();
  await storeUserPage.getByText('The catalog could not be loaded. Please try again.').waitFor();
  await storeUserPage.getByText('The cart could not be loaded. Please try again.').waitFor();
  state.failCatalog = false;
  await storeUserPage.close();

  for (const body of await Promise.all(bodies)) assert(!body.includes('private-sentinel'), 'the access token must never reach the browser');
  assert.deepEqual(errors, []);
}
