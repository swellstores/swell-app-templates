# src/pages

Pages compose agent-authored sections into route-level storefront screens.

Use pages for routing, page data parameters, and section ordering. Do not put block-level markup or commerce action logic directly in pages.

## Rules

- Import sections from concrete files under `@/storefront/sections/...`.
- Import commerce hooks from `@/hooks` only when the page intentionally owns
  page-level data.
- Prefer letting sections fetch their own commerce data.
- Do not import blocks directly in pages.
- Do not call Swell clients, `@/lib/swell`, or internal hook utilities from pages.
- Do not create a template-owned section library here.

## Page Responsibilities

- Render one route-level screen.
- Read route params with `react-router-dom` when needed.
- Choose which sections appear on the page and in what order.
- Pass simple page context to sections, such as a product slug from the URL.
- Keep page files thin; visual composition belongs in sections.

## Route Parameters

App.tsx owns the route table; page files own route parameter interpretation.

Standard commerce collections are `products` and `categories`. Write commerce
routes with those collection names explicitly:

- `/` -> home page.
- `/products` -> product listing page.
- `/products/:slug` -> product detail page.
- `/categories` -> category listing page.
- `/categories/:slug` -> category detail or category product listing page.
- `*` -> not-found page when generated.

Custom pages and routes are allowed when the storefront concept needs them.
Create a page component for each custom route.

Pages may read route params and pass them to sections.

## File Shape

- Create one page component per file.
- Name files and components by page purpose, such as `HomePage.tsx`,
  `ProductPage.tsx`, `CategoryPage.tsx`, or `LookbookPage.tsx`.
- Export the page component as the default export.
- Pages should import sections from concrete section files, not from a section
  barrel.

## Section Boundary

If a page needs product, product list, cart, menu, locale, or currency UI, create or use a section in `src/storefront/sections` and let that section compose blocks.
