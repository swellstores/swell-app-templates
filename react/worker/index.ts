import { adminProductCount, json, publicConfig } from './swell-server.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/app-api/config') {
      return request.method === 'GET' ? publicConfig(request) : json({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/app-api' || pathname.startsWith('/app-api/')) {
      if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
      if (pathname === '/app-api/hello') return json({ message: 'Hello from your app Worker' });
      if (pathname === '/app-api/admin/product-count') return adminProductCount(request);
      return json({ error: 'Not found' }, 404);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
