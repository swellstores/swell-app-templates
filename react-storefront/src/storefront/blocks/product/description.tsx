import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Skeleton, Text } from "@/storefront/primitives";

/**
 * Renders the product HTML description for product detail and featured product sections.
 */
export interface ProductDescriptionProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the rendered description or empty text.
   */
  className?: string;
  /**
   * Styles the loading skeleton.
   */
  loadingClassName?: string;
  /**
   * Optional fallback text shown when the product has no description.
   */
  emptyText?: string;
}

export function ProductDescription({
  product,
  className,
  loadingClassName,
  emptyText,
}: ProductDescriptionProps) {
  if (product.isLoading) {
    return <Skeleton className={cn("h-24 w-full", loadingClassName)} />;
  }

  const description = product.product?.description;
  if (!description) {
    return emptyText ? (
      <Text data-slot="product-description" className={cn("text-muted-foreground", className)}>
        {emptyText}
      </Text>
    ) : null;
  }

  return (
    <div
      data-slot="product-description"
      className={cn(
        "text-sm leading-relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-4",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}
