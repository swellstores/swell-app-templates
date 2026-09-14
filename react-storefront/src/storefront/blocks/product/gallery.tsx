import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, Image, Skeleton } from "@/storefront/primitives";

/**
 * Renders an interactive product media gallery with optional controls and thumbnails.
 */
export interface ProductGalleryProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the gallery root.
   */
  className?: string;
  /**
   * Styles the main image frame.
   */
  frameClassName?: string;
  /**
   * Styles the main image.
   */
  imageClassName?: string;
  /**
   * Styles the thumbnail list wrapper.
   */
  thumbnailsClassName?: string;
  /**
   * Styles each thumbnail button.
   */
  thumbnailClassName?: string;
  /**
   * Styles each thumbnail image.
   */
  thumbnailImageClassName?: string;
  /**
   * Styles the previous/next controls wrapper.
   */
  controlsClassName?: string;
  /**
   * Styles the previous and next control buttons.
   */
  controlButtonClassName?: string;
  /**
   * Controls whether previous/next image buttons are shown for multi-image products.
   */
  showControls?: boolean;
  /**
   * Controls whether thumbnail buttons are shown for multi-image products.
   */
  showThumbnails?: boolean;
  /**
   * Responsive image sizes passed to the main Image primitive.
   */
  sizes?: string;
  /**
   * Accessible label for the previous image button.
   */
  previousLabel?: string;
  /**
   * Accessible label for the next image button.
   */
  nextLabel?: string;
}

export function ProductGallery({
  product,
  className,
  frameClassName,
  imageClassName,
  thumbnailsClassName,
  thumbnailClassName,
  thumbnailImageClassName,
  controlsClassName,
  controlButtonClassName,
  showControls = true,
  showThumbnails = true,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  previousLabel = "Previous image",
  nextLabel = "Next image",
}: ProductGalleryProps) {
  const { gallery, isLoading } = product;

  if (isLoading) {
    return (
      <div data-slot="product-gallery" className={cn("w-full", className)}>
        <Skeleton className={cn("aspect-square w-full rounded-xl", frameClassName)} />
      </div>
    );
  }

  if (!gallery.activeImage) return null;

  const hasMultipleImages = gallery.images.length > 1;

  return (
    <div data-slot="product-gallery" className={cn("w-full space-y-3", className)}>
      <div
        data-slot="product-gallery-frame"
        className={cn("group relative isolate overflow-hidden rounded-xl bg-muted", frameClassName)}
      >
        <Image
          src={gallery.activeImage.url}
          alt={gallery.activeImage.alt}
          width={gallery.activeImage.width}
          height={gallery.activeImage.height}
          sizes={sizes}
          className={cn("aspect-square h-full w-full object-cover", imageClassName)}
        />

        {showControls && hasMultipleImages && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between",
              controlsClassName,
            )}
          >
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className={cn("pointer-events-auto rounded-full shadow-sm", controlButtonClassName)}
              onClick={gallery.previous}
              aria-label={previousLabel}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className={cn("pointer-events-auto rounded-full shadow-sm", controlButtonClassName)}
              onClick={gallery.next}
              aria-label={nextLabel}
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      {showThumbnails && hasMultipleImages && (
        <div
          data-slot="product-gallery-thumbnails"
          className={cn("flex gap-2 overflow-x-auto pb-1", thumbnailsClassName)}
        >
          {gallery.images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-current={gallery.activeIndex === index ? "true" : undefined}
              onClick={() => gallery.setActiveIndex(index)}
              className={cn(
                "shrink-0 overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-current:border-foreground",
                thumbnailClassName,
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className={cn("size-16 object-cover sm:size-20", thumbnailImageClassName)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
