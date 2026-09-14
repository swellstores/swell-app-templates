import type { UseCategoryResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/storefront/primitives";

/**
 * Renders the selected category description as trusted storefront HTML.
 */
export interface CategoryDescriptionProps {
  /**
   * Complete result returned from useCategory().
   */
  category: UseCategoryResult;
  /**
   * Styles the description wrapper.
   */
  className?: string;
  /**
   * Styles the loading skeleton.
   */
  loadingClassName?: string;
}

export function CategoryDescription({
  category,
  className,
  loadingClassName,
}: CategoryDescriptionProps) {
  if (category.isLoading) {
    return <Skeleton className={cn("h-20 w-full", loadingClassName)} />;
  }

  const description = category.category?.description;
  if (!description) return null;

  return (
    <div
      data-slot="category-description"
      className={cn("text-muted-foreground", className)}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}
