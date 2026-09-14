import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Image, Text } from "@/storefront/primitives";

/**
 * Renders editorial or promotional media with an optional caption.
 */
export interface ContentMediaProps {
  /**
   * Image source URL.
   */
  src: string;
  /**
   * Accessible image alternative text.
   */
  alt: string;
  /**
   * Optional caption rendered below the image.
   */
  caption?: ReactNode;
  /**
   * Intrinsic image width passed to the Image primitive.
   */
  width?: number;
  /**
   * Intrinsic image height passed to the Image primitive.
   */
  height?: number;
  /**
   * Responsive image sizes passed to the Image primitive.
   */
  sizes?: string;
  /**
   * Native image loading strategy.
   */
  loading?: "eager" | "lazy";
  /**
   * Styles the figure root.
   */
  className?: string;
  /**
   * Styles the image frame.
   */
  frameClassName?: string;
  /**
   * Styles the image element.
   */
  imageClassName?: string;
  /**
   * Styles the caption text.
   */
  captionClassName?: string;
}

export function ContentMedia({
  src,
  alt,
  caption,
  width,
  height,
  sizes = "100vw",
  loading = "lazy",
  className,
  frameClassName,
  imageClassName,
  captionClassName,
}: ContentMediaProps) {
  return (
    <figure data-slot="content-media" className={cn("grid gap-2", className)}>
      <div className={cn("overflow-hidden rounded-xl bg-muted", frameClassName)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={loading}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      </div>
      {caption && (
        <Text
          as="span"
          className={cn("text-xs leading-relaxed text-muted-foreground", captionClassName)}
        >
          {caption}
        </Text>
      )}
    </figure>
  );
}
