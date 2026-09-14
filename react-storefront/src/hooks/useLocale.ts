import type { Locale } from "swell-js";

import { useStorefront } from "@/lib/swell/storefront";

export interface UseLocaleResult {
  active: Locale | null;
  code: string;
  available: Locale[];
  setLocale: (code: string) => Promise<void>;
}

/**
 * Reads and updates the active storefront locale.
 */
export function useLocale(): UseLocaleResult {
  const { locale, locales, setLocale } = useStorefront();

  return {
    active: locales.find((item) => item.code === locale) ?? null,
    code: locale,
    available: locales,
    setLocale,
  };
}
