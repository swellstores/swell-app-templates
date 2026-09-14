import { ShoppingBagIcon } from "lucide-react";

import type { UseCartResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Badge, Button, Link } from "@/storefront/primitives";

/**
 * Renders a cart trigger with optional item count badge for cart drawers, overlays, or explicit cart links.
 */
export interface CartTriggerProps {
  /**
   * Complete result returned from useCart().
   */
  cart: UseCartResult;
  /**
   * Styles the trigger button.
   */
  className?: string;
  /**
   * Styles the cart icon.
   */
  iconClassName?: string;
  /**
   * Styles the visible label text.
   */
  labelClassName?: string;
  /**
   * Styles the item count badge.
   */
  badgeClassName?: string;
  /**
   * Optional destination used when the trigger should render as a link instead of a button.
   */
  href?: string;
  /**
   * Optional UI handler used by cart drawers or overlays.
   */
  onClick?: () => void;
  /**
   * Visible label text when showLabel is true and accessible label base when it is false.
   */
  label?: string;
  /**
   * Controls whether the text label is shown next to the cart icon.
   */
  showLabel?: boolean;
  /**
   * Controls whether the item count badge is shown.
   */
  showCount?: boolean;
  /**
   * shadcn button visual variant.
   */
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
}

export function CartTrigger({
  cart,
  className,
  iconClassName,
  labelClassName,
  badgeClassName,
  href,
  onClick,
  label = "Cart",
  showLabel = false,
  showCount = true,
  variant = "ghost",
}: CartTriggerProps) {
  const content = (
    <>
      <ShoppingBagIcon className={iconClassName} aria-hidden="true" />
      {showLabel && <span className={labelClassName}>{label}</span>}
      {showCount && cart.itemCount > 0 && (
        <Badge
          className={cn(
            "absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] tabular-nums",
            badgeClassName,
          )}
        >
          {cart.itemCount}
        </Badge>
      )}
    </>
  );

  if (href) {
    return (
      <Button
        data-slot="cart-trigger"
        asChild
        variant={variant}
        size={showLabel ? "default" : "icon"}
        className={cn("relative", className)}
      >
        <Link to={href} aria-label={showLabel ? undefined : `${label}, ${cart.itemCount} items`}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      data-slot="cart-trigger"
      type="button"
      variant={variant}
      size={showLabel ? "default" : "icon"}
      className={cn("relative", className)}
      onClick={onClick}
      aria-label={showLabel ? undefined : `${label}, ${cart.itemCount} items`}
    >
      {content}
    </Button>
  );
}
