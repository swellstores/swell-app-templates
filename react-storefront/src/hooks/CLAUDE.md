# src/hooks

Import from: `@/hooks`

## Exports

### useCart

Signature: `useCart(): UseCartResult`

Loads the current storefront cart and exposes cart data, formatting, and actions.

### useCategories

Signature: `useCategories(query: Query = ...): UseCategoriesResult`

Fetches multiple storefront categories for category grids, category indexes, navigation, and category-list sections.

### useCategory

Signature: `useCategory(idOrSlug: string | undefined, query: Query = ...): UseCategoryResult`

Fetches one storefront category by id or slug with its products expanded for category detail and featured category sections.

### useCurrency

Signature: `useCurrency(): UseCurrencyResult`

Reads and updates the active storefront currency.

### useLocale

Signature: `useLocale(): UseLocaleResult`

Reads and updates the active storefront locale.

### useMenu

Signature: `useMenu(id: string | undefined): ResolvedMenu | null`

Returns one resolved storefront menu by id.

### useMenus

Signature: `useMenus(): ResolvedMenu[]`

Returns all resolved storefront menus available to generated sections.

### useProduct

Signature: `useProduct(idOrSlug: string | undefined, query: ProductQuery = ...): UseProductResult`

Fetches and controls one product for product detail, featured product, and quick-view sections.

### useProducts

Signature: `useProducts(input: UseProductsOptions = ...): UseProductsResult`

Fetches and controls a product list with filters, search, sort, and pagination for product grids and product listing pages.
