import { useId } from "react";

import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@/storefront/primitives";

/**
 * Renders configurable product options and wires option changes back to useProduct().
 */
export interface ProductOptionsProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the options group root.
   */
  className?: string;
  /**
   * Styles each option row or field group.
   */
  optionClassName?: string;
  /**
   * Styles option labels.
   */
  labelClassName?: string;
  /**
   * Styles option controls such as select triggers, inputs, textareas, and switches.
   */
  controlClassName?: string;
}

export function ProductOptions({
  product,
  className,
  optionClassName,
  labelClassName,
  controlClassName,
}: ProductOptionsProps) {
  const idPrefix = useId();
  if (product.options.length === 0) return null;

  return (
    <div data-slot="product-options" className={cn("grid gap-5", className)}>
      {product.options.map((option) => {
        const inputId = `${idPrefix}-product-option-${option.id}`;

        if (option.type === "toggle") {
          return (
            <div
              key={option.id}
              data-slot="product-option"
              className={cn("flex items-center justify-between gap-4", optionClassName)}
            >
              <Label htmlFor={inputId} className={labelClassName}>
                {option.name}
              </Label>
              <Switch
                id={inputId}
                checked={option.active}
                onCheckedChange={option.setActive}
                className={controlClassName}
              />
            </div>
          );
        }

        if (option.type === "text") {
          const Control = option.multiline ? Textarea : Input;
          return (
            <div
              key={option.id}
              data-slot="product-option"
              className={cn("grid gap-2", optionClassName)}
            >
              <Label htmlFor={inputId} className={labelClassName}>
                {option.name}
              </Label>
              <Control
                id={inputId}
                value={option.value}
                placeholder={option.placeholder}
                onChange={(event) => option.setValue(event.currentTarget.value)}
                className={controlClassName}
              />
            </div>
          );
        }

        return (
          <div
            key={option.id}
            data-slot="product-option"
            className={cn("grid gap-2", optionClassName)}
          >
            <Label htmlFor={inputId} className={labelClassName}>
              {option.name}
            </Label>
            <Select value={option.value} onValueChange={option.setValue}>
              <SelectTrigger id={inputId} className={cn("w-full", controlClassName)}>
                <SelectValue placeholder={`Select ${option.name}`} />
              </SelectTrigger>
              <SelectContent>
                {option.values.map((value) => (
                  <SelectItem key={value.value} value={value.value}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
