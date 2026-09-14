import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Label, RadioGroup, RadioGroupItem, Text } from "@/storefront/primitives";

/**
 * Renders purchase options such as one-time purchase and subscriptions for the selected product.
 */
export interface ProductPurchaseOptionsProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the fieldset root.
   */
  className?: string;
  /**
   * Styles each purchase option label row.
   */
  optionClassName?: string;
  /**
   * Styles the inner label and price layout for each option.
   */
  labelClassName?: string;
  /**
   * Styles the optional option price.
   */
  priceClassName?: string;
  /**
   * Fieldset legend text.
   */
  legend?: string;
  /**
   * Styles the fieldset legend.
   */
  legendClassName?: string;
}

export function ProductPurchaseOptions({
  product,
  className,
  optionClassName,
  labelClassName,
  priceClassName,
  legend = "Purchase options",
  legendClassName,
}: ProductPurchaseOptionsProps) {
  if (product.purchaseOptions.length <= 1) return null;

  const selected = product.purchaseOptions.find((option) => option.selected)?.id;

  return (
    <fieldset data-slot="product-purchase-options" className={cn("grid gap-3", className)}>
      <legend className={cn("mb-1 text-sm font-medium", legendClassName)}>{legend}</legend>
      <RadioGroup
        value={selected}
        onValueChange={(value) =>
          product.purchaseOptions.find((item) => item.id === value)?.select()
        }
      >
        {product.purchaseOptions.map((option) => (
          <Label
            key={option.id}
            htmlFor={`purchase-option-${option.id}`}
            data-slot="product-purchase-option"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors has-data-checked:border-primary has-data-checked:bg-muted/50",
              optionClassName,
            )}
          >
            <RadioGroupItem id={`purchase-option-${option.id}`} value={option.id} />
            <span
              className={cn(
                "flex min-w-0 flex-1 items-center justify-between gap-3",
                labelClassName,
              )}
            >
              <span>{option.label}</span>
              {option.price !== null && (
                <Text as="span" className={cn("shrink-0 font-medium", priceClassName)}>
                  {formatPrice(option.price, product.price.currency)}
                </Text>
              )}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

function formatPrice(amount: number, currency: string | null): string {
  if (!currency) return String(amount);

  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
