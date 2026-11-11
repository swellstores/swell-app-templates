import { useCallback } from "react";
import type { Consent, ConsentInput } from "swell-js";

import { useStorefront } from "@/lib/swell/storefront";

export interface UseConsentResult {
  setConsent: (choice: ConsentInput) => Promise<Consent | null>;
}

/**
 * Passes the shopper's answers from the store's cookie banner or consent tool to Swell, which uses them for ad attribution: `marketing` (ad clicks and cookies), `analytics` (visits and UTM tags), `sale_of_data` (US privacy laws). Call `setConsent` when the shopper answers or changes an answer, and on load when the tool already holds one; purposes left out stay as they are. It shows no banner and doesn't control ad pixels. Resolves with the recorded consent, or null when the storefront isn't configured or the call failed.
 */
export function useConsent(): UseConsentResult {
  const { setConsent } = useStorefront();

  return {
    setConsent: useCallback(
      async (choice: ConsentInput) => {
        try {
          return await setConsent(choice);
        } catch (error) {
          console.warn("Consent not recorded", error);
          return null;
        }
      },
      [setConsent],
    ),
  };
}
