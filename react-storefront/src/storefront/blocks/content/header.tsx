import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Heading, Text, type HeadingLevel } from "@/storefront/primitives";

/**
 * Renders reusable section header content with optional eyebrow and description.
 */
export interface ContentHeaderProps {
  /**
   * Main heading content.
   */
  title: ReactNode;
  /**
   * Optional short label rendered above the title.
   */
  eyebrow?: ReactNode;
  /**
   * Optional supporting copy rendered below the title.
   */
  description?: ReactNode;
  /**
   * Semantic heading level passed to the Heading primitive.
   */
  level?: HeadingLevel;
  /**
   * Preset typography scale for the header.
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Text alignment preset.
   */
  align?: "start" | "center" | "end";
  /**
   * Styles the header root.
   */
  className?: string;
  /**
   * Styles the eyebrow text.
   */
  eyebrowClassName?: string;
  /**
   * Styles the title heading.
   */
  titleClassName?: string;
  /**
   * Styles the description text.
   */
  descriptionClassName?: string;
}

export function ContentHeader({
  title,
  eyebrow,
  description,
  level = 2,
  size = "lg",
  align = "start",
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
}: ContentHeaderProps) {
  return (
    <header
      data-slot="content-header"
      className={cn("grid max-w-3xl gap-3", headerAlignClassName[align], className)}
    >
      {eyebrow && (
        <Text
          as="span"
          className={cn(
            "text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase",
            eyebrowClassName,
          )}
        >
          {eyebrow}
        </Text>
      )}
      <Heading
        level={level}
        className={cn(
          "font-heading leading-tight font-medium text-balance",
          headerSizeClassName[size],
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {description && (
        <Text
          className={cn(
            "max-w-2xl leading-relaxed text-muted-foreground",
            align === "center" && "mx-auto",
            align === "end" && "ml-auto",
            descriptionClassName,
          )}
        >
          {description}
        </Text>
      )}
    </header>
  );
}

const headerSizeClassName = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-3xl sm:text-4xl",
  xl: "text-4xl sm:text-5xl lg:text-6xl",
} as const;

const headerAlignClassName = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const;
