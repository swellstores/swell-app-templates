import type { UseCartResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Separator, Text } from "@/storefront/primitives";

/**
 * Renders subtotal, discounts, tax, and total for the current cart.
 */
export interface CartSummaryProps {
  /**
   * Complete result returned from useCart().
   */
  cart: UseCartResult;
  /**
   * Styles the summary root.
   */
  className?: string;
  /**
   * Styles every summary row.
   */
  rowClassName?: string;
  /**
   * Styles every summary label.
   */
  labelClassName?: string;
  /**
   * Styles every summary value.
   */
  valueClassName?: string;
  /**
   * Styles the total row in addition to rowClassName.
   */
  totalClassName?: string;
  /**
   * Label for the subtotal row.
   */
  subtotalLabel?: string;
  /**
   * Label for the discount row.
   */
  discountLabel?: string;
  /**
   * Label for the tax row.
   */
  taxLabel?: string;
  /**
   * Label for the total row.
   */
  totalLabel?: string;
  /**
   * Controls whether tax is shown when the cart has tax total.
   */
  showTax?: boolean;
}

export function CartSummary({
  cart,
  className,
  rowClassName,
  labelClassName,
  valueClassName,
  totalClassName,
  subtotalLabel = "Subtotal",
  discountLabel = "Discount",
  taxLabel = "Tax",
  totalLabel = "Total",
  showTax = true,
}: CartSummaryProps) {
  return (
    <div data-slot="cart-summary" className={cn("grid gap-3", className)}>
      <SummaryRow
        label={subtotalLabel}
        value={cart.format(cart.subtotal)}
        className={rowClassName}
        labelClassName={labelClassName}
        valueClassName={valueClassName}
      />
      {cart.discountTotal > 0 && (
        <SummaryRow
          label={discountLabel}
          value={`−${cart.format(cart.discountTotal)}`}
          className={rowClassName}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      )}
      {showTax && cart.taxTotal > 0 && (
        <SummaryRow
          label={taxLabel}
          value={cart.format(cart.taxTotal)}
          className={rowClassName}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      )}
      <Separator />
      <SummaryRow
        label={totalLabel}
        value={cart.format(cart.total)}
        className={cn("text-base font-medium", rowClassName, totalClassName)}
        labelClassName={labelClassName}
        valueClassName={valueClassName}
      />
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

function SummaryRow({ label, value, className, labelClassName, valueClassName }: SummaryRowProps) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 text-sm", className)}>
      <Text as="span" className={labelClassName}>
        {label}
      </Text>
      <Text as="span" className={cn("tabular-nums", valueClassName)}>
        {value}
      </Text>
    </div>
  );
}
