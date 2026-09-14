"use client";

import { useState } from 'react';

type Product = { id?: string; name?: string };

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('');
  async function loadProducts() {
    // The SDK runs in the browser, never in a shared SSR module.
    if (import.meta.env.SSR) return;
    try {
      const { default: swell } = await import('swell-js');
      const response = await fetch('/app-api/context');
      const context = await response.json() as { storeId: string; publicKey: string; storefrontApiOrigin: string; error?: string };
      if (!response.ok) throw new Error(context.error || 'Swell context unavailable');
      swell.init(context.storeId, context.publicKey, { url: context.storefrontApiOrigin });
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
