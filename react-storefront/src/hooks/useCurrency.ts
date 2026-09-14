import { useMemo } from "react";
import type { EnabledCurrency } from "swell-js";

import { useStorefront } from "@/lib/swell/storefront";

export interface UseCurrencyResult {
  active: EnabledCurrency | null;
  code: string;
  available: EnabledCurrency[];
  setCurrency: (code: string) => Promise<void>;
  format: (amount: number) => string;
}

/**
 * Reads and updates the active storefront currency.
 */
export function useCurrency(): UseCurrencyResult {
  const { currency, currencies, locale, setCurrency } = useStorefront();

  return {
    active: currencies.find((item) => item.code === currency) ?? null,
    code: currency,
    available: currencies,
    setCurrency,
    format: useMemo(
      () => (amount: number) => formatCurrency(amount, currency, locale),
      [currency, locale],
    ),
  };
}

function formatCurrency(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  }
}
