import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { CartLine as CartLineState, UseCartResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, Image, Link, Text } from "@/storefront/primitives";

/**
 * Renders a cart line item with product link, quantity controls, price, and remove action.
 */
export interface CartLineProps {
  /**
   * Complete result returned from useCart().
   */
  cart: UseCartResult;
  /**
   * One cart line from cart.items.
   */
  item: CartLineState;
  /**
   * Styles the cart line root.
   */
  className?: string;
  /**
   * Styles the product image.
   */
  imageClassName?: string;
  /**
   * Styles the content wrapper.
   */
  contentClassName?: string;
  /**
   * Styles the product name link or text.
   */
  nameClassName?: string;
  /**
   * Styles the selected options text.
   */
  optionsClassName?: string;
  /**
   * Styles the billing interval text.
   */
  billingClassName?: string;
  /**
   * Styles the line total price.
   */
  priceClassName?: string;
  /**
   * Styles the quantity control wrapper.
   */
  quantityClassName?: string;
  /**
   * Styles the decrease and increase quantity buttons.
   */
  quantityButtonClassName?: string;
  /**
   * Styles the quantity value text.
   */
  quantityValueClassName?: string;
  /**
   * Styles the optional unit price text.
   */
  unitPriceClassName?: string;
  /**
   * Styles the remove button.
   */
  removeButtonClassName?: string;
  /**
   * Accessible label for the remove button.
   */
  removeLabel?: string;
  /**
   * Accessible label for the decrease quantity button.
   */
  decreaseLabel?: string;
  /**
   * Accessible label for the increase quantity button.
   */
  increaseLabel?: string;
  /**
   * Controls whether unit price text is rendered near the remove action.
   */
  showUnitPrice?: boolean;
  /**
   * Spacing and image-size density preset.
   */
  density?: "compact" | "comfortable";
}

export function CartLine({
  cart,
  item,
  className,
  imageClassName,
  contentClassName,
  nameClassName,
  optionsClassName,
  billingClassName,
  priceClassName,
  quantityClassName,
  quantityButtonClassName,
  quantityValueClassName,
  unitPriceClassName,
  removeButtonClassName,
  removeLabel = "Remove item",
  decreaseLabel = "Decrease quantity",
  increaseLabel = "Increase quantity",
  showUnitPrice = false,
  density = "comfortable",
}: CartLineProps) {
  const content = (
    <>
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.name}
          className={cn(
            "aspect-square rounded-lg object-cover",
            cartLineImageDensityClassName[density],
            imageClassName,
          )}
        />
      )}
      <div className={cn("min-w-0 flex-1 space-y-2", contentClassName)}>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
          <div className="min-w-0">
            {item.productHref ? (
              <Link
                to={item.productHref}
                className={cn(
                  "line-clamp-2 font-medium leading-snug hover:underline",
                  nameClassName,
                )}
              >
                {item.name}
              </Link>
            ) : (
              <Text className={cn("line-clamp-2 font-medium leading-snug", nameClassName)}>
                {item.name}
              </Text>
            )}
            {item.options.length > 0 && (
              <Text className={cn("mt-1 text-xs text-muted-foreground", optionsClassName)}>
                {item.options.map((option) => `${option.name}: ${option.value}`).join(" · ")}
              </Text>
            )}
            {item.billing && (
              <Text className={cn("mt-1 text-xs text-muted-foreground", billingClassName)}>
                Every {item.billing.count} {item.billing.interval}
              </Text>
            )}
          </div>
          <Text
            as="span"
            className={cn("shrink-0 font-medium tabular-nums sm:text-right", priceClassName)}
          >
            {cart.format(item.total)}
          </Text>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div
            data-slot="cart-line-quantity"
            className={cn("inline-flex items-center rounded-lg border", quantityClassName)}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-none", quantityButtonClassName)}
              onClick={() => void item.setQuantity(item.quantity - 1)}
              disabled={item.isUpdating}
              aria-label={decreaseLabel}
            >
              <MinusIcon aria-hidden="true" />
            </Button>
            <span
              className={cn("min-w-8 text-center text-sm tabular-nums", quantityValueClassName)}
            >
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-none", quantityButtonClassName)}
              onClick={() => void item.setQuantity(item.quantity + 1)}
              disabled={item.isUpdating}
              aria-label={increaseLabel}
            >
              <PlusIcon aria-hidden="true" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {showUnitPrice && (
              <Text as="span" className={cn("text-xs text-muted-foreground", unitPriceClassName)}>
                {cart.format(item.unitPrice)} each
              </Text>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={removeButtonClassName}
              onClick={() => void item.remove()}
              disabled={item.isUpdating}
              aria-label={removeLabel}
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <article
      data-slot="cart-line"
      className={cn(
        "flex min-w-0 border-b last:border-b-0",
        cartLineDensityClassName[density],
        className,
      )}
    >
      {content}
    </article>
  );
}

const cartLineDensityClassName = {
  compact: "gap-3 py-3",
  comfortable: "gap-4 py-4",
} as const;

const cartLineImageDensityClassName = {
  compact: "size-16 sm:size-20",
  comfortable: "size-20 sm:size-24",
} as const;
