import { getStorefrontConfig, requireStaff, SwellBackendAPI, SwellError } from '@swell/apps-sdk';

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

// Return public config only; the platform context contains server credentials.
export function publicConfig(request: Request) {
  try {
    return json(getStorefrontConfig(request.headers));
  } catch {
    return json({ error: 'Open this frontend through swell app dev or its Swell app address.' }, 503);
  }
}

// Example policy: any validated staff session for this store may read this count.
// Add the appropriate user permissions for endpoints that expose privileged data.
// Keep this a fixed operation, never a browser-controlled Backend API proxy.
export async function adminProductCount(request: Request) {
  const cookie = (request.headers.get('Cookie') || '').split(';')
    .map((part) => part.trim()).find((part) => part.startsWith('_swell_admin_session='));
  let sessionId: string | undefined;
  try { sessionId = cookie && decodeURIComponent(cookie.slice('_swell_admin_session='.length)); }
  catch { return json({ error: 'Invalid session' }, 401); }
  if (!sessionId) return json({ error: 'Open this app from the Swell dashboard to sign in.' }, 401);
  try {
    await requireStaff({
      headers: request.headers,
      method: request.method,
      origin: new URL(request.url).origin,
      cookies: { get: () => sessionId },
    });
  } catch (error) {
    if (error instanceof SwellError && error.status === 401) return json({ error: 'Unauthorized' }, 401);
    if (error instanceof SwellError && error.status === 403) return json({ error: 'Forbidden' }, 403);
    return json({ error: 'Unable to verify the staff session' }, 502);
  }
  try {
    const backend = new SwellBackendAPI({ headers: request.headers });
    const products = await backend.get<{ count: number }>('/products', { limit: 1 });
    return json({ count: products.count });
  } catch {
    return json({ error: 'Unable to read the catalog' }, 502);
  }
}
