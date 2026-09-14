import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import type { UseProductsResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/storefront/primitives";

/**
 * Renders pagination controls wired to a product list result.
 */
export interface ProductListPaginationProps {
  /**
   * Complete result returned from useProducts().
   */
  products: UseProductsResult;
  /**
   * Styles the pagination nav root.
   */
  className?: string;
  /**
   * Styles every pagination button.
   */
  buttonClassName?: string;
  /**
   * Styles the active page button.
   */
  activeButtonClassName?: string;
  /**
   * Styles ellipsis items between page buttons.
   */
  ellipsisClassName?: string;
  /**
   * Accessible label for the previous page button.
   */
  previousLabel?: string;
  /**
   * Accessible label for the next page button.
   */
  nextLabel?: string;
  /**
   * Number of neighboring pages shown around the current page.
   */
  siblingCount?: number;
}

export function ProductListPagination({
  products,
  className,
  buttonClassName,
  activeButtonClassName,
  ellipsisClassName,
  previousLabel = "Previous page",
  nextLabel = "Next page",
  siblingCount = 1,
}: ProductListPaginationProps) {
  const { pagination } = products;
  if (pagination.pageCount <= 1) return null;

  const items = getPageItems(pagination.page, pagination.pageCount, siblingCount);

  return (
    <nav
      data-slot="product-list-pagination"
      aria-label="Product pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={buttonClassName}
        disabled={!pagination.hasPrevious}
        onClick={() => pagination.setPage(pagination.page - 1)}
        aria-label={previousLabel}
      >
        <ChevronLeftIcon aria-hidden="true" />
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className={cn("flex size-8 items-center justify-center", ellipsisClassName)}
          >
            <MoreHorizontalIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === pagination.page ? "default" : "ghost"}
            size="icon"
            className={cn(buttonClassName, item === pagination.page && activeButtonClassName)}
            onClick={() => pagination.setPage(item)}
            aria-current={item === pagination.page ? "page" : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={buttonClassName}
        disabled={!pagination.hasNext}
        onClick={() => pagination.setPage(pagination.page + 1)}
        aria-label={nextLabel}
      >
        <ChevronRightIcon aria-hidden="true" />
      </Button>
    </nav>
  );
}

function getPageItems(
  current: number,
  pageCount: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  const visible = new Set([1, pageCount]);
  for (let page = current - siblingCount; page <= current + siblingCount; page += 1) {
    if (page > 1 && page < pageCount) visible.add(page);
  }

  const pages = [...visible].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  for (const page of pages) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && page - previous > 1) result.push("ellipsis");
    result.push(page);
  }
  return result;
}
