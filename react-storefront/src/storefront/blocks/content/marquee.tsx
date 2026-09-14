import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a horizontally scrolling marquee / ticker band that repeats its
 * content in a seamless loop. CSS-driven animation; honors prefers-reduced-
 * motion (the band renders static, without scrolling, when reduced motion is
 * requested).
 */
export interface ContentMarqueeProps {
  /**
   * Items rendered in sequence and repeated across the band (words, phrases, or
   * small nodes).
   */
  items: ReactNode[];
  /**
   * Optional node rendered between items as a separator (e.g. a dot or slash).
   */
  separator?: ReactNode;
  /**
   * Scroll speed preset.
   */
  speed?: "slow" | "default" | "fast";
  /**
   * Scroll direction.
   */
  direction?: "left" | "right";
  /**
   * Visual band preset. "plain" scrolls on the page ground; "band" fills a
   * full-width inverted surface.
   */
  variant?: "plain" | "band";
  /**
   * Pause the scroll while the pointer is over the band.
   */
  pauseOnHover?: boolean;
  /**
   * Styles the marquee root (the clipping band).
   */
  className?: string;
  /**
   * Styles each rendered item.
   */
  itemClassName?: string;
  /**
   * Styles the separator between items.
   */
  separatorClassName?: string;
}

export function ContentMarquee({
  items,
  separator,
  speed = "default",
  direction = "left",
  variant = "plain",
  pauseOnHover = false,
  className,
  itemClassName,
  separatorClassName,
}: ContentMarqueeProps) {
  const sequence = items.map((item, index) => (
    <span key={index} className="flex items-center">
      {index > 0 && separator !== undefined && (
        <span aria-hidden className={cn("px-4 opacity-60", separatorClassName)}>
          {separator}
        </span>
      )}
      <span className={cn("whitespace-nowrap", itemClassName)}>{item}</span>
    </span>
  ));

  const rowClassName = "flex shrink-0 items-center gap-4 pr-4";

  return (
    <div
      data-slot="content-marquee"
      className={cn(
        "group relative flex w-full overflow-hidden",
        marqueeVariantClassName[variant],
        className,
      )}
    >
      {/* One track carrying two copies scrolls -50% for a seamless loop. The
          animation lives on the track; the second copy is decorative and is
          hidden when motion is reduced, leaving a single static row. */}
      <div
        className={cn(
          "flex w-max animate-marquee motion-reduce:animate-none",
          direction === "right" && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": marqueeDuration[speed] } as CSSProperties}
      >
        <div className={rowClassName}>{sequence}</div>
        <div aria-hidden className={cn(rowClassName, "motion-reduce:hidden")}>
          {sequence}
        </div>
      </div>
    </div>
  );
}

const marqueeVariantClassName = {
  plain: "py-3",
  band: "bg-foreground py-3 font-heading text-background",
} as const;

const marqueeDuration = {
  slow: "48s",
  default: "30s",
  fast: "18s",
} as const;
