import type { Category } from "swell-js";

import { getCategoryHref, getCategoryImage, stripCategoryMarkup } from "@/lib/swell/category";
import { cn } from "@/lib/utils";
import { Heading, Image, Link, Text } from "@/storefront/primitives";

/**
 * Renders a linked category card for category grids, navigation features, and collection indexes.
 */
export interface CategoryCardProps {
  /**
   * Category entity from useCategories().categories or another category collection.
   */
  category: Category;
  /**
   * Styles the card link root.
   */
  className?: string;
  /**
   * Styles the media frame.
   */
  mediaClassName?: string;
  /**
   * Styles the category image.
   */
  imageClassName?: string;
  /**
   * Styles the text content wrapper.
   */
  contentClassName?: string;
  /**
   * Styles the category name heading.
   */
  nameClassName?: string;
  /**
   * Styles the optional category description text.
   */
  descriptionClassName?: string;
  /**
   * Responsive image sizes passed to the Image primitive.
   */
  imageSizes?: string;
  /**
   * Controls whether category image is rendered.
   */
  showImage?: boolean;
  /**
   * Controls whether category description is rendered.
   */
  showDescription?: boolean;
}

export function CategoryCard({
  category,
  className,
  mediaClassName,
  imageClassName,
  contentClassName,
  nameClassName,
  descriptionClassName,
  imageSizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  showImage = true,
  showDescription = false,
}: CategoryCardProps) {
  const image = getCategoryImage(category);
  const href = getCategoryHref(category);

  return (
    <Link
      data-slot="category-card"
      to={href}
      className={cn(
        "group flex min-w-0 flex-col gap-3 text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {showImage && image && (
        <div
          data-slot="category-card-media"
          className={cn(
            "relative isolate aspect-[4/3] overflow-hidden rounded-xl bg-muted",
            mediaClassName,
          )}
        >
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
        </div>
      )}

      <div data-slot="category-card-content" className={cn("grid gap-1", contentClassName)}>
        <Heading
          level={3}
          className={cn("font-heading text-base leading-snug font-medium", nameClassName)}
        >
          {category.name}
        </Heading>

        {showDescription && category.description && (
          <Text className={cn("line-clamp-2 text-sm text-muted-foreground", descriptionClassName)}>
            {stripCategoryMarkup(category.description)}
          </Text>
        )}
      </div>
    </Link>
  );
}
