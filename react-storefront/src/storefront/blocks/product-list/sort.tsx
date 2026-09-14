import { useId } from "react";

import type { UseProductsResult } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/storefront/primitives";

/**
 * Renders a sort selector wired to a product list result.
 */
export interface ProductListSortProps {
  /**
   * Complete result returned from useProducts().
   */
  products: UseProductsResult;
  /**
   * Styles the sort control root.
   */
  className?: string;
  /**
   * Styles the sort label.
   */
  labelClassName?: string;
  /**
   * Styles the select trigger.
   */
  triggerClassName?: string;
  /**
   * Label and select placeholder text.
   */
  label?: string;
  /**
   * Controls whether the label is visually hidden.
   */
  hideLabel?: boolean;
}

export function ProductListSort({
  products,
  className,
  labelClassName,
  triggerClassName,
  label = "Sort by",
  hideLabel = false,
}: ProductListSortProps) {
  const selectId = useId();
  if (products.sort.options.length === 0) return null;

  return (
    <div data-slot="product-list-sort" className={cn("flex items-center gap-2", className)}>
      <Label htmlFor={selectId} className={cn(hideLabel && "sr-only", labelClassName)}>
        {label}
      </Label>
      <Select value={products.sort.value} onValueChange={products.sort.set}>
        <SelectTrigger id={selectId} className={triggerClassName}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent align="end">
          {products.sort.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
