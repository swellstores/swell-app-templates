# src/storefront/blocks/product-list

Import from: `@/storefront/blocks`

## Exports

### ProductCard

Renders a linked product card for product grids, carousels, recommendations, and featured lists.

Properties:

- `product: Product`
  Product entity from useProducts().products or another product collection.
- `className?: string`
  Styles the card link root.
- `mediaClassName?: string`
  Styles the media frame.
- `imageClassName?: string`
  Styles the product image.
- `contentClassName?: string`
  Styles the text content wrapper.
- `nameClassName?: string`
  Styles the product name heading.
- `priceClassName?: string`
  Styles the current price text.
- `priceGroupClassName?: string`
  Styles the price row wrapper.
- `compareAtClassName?: string`
  Styles the compare-at price text when it is rendered.
- `descriptionClassName?: string`
  Styles the optional product description text.
- `badgeClassName?: string`
  Styles the sale badge.
- `imageIndex?: number`
  Product image index to render.
- `variant?: "plain" | "card" | "compact"`
  Visual card preset.
- `imageRatio?: "square" | "portrait" | "landscape" | "wide"`
  Media frame aspect ratio preset.
- `imageSizes?: string`
  Responsive image sizes passed to the Image primitive.
- `showPrice?: boolean`
  Controls whether product price is rendered.
- `showCompareAt?: boolean`
  Controls whether compare-at price is rendered when available.
- `showDescription?: boolean`
  Controls whether product description is rendered.
- `showSaleBadge?: boolean`
  Controls whether the sale badge is rendered when the product is on sale.
- `saleLabel?: string`
  Text rendered inside the sale badge.

### ProductListFilters

Renders category, price, and attribute filters wired to a product list result.

Properties:

- `products: UseProductsResult`
  Complete result returned from useProducts().
- `className?: string`
  Styles the filters root.
- `groupClassName?: string`
  Styles each accordion filter group.
- `triggerClassName?: string`
  Styles each accordion trigger.
- `optionClassName?: string`
  Styles each checkbox filter option row.
- `titleClassName?: string`
  Styles the filter heading text.
- `clearButtonClassName?: string`
  Styles the clear-filters button.
- `variant?: "panel" | "plain" | "bar"`
  Visual filter container preset.
- `density?: "compact" | "comfortable"`
  Vertical spacing density.
- `title?: string`
  Heading text shown above the filter groups.
- `categoriesLabel?: string`
  Label for the category filter group.
- `priceLabel?: string`
  Label for the price filter group.
- `clearLabel?: string`
  Label for the clear-filters action.
- `showTitle?: boolean`
  Controls whether the filter heading row is rendered.

### ProductListPagination

Renders pagination controls wired to a product list result.

Properties:

- `products: UseProductsResult`
  Complete result returned from useProducts().
- `className?: string`
  Styles the pagination nav root.
- `buttonClassName?: string`
  Styles every pagination button.
- `activeButtonClassName?: string`
  Styles the active page button.
- `ellipsisClassName?: string`
  Styles ellipsis items between page buttons.
- `previousLabel?: string`
  Accessible label for the previous page button.
- `nextLabel?: string`
  Accessible label for the next page button.
- `siblingCount?: number`
  Number of neighboring pages shown around the current page.

### ProductListSearch

Renders a search form wired to a product list result.

Properties:

- `products: UseProductsResult`
  Complete result returned from useProducts().
- `className?: string`
  Styles the search form root.
- `labelClassName?: string`
  Styles the visible or visually hidden label.
- `inputClassName?: string`
  Styles the search input.
- `iconClassName?: string`
  Styles the decorative search icon inside the field.
- `clearButtonClassName?: string`
  Styles the clear-search button.
- `submitButtonClassName?: string`
  Styles the submit button.
- `searchOnChange?: boolean`
  Applies search while the user types instead of waiting for form submit.
- `showSubmitButton?: boolean`
  Shows an explicit submit button inside the search field.
- `label?: string`
  Accessible and optionally visible label for the search field.
- `placeholder?: string`
  Placeholder text for the search input.
- `submitLabel?: string`
  Accessible label for the submit button.
- `clearLabel?: string`
  Accessible label for the clear-search button.
- `hideLabel?: boolean`
  Controls whether the field label is visually hidden.

### ProductListSort

Renders a sort selector wired to a product list result.

Properties:

- `products: UseProductsResult`
  Complete result returned from useProducts().
- `className?: string`
  Styles the sort control root.
- `labelClassName?: string`
  Styles the sort label.
- `triggerClassName?: string`
  Styles the select trigger.
- `label?: string`
  Label and select placeholder text.
- `hideLabel?: boolean`
  Controls whether the label is visually hidden.
