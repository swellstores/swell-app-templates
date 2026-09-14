import type { Category, Product, Query, ResultsResponse } from "swell-js";

import { swell } from "@/lib/swell/client";
import { useStorefront } from "@/lib/swell/storefront";

import { stableQueryKey, useQuery } from "./query";

export interface UseCategoryResult {
  category: Category | null;
  products: Product[];
  productCount: number;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches one storefront category by id or slug with its products expanded for category detail and featured category sections.
 */
export function useCategory(idOrSlug: string | undefined, query: Query = {}): UseCategoryResult {
  const { queryScope } = useStorefront();
  const expandedQuery = { expand: "products", ...query };
  const key =
    idOrSlug && queryScope
      ? `category|${idOrSlug}|${queryScope}|${stableQueryKey(expandedQuery)}`
      : "";

  const result = useQuery(key, async () => {
    const category = (await swell.categories.get(idOrSlug!, expandedQuery)) as CategoryWithProducts;
    const products = category.products?.results ?? [];
    const productCount = category.products?.count ?? products.length;
    const { products: _products, ...categoryDetails } = category;

    return {
      category: categoryDetails,
      products,
      productCount,
    };
  });

  return {
    category: result.data?.category ?? null,
    products: result.data?.products ?? [],
    productCount: result.data?.productCount ?? 0,
    error: result.error,
    isLoading: Boolean(idOrSlug) && (!queryScope || result.isLoading),
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
}

type CategoryWithProducts = Omit<Category, "products"> & {
  products?: ResultsResponse<Product>;
};
