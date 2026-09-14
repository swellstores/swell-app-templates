import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Text } from "@/storefront/primitives";

/**
 * Renders a pull quote, testimonial, or press quote.
 */
export interface ContentQuoteProps {
  /**
   * Quote body content.
   */
  quote: ReactNode;
  /**
   * Optional person or organization credited for the quote.
   */
  attribution?: ReactNode;
  /**
   * Optional source context such as role, publication, or company.
   */
  source?: ReactNode;
  /**
   * Optional citation URL passed to the blockquote cite attribute.
   */
  cite?: string;
  /**
   * Visual quote preset.
   */
  variant?: "editorial" | "card" | "minimal";
  /**
   * Quote typography scale.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Text alignment preset.
   */
  align?: "start" | "center" | "end";
  /**
   * Styles the quote figure root.
   */
  className?: string;
  /**
   * Styles the quote body text.
   */
  quoteClassName?: string;
  /**
   * Styles the attribution/source footer.
   */
  footerClassName?: string;
  /**
   * Styles the attribution text.
   */
  attributionClassName?: string;
  /**
   * Styles the source text.
   */
  sourceClassName?: string;
}

export function ContentQuote({
  quote,
  attribution,
  source,
  cite,
  variant = "editorial",
  size = "lg",
  align = "start",
  className,
  quoteClassName,
  footerClassName,
  attributionClassName,
  sourceClassName,
}: ContentQuoteProps) {
  return (
    <figure
      data-slot="content-quote"
      className={cn(
        "grid max-w-4xl gap-5",
        quoteVariantClassName[variant],
        quoteAlignClassName[align],
        className,
      )}
    >
      <blockquote cite={cite}>
        <Text
          className={cn(
            "font-heading leading-snug font-medium text-balance",
            quoteSizeClassName[size],
            quoteClassName,
          )}
        >
          {quote}
        </Text>
      </blockquote>
      {(attribution || source) && (
        <figcaption
          className={cn(
            "flex flex-wrap items-baseline gap-x-2 text-sm",
            align === "center" && "justify-center",
            align === "end" && "justify-end",
            footerClassName,
          )}
        >
          {attribution && (
            <Text as="span" className={cn("font-medium", attributionClassName)}>
              {attribution}
            </Text>
          )}
          {source && (
            <Text as="span" className={cn("text-muted-foreground", sourceClassName)}>
              {source}
            </Text>
          )}
        </figcaption>
      )}
    </figure>
  );
}

const quoteVariantClassName = {
  editorial: "border-l-2 pl-6",
  card: "rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm",
  minimal: "",
} as const;

const quoteSizeClassName = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
} as const;

const quoteAlignClassName = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const;
