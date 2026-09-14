import { useId } from "react";

import type { UseCurrencyResult } from "@/hooks";
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
 * Renders a currency selector wired to the current currency result.
 */
export interface LocalizationCurrencySelectorProps {
  /**
   * Complete result returned from useCurrency().
   */
  currency: UseCurrencyResult;
  /**
   * Styles the selector root.
   */
  className?: string;
  /**
   * Styles the label.
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
  /**
   * Controls whether each option shows the currency symbol before the code.
   */
  showSymbol?: boolean;
}

export function LocalizationCurrencySelector({
  currency,
  className,
  labelClassName,
  triggerClassName,
  label = "Currency",
  hideLabel = true,
  showSymbol = true,
}: LocalizationCurrencySelectorProps) {
  const selectId = useId();
  if (currency.available.length <= 1) return null;

  return (
    <div data-slot="localization-currency-selector" className={cn("grid gap-2", className)}>
      <Label htmlFor={selectId} className={cn(hideLabel && "sr-only", labelClassName)}>
        {label}
      </Label>
      <Select value={currency.code} onValueChange={(code) => void currency.setCurrency(code)}>
        <SelectTrigger id={selectId} className={triggerClassName}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {currency.available.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {showSymbol ? `${item.symbol} ${item.code}` : item.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
