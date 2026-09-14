import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Heading, Skeleton, type HeadingLevel } from "@/storefront/primitives";

/**
 * Renders the selected product name as a heading.
 */
export interface ProductNameProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Semantic heading level passed to the Heading primitive.
   */
  level?: HeadingLevel;
  /**
   * Styles the heading.
   */
  className?: string;
  /**
   * Styles the loading skeleton.
   */
  loadingClassName?: string;
  /**
   * Optional text used when the product name is unavailable.
   */
  fallback?: string;
}

export function ProductName({
  product,
  level = 1,
  className,
  loadingClassName,
  fallback,
}: ProductNameProps) {
  if (product.isLoading) {
    return <Skeleton className={cn("h-10 w-3/4", loadingClassName)} />;
  }

  const name = product.selectedProduct?.name ?? product.product?.name ?? fallback;
  if (!name) return null;

  return (
    <Heading
      data-slot="product-name"
      level={level}
      className={cn("font-heading text-3xl leading-tight font-medium text-balance", className)}
    >
      {name}
    </Heading>
  );
}
