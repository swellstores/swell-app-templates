import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Heading, Link, Text, type HeadingLevel } from "@/storefront/primitives";

/**
 * Renders a collection index — a stack of label rows each separated by a
 * hairline rule, with an optional trailing count or meta value (the
 * footer-style index of categories or collections). Rows link when an href is
 * provided. Use for editorial catalog indexes and footer navigation columns.
 */
export interface ContentEditorialIndexProps {
  /**
   * Index rows to render.
   */
  items: Array<{
    /**
     * Row label content.
     */
    label: ReactNode;
    /**
     * Optional trailing value, such as a product count or year.
     */
    count?: ReactNode;
    /**
     * Optional route or URL; the row renders as a link when provided.
     */
    href?: string;
  }>;
  /**
   * Optional heading rendered above the index.
   */
  title?: ReactNode;
  /**
   * Semantic heading level used when title is provided.
   */
  level?: HeadingLevel;
  /**
   * Styles the block root.
   */
  className?: string;
  /**
   * Styles the optional title heading.
   */
  titleClassName?: string;
  /**
   * Styles the index list wrapper.
   */
  listClassName?: string;
  /**
   * Styles each index row.
   */
  rowClassName?: string;
  /**
   * Styles each row label.
   */
  labelClassName?: string;
  /**
   * Styles each trailing count value.
   */
  countClassName?: string;
}

export function ContentEditorialIndex({
  items,
  title,
  level = 2,
  className,
  titleClassName,
  listClassName,
  rowClassName,
  labelClassName,
  countClassName,
}: ContentEditorialIndexProps) {
  return (
    <div data-slot="content-editorial-index" className={cn("grid gap-4", className)}>
      {title && (
        <Heading
          level={level}
          className={cn(
            "font-heading text-xs uppercase tracking-wide text-muted-foreground",
            titleClassName,
          )}
        >
          {title}
        </Heading>
      )}
      <ul className={cn("grid", listClassName)}>
        {items.map((item, index) => {
          const label = (
            <Text as="span" className={cn("font-heading text-lg", labelClassName)}>
              {item.label}
            </Text>
          );
          return (
            <li
              key={index}
              className={cn(
                "flex items-baseline justify-between gap-4 border-b border-border py-4",
                rowClassName,
              )}
            >
              {item.href ? (
                <Link to={item.href} className="underline-offset-4 hover:underline">
                  {label}
                </Link>
              ) : (
                label
              )}
              {item.count !== undefined && (
                <Text
                  as="span"
                  className={cn(
                    "font-mono text-sm text-muted-foreground",
                    countClassName,
                  )}
                >
                  {item.count}
                </Text>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
