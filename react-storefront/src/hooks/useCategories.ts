import type { Category, Query, ResultsResponse } from "swell-js";

import { swell } from "@/lib/swell/client";
import { useStorefront } from "@/lib/swell/storefront";

import { stableQueryKey, useQuery } from "./query";

export interface UseCategoriesResult {
  categories: Category[];
  count: number;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches multiple storefront categories for category grids, category indexes, navigation, and category-list sections.
 */
export function useCategories(query: Query = {}): UseCategoriesResult {
  const { queryScope } = useStorefront();
  const key = queryScope ? `categories|${queryScope}|${stableQueryKey(query)}` : "";

  const result = useQuery(
    key,
    async () => (await swell.categories.list(query)) as ResultsResponse<Category>,
    { keepPreviousData: true },
  );

  return {
    categories: result.data?.results ?? [],
    count: result.data?.count ?? 0,
    error: result.error,
    isLoading: !queryScope || result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
}
