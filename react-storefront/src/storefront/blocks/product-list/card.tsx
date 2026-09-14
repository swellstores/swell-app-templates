import type { Product } from "swell-js";

import { getProductImage, getProductPrice } from "@/lib/swell/product";
import { cn } from "@/lib/utils";
import { Badge, Heading, Image, Link, Text } from "@/storefront/primitives";

/**
 * Renders a linked product card for product grids, carousels, recommendations, and featured lists.
 */
export interface ProductCardProps {
  /**
   * Product entity from useProducts().products or another product collection.
   */
  product: Product;
  /**
   * Styles the card link root.
   */
  className?: string;
  /**
   * Styles the media frame.
   */
  mediaClassName?: string;
  /**
   * Styles the product image.
   */
  imageClassName?: string;
  /**
   * Styles the text content wrapper.
   */
  contentClassName?: string;
  /**
   * Styles the product name heading.
   */
  nameClassName?: string;
  /**
   * Styles the current price text.
   */
  priceClassName?: string;
  /**
   * Styles the price row wrapper.
   */
  priceGroupClassName?: string;
  /**
   * Styles the compare-at price text when it is rendered.
   */
  compareAtClassName?: string;
  /**
   * Styles the optional product description text.
   */
  descriptionClassName?: string;
  /**
   * Styles the sale badge.
   */
  badgeClassName?: string;
  /**
   * Product image index to render.
   */
  imageIndex?: number;
  /**
   * Visual card preset.
   */
  variant?: "plain" | "card" | "compact";
  /**
   * Media frame aspect ratio preset.
   */
  imageRatio?: "square" | "portrait" | "landscape" | "wide";
  /**
   * Responsive image sizes passed to the Image primitive.
   */
  imageSizes?: string;
  /**
   * Controls whether product price is rendered.
   */
  showPrice?: boolean;
  /**
   * Controls whether compare-at price is rendered when available.
   */
  showCompareAt?: boolean;
  /**
   * Controls whether product description is rendered.
   */
  showDescription?: boolean;
  /**
   * Controls whether the sale badge is rendered when the product is on sale.
   */
  showSaleBadge?: boolean;
  /**
   * Text rendered inside the sale badge.
   */
  saleLabel?: string;
}

export function ProductCard({
  product,
  className,
  mediaClassName,
  imageClassName,
  contentClassName,
  nameClassName,
  priceGroupClassName,
  priceClassName,
  compareAtClassName,
  descriptionClassName,
  badgeClassName,
  imageIndex = 0,
  variant = "plain",
  imageRatio = "square",
  imageSizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  showPrice = true,
  showCompareAt = true,
  showDescription = false,
  showSaleBadge = true,
  saleLabel = "Sale",
}: ProductCardProps) {
  const image = getProductImage(product, imageIndex);
  const price = getProductPrice(product);
  const href = `/products/${product.slug ?? product.id ?? ""}`;

  return (
    <Link
      data-slot="product-card"
      to={href}
      className={cn(
        "group flex min-w-0 flex-col text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        productCardVariantClassName[variant],
        className,
      )}
    >
      <div
        data-slot="product-card-media"
        className={cn(
          "relative isolate overflow-hidden bg-muted",
          productCardMediaVariantClassName[variant],
          productCardRatioClassName[imageRatio],
          mediaClassName,
        )}
      >
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            sizes={imageSizes}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]",
              imageClassName,
            )}
          />
        )}
        {showSaleBadge && price.onSale && (
          <Badge
            data-slot="product-card-badge"
            className={cn("absolute top-3 left-3", badgeClassName)}
          >
            {saleLabel}
          </Badge>
        )}
      </div>

      <div
        data-slot="product-card-content"
        className={cn("grid gap-1", productCardContentVariantClassName[variant], contentClassName)}
      >
        <Heading
          level={3}
          className={cn("font-heading text-base leading-snug font-medium", nameClassName)}
        >
          {product.name}
        </Heading>

        {showDescription && product.description && (
          <Text className={cn("line-clamp-2 text-sm text-muted-foreground", descriptionClassName)}>
            {stripMarkup(product.description)}
          </Text>
        )}

        {showPrice && price.current !== null && (
          <div className={cn("flex flex-wrap items-baseline gap-2", priceGroupClassName)}>
            <Text as="span" className={cn("text-sm font-medium", priceClassName)}>
              {formatPrice(price.current, price.currency)}
            </Text>
            {showCompareAt && price.compareAt !== null && (
              <Text
                as="span"
                className={cn("text-xs text-muted-foreground line-through", compareAtClassName)}
              >
                {formatPrice(price.compareAt, price.currency)}
              </Text>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

const productCardVariantClassName = {
  plain: "gap-3",
  card: "gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm",
  compact: "gap-2",
} as const;

const productCardMediaVariantClassName = {
  plain: "rounded-xl",
  card: "rounded-none",
  compact: "rounded-lg",
} as const;

const productCardContentVariantClassName = {
  plain: "",
  card: "p-4",
  compact: "",
} as const;

const productCardRatioClassName = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
} as const;

function formatPrice(amount: number, currency: string | null): string {
  if (!currency) return String(amount);

  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function stripMarkup(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
