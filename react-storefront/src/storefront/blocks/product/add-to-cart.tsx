import { LoaderCircleIcon, ShoppingBagIcon } from "lucide-react";

import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/storefront/primitives";

/**
 * Renders an add-to-cart button wired to the selected product, quantity, options, and purchase option.
 */
export interface ProductAddToCartProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the button root.
   */
  className?: string;
  /**
   * Styles the optional leading icon.
   */
  iconClassName?: string;
  /**
   * Button label shown while the product can be added.
   */
  label?: string;
  /**
   * Button label shown while the add-to-cart action is pending.
   */
  pendingLabel?: string;
  /**
   * Button label shown when the selected product cannot be purchased.
   */
  unavailableLabel?: string;
  /**
   * Controls whether the cart/status icon is rendered before the label.
   */
  showIcon?: boolean;
  /**
   * shadcn button visual variant.
   */
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  /**
   * shadcn button size.
   */
  size?: "default" | "xs" | "sm" | "lg";
}

export function ProductAddToCart({
  product,
  className,
  iconClassName,
  label = "Add to cart",
  pendingLabel = "Adding…",
  unavailableLabel = "Unavailable",
  showIcon = true,
  variant = "default",
  size = "lg",
}: ProductAddToCartProps) {
  const { addToCart } = product;
  const buttonLabel = !product.stock.inStock
    ? unavailableLabel
    : addToCart.isPending
      ? pendingLabel
      : label;

  return (
    <Button
      data-slot="product-add-to-cart"
      type="button"
      variant={variant}
      size={size}
      className={cn("w-full", className)}
      disabled={addToCart.disabled || addToCart.isPending}
      onClick={() => void addToCart.execute()}
    >
      {showIcon &&
        (addToCart.isPending ? (
          <LoaderCircleIcon className={cn("animate-spin", iconClassName)} aria-hidden="true" />
        ) : (
          <ShoppingBagIcon className={iconClassName} aria-hidden="true" />
        ))}
      {buttonLabel}
    </Button>
  );
}
