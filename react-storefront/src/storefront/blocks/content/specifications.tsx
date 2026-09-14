import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Heading, type HeadingLevel } from "@/storefront/primitives";

/**
 * Renders a structured specification list for product, brand, or editorial details.
 */
export interface ContentSpecificationsProps {
  /**
   * Specification rows to render.
   */
  items: Array<{
    label: ReactNode;
    value: ReactNode;
  }>;
  /**
   * Optional heading rendered above the list.
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
   * Styles the definition list wrapper.
   */
  listClassName?: string;
  /**
   * Styles each specification row.
   */
  rowClassName?: string;
  /**
   * Styles each specification label.
   */
  labelClassName?: string;
  /**
   * Styles each specification value.
   */
  valueClassName?: string;
}

export function ContentSpecifications({
  items,
  title,
  level = 3,
  className,
  titleClassName,
  listClassName,
  rowClassName,
  labelClassName,
  valueClassName,
}: ContentSpecificationsProps) {
  if (items.length === 0) return null;

  return (
    <div data-slot="content-specifications" className={cn("grid gap-4", className)}>
      {title && (
        <Heading level={level} className={cn("font-heading text-lg font-medium", titleClassName)}>
          {title}
        </Heading>
      )}
      <dl className={cn("divide-y border-y", listClassName)}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn("grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 py-3", rowClassName)}
          >
            <dt className={cn("text-sm text-muted-foreground", labelClassName)}>{item.label}</dt>
            <dd className={cn("text-sm font-medium", valueClassName)}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
