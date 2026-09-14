import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Skeleton, Text } from "@/storefront/primitives";

/**
 * Renders the selected product price for product detail, featured product, and quick-view sections.
 */
export interface ProductPriceProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the root price wrapper.
   */
  className?: string;
  /**
   * Styles the current price text.
   */
  currentClassName?: string;
  /**
   * Styles the compare-at price text when it is rendered.
   */
  compareAtClassName?: string;
  /**
   * Styles the optional sale label.
   */
  saleLabelClassName?: string;
  /**
   * Styles the loading skeleton.
   */
  loadingClassName?: string;
  /**
   * Controls whether the compare-at price is shown when the product is on sale.
   */
  showCompareAt?: boolean;
  /**
   * Optional label rendered next to the price when the product is on sale.
   */
  saleLabel?: string;
}

export function ProductPrice({
  product,
  className,
  currentClassName,
  compareAtClassName,
  saleLabelClassName,
  loadingClassName,
  showCompareAt = true,
  saleLabel,
}: ProductPriceProps) {
  if (product.isLoading) {
    return <Skeleton className={cn("h-7 w-28", loadingClassName)} />;
  }

  if (!product.formattedPrice) return null;

  return (
    <div
      data-slot="product-price"
      className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}
    >
      <Text as="span" className={cn("text-xl font-medium", currentClassName)}>
        {product.formattedPrice}
      </Text>
      {showCompareAt && product.formattedOriginalPrice && (
        <Text
          as="span"
          className={cn("text-sm text-muted-foreground line-through", compareAtClassName)}
        >
          {product.formattedOriginalPrice}
        </Text>
      )}
      {saleLabel && product.price.onSale && (
        <Text as="span" className={cn("text-xs font-medium text-destructive", saleLabelClassName)}>
          {saleLabel}
        </Text>
      )}
    </div>
  );
}
