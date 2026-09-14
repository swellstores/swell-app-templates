# src/storefront/blocks/product

Import from: `@/storefront/blocks`

## Exports

### ProductAddToCart

Renders an add-to-cart button wired to the selected product, quantity, options, and purchase option.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the button root.
- `iconClassName?: string`
  Styles the optional leading icon.
- `label?: string`
  Button label shown while the product can be added.
- `pendingLabel?: string`
  Button label shown while the add-to-cart action is pending.
- `unavailableLabel?: string`
  Button label shown when the selected product cannot be purchased.
- `showIcon?: boolean`
  Controls whether the cart/status icon is rendered before the label.
- `variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"`
  shadcn button visual variant.
- `size?: "default" | "xs" | "sm" | "lg"`
  shadcn button size.

### ProductDescription

Renders the product HTML description for product detail and featured product sections.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the rendered description or empty text.
- `loadingClassName?: string`
  Styles the loading skeleton.
- `emptyText?: string`
  Optional fallback text shown when the product has no description.

### ProductDetails

Renders product content fields as accordions for detail-heavy product sections.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the accordion root.
- `itemClassName?: string`
  Styles each accordion item.
- `triggerClassName?: string`
  Styles each accordion trigger.
- `contentClassName?: string`
  Styles each accordion content panel.
- `defaultOpen?: string[]`
  Accordion item keys that should be open initially.
- `showDescription?: boolean`
  Controls whether product.description is shown as the first detail item.
- `descriptionLabel?: string`
  Label used for the optional description accordion item.

### ProductGallery

Renders an interactive product media gallery with optional controls and thumbnails.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the gallery root.
- `frameClassName?: string`
  Styles the main image frame.
- `imageClassName?: string`
  Styles the main image.
- `thumbnailsClassName?: string`
  Styles the thumbnail list wrapper.
- `thumbnailClassName?: string`
  Styles each thumbnail button.
- `thumbnailImageClassName?: string`
  Styles each thumbnail image.
- `controlsClassName?: string`
  Styles the previous/next controls wrapper.
- `controlButtonClassName?: string`
  Styles the previous and next control buttons.
- `showControls?: boolean`
  Controls whether previous/next image buttons are shown for multi-image products.
- `showThumbnails?: boolean`
  Controls whether thumbnail buttons are shown for multi-image products.
- `sizes?: string`
  Responsive image sizes passed to the main Image primitive.
- `previousLabel?: string`
  Accessible label for the previous image button.
- `nextLabel?: string`
  Accessible label for the next image button.

### ProductName

Renders the selected product name as a heading.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `level?: HeadingLevel`
  Semantic heading level passed to the Heading primitive.
- `className?: string`
  Styles the heading.
- `loadingClassName?: string`
  Styles the loading skeleton.
- `fallback?: string`
  Optional text used when the product name is unavailable.

### ProductOptions

Renders configurable product options and wires option changes back to useProduct().

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the options group root.
- `optionClassName?: string`
  Styles each option row or field group.
- `labelClassName?: string`
  Styles option labels.
- `controlClassName?: string`
  Styles option controls such as select triggers, inputs, textareas, and switches.

### ProductPrice

Renders the selected product price for product detail, featured product, and quick-view sections.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the root price wrapper.
- `currentClassName?: string`
  Styles the current price text.
- `compareAtClassName?: string`
  Styles the compare-at price text when it is rendered.
- `saleLabelClassName?: string`
  Styles the optional sale label.
- `loadingClassName?: string`
  Styles the loading skeleton.
- `showCompareAt?: boolean`
  Controls whether the compare-at price is shown when the product is on sale.
- `saleLabel?: string`
  Optional label rendered next to the price when the product is on sale.

### ProductPurchaseOptions

Renders purchase options such as one-time purchase and subscriptions for the selected product.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the fieldset root.
- `optionClassName?: string`
  Styles each purchase option label row.
- `labelClassName?: string`
  Styles the inner label and price layout for each option.
- `priceClassName?: string`
  Styles the optional option price.
- `legend?: string`
  Fieldset legend text.
- `legendClassName?: string`
  Styles the fieldset legend.

### ProductQuantity

Renders quantity controls wired to the selected product quantity state.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the quantity block root.
- `labelClassName?: string`
  Styles the visible quantity label.
- `controlClassName?: string`
  Styles the button/input control wrapper.
- `buttonClassName?: string`
  Styles the decrease and increase buttons.
- `inputClassName?: string`
  Styles the quantity input.
- `label?: string`
  Visible quantity label text.
- `decreaseLabel?: string`
  Accessible label for the decrease button.
- `increaseLabel?: string`
  Accessible label for the increase button.

### ProductStock

Renders selected product stock status as a badge.

Properties:

- `product: UseProductResult`
  Complete result returned from useProduct().
- `className?: string`
  Styles the stock badge.
- `inStockLabel?: string`
  Label shown for in-stock products.
- `outOfStockLabel?: string`
  Label shown for out-of-stock products.
- `preorderLabel?: string`
  Label shown for preorder products.
- `backorderLabel?: string`
  Label shown for backorder products.
- `discontinuedLabel?: string`
  Label shown for discontinued products.
- `hideWhenInStock?: boolean`
  Controls whether the badge is hidden when the product is in stock.
