import type { UseCategoryResult } from "@/hooks";
import { getCategoryImage } from "@/lib/swell/category";
import { cn } from "@/lib/utils";
import { Image, Skeleton } from "@/storefront/primitives";

/**
 * Renders the selected category image.
 */
export interface CategoryImageProps {
  /**
   * Complete result returned from useCategory().
   */
  category: UseCategoryResult;
  /**
   * Styles the media frame.
   */
  className?: string;
  /**
   * Styles the image element.
   */
  imageClassName?: string;
  /**
   * Styles the loading skeleton.
   */
  loadingClassName?: string;
  /**
   * Responsive image sizes passed to the Image primitive.
   */
  imageSizes?: string;
}

export function CategoryImage({
  category,
  className,
  imageClassName,
  loadingClassName,
  imageSizes = "(min-width: 1024px) 50vw, 100vw",
}: CategoryImageProps) {
  if (category.isLoading) {
    return <Skeleton className={cn("aspect-[4/3] w-full rounded-xl", loadingClassName)} />;
  }

  const image = getCategoryImage(category.category);
  if (!image) return null;

  return (
    <div
      data-slot="category-image"
      className={cn("relative isolate aspect-[4/3] overflow-hidden rounded-xl bg-muted", className)}
    >
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={imageSizes}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </div>
  );
}
