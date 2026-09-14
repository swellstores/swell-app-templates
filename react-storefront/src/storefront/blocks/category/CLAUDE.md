# src/storefront/blocks/category

Import from: `@/storefront/blocks`

## Exports

### CategoryDescription

Renders the selected category description as trusted storefront HTML.

Properties:

- `category: UseCategoryResult`
  Complete result returned from useCategory().
- `className?: string`
  Styles the description wrapper.
- `loadingClassName?: string`
  Styles the loading skeleton.

### CategoryImage

Renders the selected category image.

Properties:

- `category: UseCategoryResult`
  Complete result returned from useCategory().
- `className?: string`
  Styles the media frame.
- `imageClassName?: string`
  Styles the image element.
- `loadingClassName?: string`
  Styles the loading skeleton.
- `imageSizes?: string`
  Responsive image sizes passed to the Image primitive.

### CategoryName

Renders the selected category name as a heading.

Properties:

- `category: UseCategoryResult`
  Complete result returned from useCategory().
- `level?: HeadingLevel`
  Semantic heading level passed to the Heading primitive.
- `className?: string`
  Styles the heading.
- `loadingClassName?: string`
  Styles the loading skeleton.
- `fallback?: string`
  Optional text used when the category name is unavailable.

### CategoryProducts

Renders products expanded by useCategory() for category detail and featured category sections.

Properties:

- `category: UseCategoryResult`
  Complete result returned from useCategory().
- `className?: string`
  Styles the product grid root.
- `cardClassName?: string`
  Styles each product card root.
- `cardMediaClassName?: string`
  Styles each product card media frame.
- `cardImageClassName?: string`
  Styles each product card image.
- `cardContentClassName?: string`
  Styles each product card content wrapper.
- `cardNameClassName?: string`
  Styles each product card name.
- `cardPriceGroupClassName?: string`
  Styles each product card price row.
- `cardPriceClassName?: string`
  Styles each product card current price.
- `cardCompareAtClassName?: string`
  Styles each product card compare-at price.
- `cardDescriptionClassName?: string`
  Styles each product card description.
- `cardBadgeClassName?: string`
  Styles each product card sale badge.
- `loadingCardClassName?: string`
  Styles loading skeleton cards.
- `emptyClassName?: string`
  Styles the empty-state text.
- `emptyLabel?: string`
  Text shown when the category has no expanded products.
- `loadingCount?: number`
  Number of skeleton cards rendered while loading.
- `showPrice?: boolean`
  Controls whether product prices are rendered.
- `showCompareAt?: boolean`
  Controls whether compare-at prices are rendered when available.
- `showDescription?: boolean`
  Controls whether product descriptions are rendered.
- `showSaleBadge?: boolean`
  Controls whether sale badges are rendered when products are on sale.
- `saleLabel?: string`
  Text rendered inside sale badges.
