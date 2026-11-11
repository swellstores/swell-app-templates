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

### useConsent

Signature: `useConsent(): UseConsentResult`

Passes the shopper's answers from the store's cookie banner or consent tool to Swell, which uses them for ad attribution: `marketing` (ad clicks and cookies), `analytics` (visits and UTM tags), `sale_of_data` (US privacy laws). Call `setConsent` when the shopper answers or changes an answer, and on load when the tool already holds one; purposes left out stay as they are. It shows no banner and doesn't control ad pixels. Resolves with the recorded consent, or null when the storefront isn't configured or the call failed.

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
