import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Image, Text } from "@/storefront/primitives";

/**
 * Renders content imagery clipped to a decorative shape (scalloped, cloud, or
 * arched). CSS-driven via mask/border-radius; degrades to a plain rectangle
 * where the mask is unsupported. Use for playful or editorial lifestyle
 * imagery that should not read as a hard rectangular crop.
 */
export interface ContentImageMaskProps {
  /**
   * Image source URL.
   */
  src: string;
  /**
   * Accessible image alternative text.
   */
  alt: string;
  /**
   * Decorative shape the image is clipped to.
   */
  shape?: "scallop" | "cloud" | "arch";
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
   * Styles the masked image frame.
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

export function ContentImageMask({
  src,
  alt,
  shape = "scallop",
  caption,
  width,
  height,
  sizes = "100vw",
  loading = "lazy",
  className,
  frameClassName,
  imageClassName,
  captionClassName,
}: ContentImageMaskProps) {
  return (
    <figure data-slot="content-image-mask" className={cn("grid gap-2", className)}>
      <div
        className={cn(
          "overflow-hidden bg-muted",
          maskShapeClassName[shape],
          frameClassName,
        )}
        style={maskShapeStyle[shape]}
      >
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
          className={cn(
            "text-xs leading-relaxed text-muted-foreground",
            captionClassName,
          )}
        >
          {caption}
        </Text>
      )}
    </figure>
  );
}

// A scalloped bottom edge: a repeat-x row of semicircle cut-outs across the
// bottom band, plus a solid fill for the rest. cloud/arch use border-radius.
const scallopMask =
  "radial-gradient(circle at 50% 0, transparent 9px, black 10px), linear-gradient(black, black)";
const scallopStyle: CSSProperties = {
  WebkitMaskImage: scallopMask,
  maskImage: scallopMask,
  WebkitMaskSize: "24px 24px, 100% calc(100% - 12px)",
  maskSize: "24px 24px, 100% calc(100% - 12px)",
  WebkitMaskPosition: "bottom, top",
  maskPosition: "bottom, top",
  WebkitMaskRepeat: "repeat-x, no-repeat",
  maskRepeat: "repeat-x, no-repeat",
};

const maskShapeStyle: Record<
  NonNullable<ContentImageMaskProps["shape"]>,
  CSSProperties | undefined
> = {
  scallop: scallopStyle,
  cloud: undefined,
  arch: undefined,
};

const maskShapeClassName = {
  scallop: "",
  cloud: "rounded-[42%_58%_63%_37%_/_45%_45%_55%_55%]",
  arch: "rounded-t-[50%] rounded-b-2xl",
} as const;
