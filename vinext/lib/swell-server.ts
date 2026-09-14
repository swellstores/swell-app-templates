export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

// Swell supplies these headers per request. Never embed store values at build time.
export function publicContext(request: Request) {
  const headers = request.headers;
  const storeId = headers.get('Swell-Store-Id');
  const publicKey = headers.get('Swell-Public-Key');
  const storefrontApiOrigin = headers.get('Swell-Admin-Url');
  if (!storeId || !publicKey || !storefrontApiOrigin) {
    return json({ error: 'Open this frontend through swell app dev or its Swell app address.' }, 503);
  }
  return json({
    storeId, publicKey, storefrontApiOrigin,
    environmentId: headers.get('Swell-Environment-Id'),
    appId: headers.get('Swell-App-Id'),
    storefrontId: headers.get('Swell-Storefront-Id'),
  });
}

// Example policy: any validated staff session for this store may read this count.
// Add the appropriate user permissions for endpoints that expose privileged data.
// Keep this a fixed operation, never a browser-controlled Backend API proxy.
export async function adminProductCount(request: Request) {
  const cookie = (request.headers.get('Cookie') || '').split(';')
    .map((part) => part.trim()).find((part) => part.startsWith('_swell_admin_session='));
  let sessionId;
  try { sessionId = cookie && decodeURIComponent(cookie.slice('_swell_admin_session='.length)); }
  catch { return json({ error: 'Invalid session' }, 401); }
  if (!sessionId) return json({ error: 'Open this app from the Swell dashboard to sign in.' }, 401);

  const storeId = request.headers.get('Swell-Store-Id');
  const adminUrl = request.headers.get('Swell-Admin-Url');
  const apiHost = request.headers.get('Swell-API-Host');
  const accessToken = request.headers.get('Swell-Access-Token');
  if (!storeId || !adminUrl || !apiHost || !accessToken) {
    return json({ error: 'Swell request context is unavailable' }, 503);
  }
  try {
    const sessionResponse = await fetch(new URL('/admin/api/session', adminUrl), {
      headers: { 'X-Session': sessionId }, redirect: 'error',
    });
    const session = sessionResponse.ok ? await sessionResponse.json() as { user_id?: string; client_id?: string } : null;
    if (!session?.user_id || session.client_id !== storeId) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const response = await fetch(new URL('/products?limit=1', apiHost), {
      headers: { Authorization: `Basic ${btoa(`${storeId}:${accessToken}`)}` }, redirect: 'error',
    });
    if (!response.ok) return json({ error: 'Unable to read the catalog' }, 502);
    const products = await response.json() as { count: number };
    return json({ count: products.count });
  } catch {
    return json({ error: 'Unable to complete the platform request' }, 502);
  }
}
