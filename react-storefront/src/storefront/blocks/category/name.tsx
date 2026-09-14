import type { UseCategoryResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Heading, Skeleton, type HeadingLevel } from "@/storefront/primitives";

/**
 * Renders the selected category name as a heading.
 */
export interface CategoryNameProps {
  /**
   * Complete result returned from useCategory().
   */
  category: UseCategoryResult;
  /**
   * Semantic heading level passed to the Heading primitive.
   */
  level?: HeadingLevel;
  /**
   * Styles the heading.
   */
  className?: string;
  /**
   * Styles the loading skeleton.
   */
  loadingClassName?: string;
  /**
   * Optional text used when the category name is unavailable.
   */
  fallback?: string;
}

export function CategoryName({
  category,
  level = 1,
  className,
  loadingClassName,
  fallback,
}: CategoryNameProps) {
  if (category.isLoading) {
    return <Skeleton className={cn("h-10 w-3/4", loadingClassName)} />;
  }

  const name = category.category?.name ?? fallback;
  if (!name) return null;

  return (
    <Heading
      data-slot="category-name"
      level={level}
      className={cn("font-heading text-3xl leading-tight font-medium text-balance", className)}
    >
      {name}
    </Heading>
  );
}
