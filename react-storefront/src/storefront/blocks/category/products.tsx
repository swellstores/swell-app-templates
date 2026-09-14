import type { UseCategoryResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Skeleton, Text } from "@/storefront/primitives";

import { ProductCard } from "../product-list/card";

/**
 * Renders products expanded by useCategory() for category detail and featured category sections.
 */
export interface CategoryProductsProps {
  /**
   * Complete result returned from useCategory().
   */
  category: UseCategoryResult;
  /**
   * Styles the product grid root.
   */
  className?: string;
  /**
   * Styles each product card root.
   */
  cardClassName?: string;
  /**
   * Styles each product card media frame.
   */
  cardMediaClassName?: string;
  /**
   * Styles each product card image.
   */
  cardImageClassName?: string;
  /**
   * Styles each product card content wrapper.
   */
  cardContentClassName?: string;
  /**
   * Styles each product card name.
   */
  cardNameClassName?: string;
  /**
   * Styles each product card price row.
   */
  cardPriceGroupClassName?: string;
  /**
   * Styles each product card current price.
   */
  cardPriceClassName?: string;
  /**
   * Styles each product card compare-at price.
   */
  cardCompareAtClassName?: string;
  /**
   * Styles each product card description.
   */
  cardDescriptionClassName?: string;
  /**
   * Styles each product card sale badge.
   */
  cardBadgeClassName?: string;
  /**
   * Styles loading skeleton cards.
   */
  loadingCardClassName?: string;
  /**
   * Styles the empty-state text.
   */
  emptyClassName?: string;
  /**
   * Text shown when the category has no expanded products.
   */
  emptyLabel?: string;
  /**
   * Number of skeleton cards rendered while loading.
   */
  loadingCount?: number;
  /**
   * Controls whether product prices are rendered.
   */
  showPrice?: boolean;
  /**
   * Controls whether compare-at prices are rendered when available.
   */
  showCompareAt?: boolean;
  /**
   * Controls whether product descriptions are rendered.
   */
  showDescription?: boolean;
  /**
   * Controls whether sale badges are rendered when products are on sale.
   */
  showSaleBadge?: boolean;
  /**
   * Text rendered inside sale badges.
   */
  saleLabel?: string;
}

export function CategoryProducts({
  category,
  className,
  cardClassName,
  cardMediaClassName,
  cardImageClassName,
  cardContentClassName,
  cardNameClassName,
  cardPriceGroupClassName,
  cardPriceClassName,
  cardCompareAtClassName,
  cardDescriptionClassName,
  cardBadgeClassName,
  loadingCardClassName,
  emptyClassName,
  emptyLabel = "No products found.",
  loadingCount = 4,
  showPrice = true,
  showCompareAt = true,
  showDescription = false,
  showSaleBadge = true,
  saleLabel = "Sale",
}: CategoryProductsProps) {
  if (category.isLoading) {
    return (
      <div
        data-slot="category-products-loading"
        className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-4", className)}
      >
        {Array.from({ length: loadingCount }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("aspect-[3/4] w-full rounded-xl", loadingCardClassName)}
          />
        ))}
      </div>
    );
  }

  if (category.products.length === 0) {
    return (
      <Text
        data-slot="category-products-empty"
        className={cn("text-muted-foreground", emptyClassName)}
      >
        {emptyLabel}
      </Text>
    );
  }

  return (
    <div
      data-slot="category-products"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {category.products.map((product) => (
        <ProductCard
          key={product.id ?? product.slug}
          product={product}
          className={cardClassName}
          mediaClassName={cardMediaClassName}
          imageClassName={cardImageClassName}
          contentClassName={cardContentClassName}
          nameClassName={cardNameClassName}
          priceGroupClassName={cardPriceGroupClassName}
          priceClassName={cardPriceClassName}
          compareAtClassName={cardCompareAtClassName}
          descriptionClassName={cardDescriptionClassName}
          badgeClassName={cardBadgeClassName}
          showPrice={showPrice}
          showCompareAt={showCompareAt}
          showDescription={showDescription}
          showSaleBadge={showSaleBadge}
          saleLabel={saleLabel}
        />
      ))}
    </div>
  );
}
