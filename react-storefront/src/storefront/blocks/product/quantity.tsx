import { useId } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";

import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, Input, Label } from "@/storefront/primitives";

/**
 * Renders quantity controls wired to the selected product quantity state.
 */
export interface ProductQuantityProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the quantity block root.
   */
  className?: string;
  /**
   * Styles the visible quantity label.
   */
  labelClassName?: string;
  /**
   * Styles the button/input control wrapper.
   */
  controlClassName?: string;
  /**
   * Styles the decrease and increase buttons.
   */
  buttonClassName?: string;
  /**
   * Styles the quantity input.
   */
  inputClassName?: string;
  /**
   * Visible quantity label text.
   */
  label?: string;
  /**
   * Accessible label for the decrease button.
   */
  decreaseLabel?: string;
  /**
   * Accessible label for the increase button.
   */
  increaseLabel?: string;
}

export function ProductQuantity({
  product,
  className,
  labelClassName,
  controlClassName,
  buttonClassName,
  inputClassName,
  label = "Quantity",
  decreaseLabel = "Decrease quantity",
  increaseLabel = "Increase quantity",
}: ProductQuantityProps) {
  const inputId = useId();
  if (!product.product) return null;

  return (
    <div data-slot="product-quantity" className={cn("grid gap-2", className)}>
      <Label htmlFor={inputId} className={labelClassName}>
        {label}
      </Label>
      <div
        className={cn(
          "inline-flex w-fit items-center overflow-hidden rounded-lg border bg-background",
          controlClassName,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("rounded-none", buttonClassName)}
          onClick={product.quantity.decrease}
          disabled={product.quantity.value <= product.quantity.min}
          aria-label={decreaseLabel}
        >
          <MinusIcon aria-hidden="true" />
        </Button>
        <Input
          id={inputId}
          type="number"
          min={product.quantity.min}
          step={product.quantity.increment}
          value={product.quantity.value}
          onChange={(event) => product.quantity.set(Number(event.currentTarget.value))}
          className={cn(
            "h-8 w-14 rounded-none border-0 bg-transparent text-center tabular-nums shadow-none focus-visible:ring-0",
            inputClassName,
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("rounded-none", buttonClassName)}
          onClick={product.quantity.increase}
          aria-label={increaseLabel}
        >
          <PlusIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
