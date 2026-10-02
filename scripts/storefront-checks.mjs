import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// Compose a representative generated page only inside the isolated test copy.
export async function prepareStorefrontFixture(cwd) {
  await fs.writeFile(path.join(cwd, 'src/App.tsx'), `import { Route, Routes } from 'react-router-dom';
import FixturePage from './pages/fixture';
export default function App() { return <Routes><Route path="*" element={<FixturePage />} /></Routes>; }
`);
  await fs.writeFile(path.join(cwd, 'src/pages/fixture.tsx'), `import FixtureSection from '../storefront/sections/fixture';
export default function FixturePage() { return <main><FixtureSection /></main>; }
`);
  await fs.writeFile(path.join(cwd, 'src/storefront/sections/fixture.tsx'), `import { useCart, useProduct } from '@/hooks';
import { ProductAddToCart, CartCheckout } from '@/storefront/blocks';
export default function FixtureSection() {
  const product = useProduct('fixture');
  const cart = useCart();
  return <section data-section-id="fixture" data-section-role="Product">
    <h1>Generated storefront fixture</h1>
    <p data-slot="product-name">{product.product?.name}</p>
    <ProductAddToCart product={product} />
    <p role="status">Cart items: {cart.itemCount}</p>
    <CartCheckout cart={cart} />
  </section>;
}
`);
}

export async function verifyStorefrontBrowser(browser, origin) {
  const product = { id: 'fixture', slug: 'fixture', name: 'Fixture product', price: 12, stock_status: 'in_stock', active: true };
  const publicHeaders = {
    'Swell-Store-Id': 'fixture', 'Swell-Public-Key': 'fixture-public', 'Swell-Admin-Url': origin,
    'Swell-Access-Token': 'private-sentinel',
  };
  const context = await browser.newContext({ extraHTTPHeaders: publicHeaders });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  let cart = null;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(`${origin}/api/**`, async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    requests.push(`${request.method()} ${pathname}`);
    assert.equal(request.headers().authorization, `Basic ${btoa('fixture-public')}`);
    let result;
    if (pathname === '/api/settings/all') {
      result = { settings: { store: { currency: 'USD', locale: 'en-US', currencies: [{ code: 'USD', decimals: 2 }], locales: [{ code: 'en-US' }] } }, menus: [], payments: {}, subscriptions: {}, session: {} };
    } else if (pathname === '/api/products/fixture') {
      result = product;
    } else if (pathname === '/api/cart' && request.method() === 'GET') {
      result = cart;
    } else if (pathname === '/api/cart/items' && request.method() === 'POST') {
      assert.equal(request.postDataJSON().product_id, 'fixture');
      cart = { id: 'cart', currency: 'USD', item_quantity: 1, items: [{ id: 'line', product, quantity: 1, price: 12 }], checkout_url: 'https://checkout.example.invalid/fixture' };
      result = cart;
    } else {
      errors.push(`Unexpected SDK request: ${request.method()} ${pathname}`);
      return route.fulfill({ status: 404, json: { error: 'Unexpected fixture request' } });
    }
    return route.fulfill({ json: result, headers: { 'X-Session': 'fixture-session' } });
  });
  try {
    await page.goto(`${origin}/products/fixture?swellEmbedded=1`);
    await page.getByText('Fixture product', { exact: true }).waitFor();
    assert.deepEqual(await page.evaluate(() => window.__SWELL__), {
      storeId: 'fixture', publicKey: 'fixture-public', url: origin,
    });
    assert(!(await page.content()).includes('private-sentinel'));
    await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Cart items: 1' }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Checkout', exact: true }).getAttribute('href'), 'https://checkout.example.invalid/fixture');
    assert(requests.includes('GET /api/products/fixture'));
    assert(requests.includes('POST /api/cart/items'));
    assert((await context.cookies()).some((cookie) => cookie.name === 'swell-session' && cookie.value === 'fixture-session'));

    await page.getByRole('heading', { name: 'Generated storefront fixture' }).click();
    assert.equal(await page.locator('[data-section-id="fixture"]').getAttribute('data-swell-hl'), 'selected');
    await page.goto(`${origin}/products/fixture`);
    await page.getByText('Fixture product', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-swell-editor-overlay]').count(), 0);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}
