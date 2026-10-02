import { generateKeyPairSync, createHash, sign } from 'node:crypto';
import http from 'node:http';

// Test platform with its own signing key: a JWKS service and the Storefront and
// Backend API routes the templates call. The Vinext and React checks share it.
export async function startMockPlatform(appOrigin) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const { crv, kty, x, y } = publicKey.export({ format: 'jwk' });
  const kid = createHash('sha256').update(JSON.stringify({ crv, kty, x, y })).digest('base64url');
  const jwk = { crv, kty, x, y, kid, alg: 'ES256', use: 'sig' };
  const state = { requests: [], quantity: 0, failCatalog: false, denyUsers: false, failUsers: false };
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
    if (url.pathname === '/.well-known/jwks.json') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ keys: [jwk] }));
    }
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
      { id: 'p3', name: 'Relative image', images: [{ file: { url: '/local/p3.jpg' } }] },
    ] });
    if (route === 'GET /api/cart') return send(200, state.quantity ? { item_quantity: state.quantity } : null);
    if (route === 'POST /api/cart/items') return send(200, { item_quantity: ++state.quantity });
    if (route === 'GET /:users/u1') {
      if (state.denyUsers) return send(403, 'The client does not have the required permissions');
      if (state.failUsers) return send(500, 'Backend failure: private-sentinel');
      return send(200, { name: 'Fixture User' });
    }
    send(404, null);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  function headers(storeUser = false, claims = {}) {
    const iat = Math.floor(Date.now() / 1000);
    const payload = { iss: origin, aud: 'fixture-app', iat, exp: iat + 60,
      store_id: 'fixture', app_id: 'fixture-app', installation_id: 'fixture-installation',
      environment_id: 'test', storefront_id: null, api_host: origin, admin_url: origin,
      admin: storeUser ? { user_id: 'u1' } : null, ...claims };
    const input = [JSON.stringify({ alg: 'ES256', kid, typ: 'JWT' }), JSON.stringify(payload)]
      .map(value => Buffer.from(value).toString('base64url')).join('.');
    const signature = sign('sha256', Buffer.from(input), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url');
    return { 'Swell-Context': `${input}.${signature}`, 'Swell-Public-Key': 'fixture-public', 'Swell-Access-Token': 'private-sentinel' };
  }
  return { state, origin, headers,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
}
