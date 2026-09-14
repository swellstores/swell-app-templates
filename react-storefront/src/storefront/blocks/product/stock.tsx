import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Badge } from "@/storefront/primitives";

/**
 * Renders selected product stock status as a badge.
 */
export interface ProductStockProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the stock badge.
   */
  className?: string;
  /**
   * Label shown for in-stock products.
   */
  inStockLabel?: string;
  /**
   * Label shown for out-of-stock products.
   */
  outOfStockLabel?: string;
  /**
   * Label shown for preorder products.
   */
  preorderLabel?: string;
  /**
   * Label shown for backorder products.
   */
  backorderLabel?: string;
  /**
   * Label shown for discontinued products.
   */
  discontinuedLabel?: string;
  /**
   * Controls whether the badge is hidden when the product is in stock.
   */
  hideWhenInStock?: boolean;
}

export function ProductStock({
  product,
  className,
  inStockLabel = "In stock",
  outOfStockLabel = "Out of stock",
  preorderLabel = "Pre-order",
  backorderLabel = "Available on backorder",
  discontinuedLabel = "Discontinued",
  hideWhenInStock = false,
}: ProductStockProps) {
  if (!product.product || product.isLoading) return null;

  const status = product.stock.status;
  if (hideWhenInStock && (!status || status === "in_stock")) return null;

  const label =
    status === "out_of_stock"
      ? outOfStockLabel
      : status === "preorder"
        ? preorderLabel
        : status === "backorder"
          ? backorderLabel
          : status === "discontinued"
            ? discontinuedLabel
            : inStockLabel;

  return (
    <Badge
      data-slot="product-stock"
      variant={product.stock.inStock ? "secondary" : "outline"}
      className={cn("w-fit", className)}
    >
      {label}
    </Badge>
  );
}
