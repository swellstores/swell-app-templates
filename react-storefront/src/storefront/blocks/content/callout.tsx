import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Text } from "@/storefront/primitives";

/**
 * Renders a shaped floating callout — a short annotation in a blob, burst, or
 * pill container placed near a product or image. CSS-driven shape via
 * border-radius / clip-path; colour comes from token pairs. Use for playful
 * annotations ("new!", "hand-poured", a price shout) that should read as a
 * motif, not a plain label.
 */
export interface ContentCalloutProps {
  /**
   * Callout content (short text or small nodes).
   */
  children: ReactNode;
  /**
   * Container shape.
   */
  shape?: "blob" | "burst" | "pill";
  /**
   * Token colour pair for the container surface.
   */
  tone?: "primary" | "accent" | "secondary";
  /**
   * Optional tilt applied to the callout.
   */
  rotate?: "none" | "left" | "right";
  /**
   * Styles the callout root.
   */
  className?: string;
}

export function ContentCallout({
  children,
  shape = "blob",
  tone = "accent",
  rotate = "none",
  className,
}: ContentCalloutProps) {
  return (
    <span
      data-slot="content-callout"
      className={cn(
        "inline-flex max-w-52 items-center justify-center px-5 py-3 text-center text-sm font-medium leading-tight",
        calloutToneClassName[tone],
        calloutShapeClassName[shape],
        calloutRotateClassName[rotate],
        className,
      )}
      style={shape === "burst" ? burstStyle : undefined}
    >
      <Text as="span">{children}</Text>
    </span>
  );
}

// A 12-point starburst via clip-path polygon.
const burstStyle: CSSProperties = {
  clipPath:
    "polygon(50% 0%, 61% 12%, 76% 6%, 76% 22%, 92% 24%, 83% 38%, 100% 50%, 83% 62%, 92% 76%, 76% 78%, 76% 94%, 61% 88%, 50% 100%, 39% 88%, 24% 94%, 24% 78%, 8% 76%, 17% 62%, 0% 50%, 17% 38%, 8% 24%, 24% 22%, 24% 6%, 39% 12%)",
};

const calloutShapeClassName = {
  blob: "rounded-[46%_54%_58%_42%_/_58%_42%_58%_42%]",
  burst: "size-28 p-3",
  pill: "rounded-full",
} as const;

const calloutToneClassName = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
} as const;

const calloutRotateClassName = {
  none: "",
  left: "-rotate-6",
  right: "rotate-6",
} as const;
