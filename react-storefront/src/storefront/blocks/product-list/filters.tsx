import { useEffect, useId, useState, type ReactNode } from "react";

import type { UseProductsResult } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Label,
  Slider,
  Text,
} from "@/storefront/primitives";

/**
 * Renders category, price, and attribute filters wired to a product list result.
 */
export interface ProductListFiltersProps {
  /**
   * Complete result returned from useProducts().
   */
  products: UseProductsResult;
  /**
   * Styles the filters root.
   */
  className?: string;
  /**
   * Styles each accordion filter group.
   */
  groupClassName?: string;
  /**
   * Styles each accordion trigger.
   */
  triggerClassName?: string;
  /**
   * Styles each checkbox filter option row.
   */
  optionClassName?: string;
  /**
   * Styles the filter heading text.
   */
  titleClassName?: string;
  /**
   * Styles the clear-filters button.
   */
  clearButtonClassName?: string;
  /**
   * Visual filter container preset.
   */
  variant?: "panel" | "plain" | "bar";
  /**
   * Vertical spacing density.
   */
  density?: "compact" | "comfortable";
  /**
   * Heading text shown above the filter groups.
   */
  title?: string;
  /**
   * Label for the category filter group.
   */
  categoriesLabel?: string;
  /**
   * Label for the price filter group.
   */
  priceLabel?: string;
  /**
   * Label for the clear-filters action.
   */
  clearLabel?: string;
  /**
   * Controls whether the filter heading row is rendered.
   */
  showTitle?: boolean;
}

export function ProductListFilters({
  products,
  className,
  groupClassName,
  triggerClassName,
  optionClassName,
  titleClassName,
  clearButtonClassName,
  variant = "panel",
  density = "comfortable",
  title = "Filters",
  categoriesLabel = "Categories",
  priceLabel = "Price",
  clearLabel = "Clear",
  showTitle = true,
}: ProductListFiltersProps) {
  const idPrefix = useId();
  const hasFilters =
    products.categories.length > 0 || products.attributes.length > 0 || products.price !== null;

  if (!hasFilters) return null;

  return (
    <aside
      data-slot="product-list-filters"
      className={cn(
        "h-fit",
        filterVariantClassName[variant],
        filterDensityClassName[density],
        className,
      )}
    >
      {showTitle && (
        <div className="flex items-center justify-between gap-4">
          <Text className={cn("font-medium", titleClassName)}>{title}</Text>
          {products.hasActiveFilters && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className={clearButtonClassName}
              onClick={products.clearFilters}
            >
              {clearLabel}
            </Button>
          )}
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={["categories", "price"]}
        className={variant === "bar" ? "gap-3 sm:flex-row sm:flex-wrap" : undefined}
      >
        {products.categories.length > 0 && (
          <FilterGroup
            value="categories"
            label={categoriesLabel}
            className={groupClassName}
            triggerClassName={triggerClassName}
          >
            <div className="grid gap-3">
              {products.categories.map((item) => (
                <FilterOption
                  key={item.value}
                  item={item}
                  idPrefix={idPrefix}
                  className={optionClassName}
                />
              ))}
            </div>
          </FilterGroup>
        )}

        {products.price && (
          <FilterGroup
            value="price"
            label={priceLabel}
            className={groupClassName}
            triggerClassName={triggerClassName}
          >
            <PriceFilterControl price={products.price} />
          </FilterGroup>
        )}

        {products.attributes.map((attribute) => (
          <FilterGroup
            key={attribute.id}
            value={attribute.id}
            label={attribute.label}
            className={groupClassName}
            triggerClassName={triggerClassName}
          >
            <div className="grid gap-3">
              {attribute.items.map((item) => (
                <FilterOption
                  key={item.value}
                  item={item}
                  idPrefix={`${idPrefix}-${attribute.id}`}
                  className={optionClassName}
                />
              ))}
            </div>
          </FilterGroup>
        ))}
      </Accordion>
    </aside>
  );
}

const filterVariantClassName = {
  panel: "rounded-2xl border border-border/70 bg-card/60 p-4",
  plain: "",
  bar: "rounded-2xl border border-border/70 bg-card/60 p-3",
} as const;

const filterDensityClassName = {
  compact: "grid gap-2",
  comfortable: "grid gap-4",
} as const;

interface FilterGroupProps {
  value: string;
  label: string;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
}

function FilterGroup({ value, label, children, className, triggerClassName }: FilterGroupProps) {
  return (
    <AccordionItem value={value} className={className}>
      <AccordionTrigger className={triggerClassName}>{label}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

interface FilterOptionProps {
  item: UseProductsResult["categories"][number];
  idPrefix: string;
  className?: string;
}

function FilterOption({ item, idPrefix, className }: FilterOptionProps) {
  const id = `${idPrefix}-product-filter-${item.value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <Label htmlFor={id} className={cn("cursor-pointer justify-between", className)}>
      <span>{item.label}</span>
      <Checkbox id={id} checked={item.active} onCheckedChange={item.toggle} />
    </Label>
  );
}

function PriceFilterControl({ price }: { price: NonNullable<UseProductsResult["price"]> }) {
  const [value, setValue] = useState<[number, number]>(price.value);

  useEffect(() => {
    setValue(price.value);
  }, [price.value[0], price.value[1]]);

  return (
    <>
      <Slider
        min={price.min}
        max={price.max}
        step={price.step}
        value={value}
        onValueChange={(next) => setValue(next as [number, number])}
        onValueCommit={(next) => price.set(next as [number, number])}
      />
      <div className="mt-3 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{price.format(value[0])}</span>
        <span>{price.format(value[1])}</span>
      </div>
    </>
  );
}
