import { useState } from 'react';
import type { PublicConfig } from 'swell-js';
import swell from 'swell-js';

type Product = { id?: string; name?: string };

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('');
  async function loadProducts() {
    try {
      const response = await fetch('/app-api/config');
      const config = await response.json() as PublicConfig & { error?: string };
      if (!response.ok) throw new Error(config.error || 'Swell config unavailable');
      swell.init(config.storeId, config.publicKey, config);
      const result = await swell.products.list({ limit: 5 });
      setProducts(result.results || []);
      setStatus(`${result.count || 0} products available`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load products');
    }
  }
  async function readBackendCount() {
    try {
      const response = await fetch('/app-api/admin/product-count');
      const result = await response.json() as { count?: number; error?: string };
      setStatus(response.ok ? `Backend catalog count: ${result.count}` : result.error || 'Unable to read backend count');
    } catch { setStatus('Unable to reach the app Worker'); }
  }
  return <section>
    <button onClick={loadProducts}>Load products with swell-js</button>{' '}
    <button onClick={readBackendCount}>Read backend count (staff)</button>
    <p role="status">{status}</p>
    <ul>{products.map((product) => <li key={product.id}>{product.name}</li>)}</ul>
  </section>;
}
