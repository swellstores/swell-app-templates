import { ArrowRightIcon } from "lucide-react";

import type { UseCartResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/storefront/primitives";

/**
 * Renders a checkout button wired to the current cart checkout URL.
 */
export interface CartCheckoutProps {
  /**
   * Complete result returned from useCart().
   */
  cart: UseCartResult;
  /**
   * Styles the checkout button.
   */
  className?: string;
  /**
   * Styles the optional trailing icon.
   */
  iconClassName?: string;
  /**
   * Button label shown when checkout is available.
   */
  label?: string;
  /**
   * Button label shown when the cart is empty or checkout is unavailable.
   */
  emptyLabel?: string;
  /**
   * Controls whether the trailing arrow icon is rendered.
   */
  showIcon?: boolean;
  /**
   * shadcn button visual variant.
   */
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
}

export function CartCheckout({
  cart,
  className,
  iconClassName,
  label = "Checkout",
  emptyLabel = "Cart is empty",
  showIcon = true,
  variant = "default",
}: CartCheckoutProps) {
  const disabled = cart.isEmpty || !cart.checkoutUrl;

  if (disabled) {
    return (
      <Button
        data-slot="cart-checkout"
        type="button"
        variant={variant}
        size="lg"
        className={cn("w-full", className)}
        disabled
      >
        {emptyLabel}
      </Button>
    );
  }

  return (
    <Button
      data-slot="cart-checkout"
      asChild
      variant={variant}
      size="lg"
      className={cn("w-full", className)}
    >
      <a href={cart.checkoutUrl}>
        {label}
        {showIcon && <ArrowRightIcon className={iconClassName} aria-hidden="true" />}
      </a>
    </Button>
  );
}
