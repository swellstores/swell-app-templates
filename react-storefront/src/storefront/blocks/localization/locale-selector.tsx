import { useId } from "react";

import type { UseLocaleResult } from "@/hooks";
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
 * Renders a locale selector wired to the current locale result.
 */
export interface LocalizationLocaleSelectorProps {
  /**
   * Complete result returned from useLocale().
   */
  locale: UseLocaleResult;
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
   * Controls whether each option shows the locale code after the locale name.
   */
  showCode?: boolean;
}

export function LocalizationLocaleSelector({
  locale,
  className,
  labelClassName,
  triggerClassName,
  label = "Language",
  hideLabel = true,
  showCode = false,
}: LocalizationLocaleSelectorProps) {
  const selectId = useId();
  if (locale.available.length <= 1) return null;

  return (
    <div data-slot="localization-locale-selector" className={cn("grid gap-2", className)}>
      <Label htmlFor={selectId} className={cn(hideLabel && "sr-only", labelClassName)}>
        {label}
      </Label>
      <Select value={locale.code} onValueChange={(code) => void locale.setLocale(code)}>
        <SelectTrigger id={selectId} className={triggerClassName}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {locale.available.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {showCode ? `${item.name} (${item.code})` : item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
