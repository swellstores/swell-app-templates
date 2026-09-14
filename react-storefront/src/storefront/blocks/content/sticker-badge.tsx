import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Text } from "@/storefront/primitives";

/**
 * Renders a small sticker badge for product cards and imagery — a pill, star,
 * or seal carrying a short label ("new", "-20%", "bestseller"). CSS-driven
 * shape; colour from token pairs. Intended to be absolutely positioned by the
 * section over a card corner.
 */
export interface ContentStickerBadgeProps {
  /**
   * Badge label (short text or a small node).
   */
  label: ReactNode;
  /**
   * Badge shape.
   */
  shape?: "pill" | "star" | "seal";
  /**
   * Token colour pair for the badge surface.
   */
  tone?: "primary" | "accent" | "secondary";
  /**
   * Optional tilt applied to the badge.
   */
  rotate?: "none" | "left" | "right";
  /**
   * Styles the badge root.
   */
  className?: string;
}

export function ContentStickerBadge({
  label,
  shape = "pill",
  tone = "primary",
  rotate = "left",
  className,
}: ContentStickerBadgeProps) {
  return (
    <span
      data-slot="content-sticker-badge"
      className={cn(
        "inline-flex items-center justify-center text-center text-xs font-semibold uppercase tracking-wide shadow-sm",
        stickerToneClassName[tone],
        stickerShapeClassName[shape],
        stickerRotateClassName[rotate],
        className,
      )}
      style={shape === "star" ? starStyle : undefined}
    >
      <Text as="span">{label}</Text>
    </span>
  );
}

// A 10-point star via clip-path polygon.
const starStyle: CSSProperties = {
  clipPath:
    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
};

const stickerShapeClassName = {
  pill: "rounded-full px-3 py-1",
  star: "size-16 p-2",
  seal: "size-16 rounded-full p-2 leading-tight",
} as const;

const stickerToneClassName = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
} as const;

const stickerRotateClassName = {
  none: "",
  left: "-rotate-6",
  right: "rotate-6",
} as const;
