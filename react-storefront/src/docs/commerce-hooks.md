# Commerce hooks

Status: current contract

## Boundary

`src/hooks` is the only public React commerce API for generated storefront
sections.

```text
src/lib/swell
  internal SDK client, provider, cart store, and required transformations
        ↓
src/hooks
  section-facing data, state, and pre-bound actions
        ↓
agent-authored sections
        ↓
blocks receive props and invoke supplied actions
```

Pages compose sections. Each section owns its commerce source: an entity id or
slug can be embedded in the section or derived from the URL. Blocks and
primitives never fetch entities.

Generated code imports hooks only from the public barrel:

```tsx
import { useProduct, useProducts } from "@/hooks";
```

It must not import `src/hooks/query`, the Swell client, Zustand stores, or
internal files under `src/lib/swell`.

`src/lib/swell` is a private vendor adapter, not a general utilities folder and
not a second public API. It contains only the SDK initialization, storefront
context, cart state, menu normalization, and product/cart transformations that
have current consumers. There is deliberately no `index.ts`: internal imports
name the concrete module they depend on.

## Data exposed from Swell

The current base covers the storefront data already supported by the template:

- product by id or slug, including expanded variants;
- product collections with query, search, category, filters, sort, and
  pagination;
- category by id or slug and category collections;
- resolved navigation menus loaded with storefront settings;
- active and available currencies/locales;
- cart lines, totals, checkout URL, and cart mutations.

Raw entities retain their `swell-js` types. Hooks add render-ready derived data
and actions without copying entities into parallel models.

## `useProduct(idOrSlug, query?)`

`useProduct` is the complete single-product hook. It both fetches data and owns
the coordinated actions needed by product blocks.

It returns:

- `product` and `selectedProduct`;
- `gallery` with image navigation actions;
- normalized numeric `price` and formatted price values;
- `options`, whose controls contain selection actions;
- `purchaseOptions`, whose items contain `select` actions;
- `quantity` with `set`, `increase`, and `decrease`;
- `stock`;
- `addToCart` with `execute`, `disabled`, and `isPending`;
- `error`, `isLoading`, `isFetching`, and `refetch`.

There are no public `useProductSelection` or `useProductState` hooks.

```tsx
const product = useProduct(productSlug);

<ProductGallery product={product} />
<ProductOptions product={product} />
<ProductQuantity product={product} />
<ProductAddToCart product={product} />
```

The agent passes complete typed objects; it does not create action callbacks.

## `useProducts(options?)`

`useProducts` is the only product-collection hook. It returns:

- `products` and `count`;
- the effective Swell `query`;
- `search` state/action;
- category, price, and attribute filter state/actions;
- sort state/action;
- pagination state/action;
- active-filter state and `clearFilters`;
- `error`, `isLoading`, `isFetching`, and `refetch`.

A simple rail or grid may use only `products`:

```tsx
const { products } = useProducts({ limit: 8, sort: "date_created desc" });
```

A full catalog section uses the same hook and passes additional objects into
its blocks:

```tsx
const products = useProducts();

<ProductListFilters products={products} />
<ProductListSort products={products} />
<div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
  {products.products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
<ProductListPagination products={products} />
```

There is no separate `useProductList`. Generated code must not call
`setSearchParams`, construct `$filters`, or implement sorting/pagination logic.

## Other hooks

- `useCategory(idOrSlug, query?)`
- `useCategories(query?)`
- `useMenu(id)` and `useMenus()`
- `useCart()`
- `useCurrency()`
- `useLocale()`

All asynchronous entity hooks use the same status fields: `error`, `isLoading`,
`isFetching`, and `refetch`.

## Action ownership

The hook owns the commerce operation. The block owns the UI event that invokes
the supplied action:

```tsx
function ProductAddToCart({ action }: ProductAddToCartProps) {
  return (
    <Button disabled={action.disabled || action.isPending} onClick={action.execute}>
      Add to cart
    </Button>
  );
}
```

This keeps commerce behavior stable while sections retain structural and visual
freedom.
