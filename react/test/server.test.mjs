import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { adminProductCount, publicContext } from '../worker/swell-server.ts';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const headers = {
  'Swell-Store-Id': 'example', 'Swell-Public-Key': 'public-fixture-key',
  'Swell-Admin-Url': 'https://example.swell.store',
  'Swell-API-Host': 'https://api.example.invalid',
  'Swell-Access-Token': 'private-fixture-token',
};
const request = (cookie) => new Request('https://app.example.invalid/app-api/admin/product-count', {
  headers: { ...headers, ...(cookie ? { Cookie: cookie } : {}) },
});

test('runtime context contains public fields only', async () => {
  const result = await publicContext(request()).json();
  assert.equal(result.storeId, 'example');
  assert.equal(result.storefrontApiOrigin, 'https://example.swell.store');
  assert(!JSON.stringify(result).includes('private-fixture-token'));
  assert(!JSON.stringify(result).includes('api.example.invalid'));
});

test('missing runtime context explains how to enter through Swell', () => {
  assert.equal(publicContext(new Request('http://localhost/')).status, 503);
});

for (const cookie of [null, '_swell_admin_session=%ZZ']) {
  test(`rejects missing or malformed session: ${cookie}`, async () => {
    globalThis.fetch = () => { throw new Error('Must not contact the platform'); };
    assert.equal((await adminProductCount(request(cookie))).status, 401);
  });
}

for (const session of [{}, { user_id: 'user', client_id: 'other-store' }]) {
  test(`rejects invalid or other-store session: ${JSON.stringify(session)}`, async () => {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json(session); };
    assert.equal((await adminProductCount(request('_swell_admin_session=fixture'))).status, 401);
    assert.equal(calls, 1);
  });
}

test('validates session before a fixed backend read and returns only its count', async () => {
  const urls = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(options.redirect, 'manual');
    urls.push(String(url));
    if (urls.length === 1) {
      assert.equal(options.headers['X-Session'], 'fixture');
      return Response.json({ user_id: 'staff', client_id: 'example' });
    }
    assert.equal(options.headers.Authorization, `Basic ${btoa('example:private-fixture-token')}`);
    return Response.json({ count: 3, results: [{ secret: 'must not be exposed' }] });
  };
  const result = await adminProductCount(request('_swell_admin_session=fixture'));
  assert.deepEqual(await result.json(), { count: 3 });
  assert.equal(result.headers.get('Cache-Control'), 'private, no-store');
  assert.deepEqual(urls, ['https://example.swell.store/admin/api/session', 'https://api.example.invalid/products?limit=1']);
});

test('upstream exceptions do not leak credentials or response bodies', async () => {
  globalThis.fetch = async () => { throw new Error('private-fixture-token'); };
  const result = await adminProductCount(request('_swell_admin_session=fixture'));
  assert.equal(result.status, 502);
  assert(!JSON.stringify(await result.json()).includes('private-fixture-token'));
});

for (const redirectAt of ['session', 'backend']) {
  test(`rejects ${redirectAt} redirects without following them`, async () => {
    let calls = 0;
    globalThis.fetch = async (_url, options) => {
      calls++;
      assert.equal(options.redirect, 'manual');
      if (redirectAt === 'backend' && calls === 1) {
        return Response.json({ user_id: 'staff', client_id: 'example' });
      }
      return new Response(null, { status: 302, headers: { Location: 'https://untrusted.example' } });
    };
    const result = await adminProductCount(request('_swell_admin_session=fixture'));
    assert.equal(result.status, redirectAt === 'session' ? 401 : 502);
    assert.equal(calls, redirectAt === 'session' ? 1 : 2);
  });
}
