# src/storefront/blocks/cart

Import from: `@/storefront/blocks`

## Exports

### CartCheckout

Renders a checkout button wired to the current cart checkout URL.

Properties:

- `cart: UseCartResult`
  Complete result returned from useCart().
- `className?: string`
  Styles the checkout button.
- `iconClassName?: string`
  Styles the optional trailing icon.
- `label?: string`
  Button label shown when checkout is available.
- `emptyLabel?: string`
  Button label shown when the cart is empty or checkout is unavailable.
- `showIcon?: boolean`
  Controls whether the trailing arrow icon is rendered.
- `variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"`
  shadcn button visual variant.

### CartLine

Renders a cart line item with product link, quantity controls, price, and remove action.

Properties:

- `cart: UseCartResult`
  Complete result returned from useCart().
- `item: CartLineState`
  One cart line from cart.items.
- `className?: string`
  Styles the cart line root.
- `imageClassName?: string`
  Styles the product image.
- `contentClassName?: string`
  Styles the content wrapper.
- `nameClassName?: string`
  Styles the product name link or text.
- `optionsClassName?: string`
  Styles the selected options text.
- `billingClassName?: string`
  Styles the billing interval text.
- `priceClassName?: string`
  Styles the line total price.
- `quantityClassName?: string`
  Styles the quantity control wrapper.
- `quantityButtonClassName?: string`
  Styles the decrease and increase quantity buttons.
- `quantityValueClassName?: string`
  Styles the quantity value text.
- `unitPriceClassName?: string`
  Styles the optional unit price text.
- `removeButtonClassName?: string`
  Styles the remove button.
- `removeLabel?: string`
  Accessible label for the remove button.
- `decreaseLabel?: string`
  Accessible label for the decrease quantity button.
- `increaseLabel?: string`
  Accessible label for the increase quantity button.
- `showUnitPrice?: boolean`
  Controls whether unit price text is rendered near the remove action.
- `density?: "compact" | "comfortable"`
  Spacing and image-size density preset.

### CartSummary

Renders subtotal, discounts, tax, and total for the current cart.

Properties:

- `cart: UseCartResult`
  Complete result returned from useCart().
- `className?: string`
  Styles the summary root.
- `rowClassName?: string`
  Styles every summary row.
- `labelClassName?: string`
  Styles every summary label.
- `valueClassName?: string`
  Styles every summary value.
- `totalClassName?: string`
  Styles the total row in addition to rowClassName.
- `subtotalLabel?: string`
  Label for the subtotal row.
- `discountLabel?: string`
  Label for the discount row.
- `taxLabel?: string`
  Label for the tax row.
- `totalLabel?: string`
  Label for the total row.
- `showTax?: boolean`
  Controls whether tax is shown when the cart has tax total.

### CartTrigger

Renders a cart trigger with optional item count badge for cart drawers, overlays, or explicit cart links.

Properties:

- `cart: UseCartResult`
  Complete result returned from useCart().
- `className?: string`
  Styles the trigger button.
- `iconClassName?: string`
  Styles the cart icon.
- `labelClassName?: string`
  Styles the visible label text.
- `badgeClassName?: string`
  Styles the item count badge.
- `href?: string`
  Optional destination used when the trigger should render as a link instead of a button.
- `onClick?: () => void`
  Optional UI handler used by cart drawers or overlays.
- `label?: string`
  Visible label text when showLabel is true and accessible label base when it is false.
- `showLabel?: boolean`
  Controls whether the text label is shown next to the cart icon.
- `showCount?: boolean`
  Controls whether the item count badge is shown.
- `variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"`
  shadcn button visual variant.
