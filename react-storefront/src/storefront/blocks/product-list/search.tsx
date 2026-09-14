import { useEffect, useId, useState, type FormEvent } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import type { UseProductsResult } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, Input, Label } from "@/storefront/primitives";

/**
 * Renders a search form wired to a product list result.
 */
export interface ProductListSearchProps {
  /**
   * Complete result returned from useProducts().
   */
  products: UseProductsResult;
  /**
   * Styles the search form root.
   */
  className?: string;
  /**
   * Styles the visible or visually hidden label.
   */
  labelClassName?: string;
  /**
   * Styles the search input.
   */
  inputClassName?: string;
  /**
   * Styles the decorative search icon inside the field.
   */
  iconClassName?: string;
  /**
   * Styles the clear-search button.
   */
  clearButtonClassName?: string;
  /**
   * Styles the submit button.
   */
  submitButtonClassName?: string;
  /**
   * Applies search while the user types instead of waiting for form submit.
   */
  searchOnChange?: boolean;
  /**
   * Shows an explicit submit button inside the search field.
   */
  showSubmitButton?: boolean;
  /**
   * Accessible and optionally visible label for the search field.
   */
  label?: string;
  /**
   * Placeholder text for the search input.
   */
  placeholder?: string;
  /**
   * Accessible label for the submit button.
   */
  submitLabel?: string;
  /**
   * Accessible label for the clear-search button.
   */
  clearLabel?: string;
  /**
   * Controls whether the field label is visually hidden.
   */
  hideLabel?: boolean;
}

export function ProductListSearch({
  products,
  className,
  labelClassName,
  inputClassName,
  iconClassName,
  clearButtonClassName,
  submitButtonClassName,
  label = "Search products",
  placeholder = "Search products",
  submitLabel = "Search",
  clearLabel = "Clear search",
  searchOnChange = true,
  showSubmitButton = false,
  hideLabel = true,
}: ProductListSearchProps) {
  const inputId = useId();
  const [value, setValue] = useState(products.search.value);

  useEffect(() => {
    setValue(products.search.value);
  }, [products.search.value]);

  useEffect(() => {
    if (!searchOnChange) return;
    const nextValue = value.trim();
    if (nextValue === products.search.value) return;

    const timeoutId = window.setTimeout(() => {
      products.search.set(nextValue);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [products.search, products.search.value, searchOnChange, value]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    products.search.set(value.trim());
  };

  return (
    <form
      data-slot="product-list-search"
      role="search"
      onSubmit={submit}
      className={cn("grid gap-2", className)}
    >
      <Label htmlFor={inputId} className={cn(hideLabel && "sr-only", labelClassName)}>
        {label}
      </Label>
      <div className="relative flex items-center">
        <SearchIcon
          className={cn(
            "pointer-events-none absolute left-3 size-4 text-muted-foreground",
            iconClassName,
          )}
        />
        <Input
          id={inputId}
          type="text"
          inputMode="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.currentTarget.value)}
          className={cn(showSubmitButton && value ? "pr-20 pl-9" : "pr-9 pl-9", inputClassName)}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              showSubmitButton ? "absolute right-10" : "absolute right-1",
              clearButtonClassName,
            )}
            onClick={() => {
              setValue("");
              products.search.set("");
            }}
            aria-label={clearLabel}
          >
            <XIcon aria-hidden="true" />
          </Button>
        )}
        {showSubmitButton && (
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className={cn("absolute right-1", submitButtonClassName)}
            aria-label={submitLabel}
          >
            <SearchIcon className={iconClassName} aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
