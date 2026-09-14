import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product, ProductQuery, ResultsResponse } from "swell-js";

import { swell } from "@/lib/swell/client";
import { useStorefront } from "@/lib/swell/storefront";

import { stableQueryKey, useQuery } from "./query";
import { useCategories } from "./useCategories";
import { useCurrency } from "./useCurrency";

const DEFAULT_LIMIT = 24;
const FILTER_SAMPLE_LIMIT = 100;

export interface ProductSortOption {
  value: string;
  label: string;
  sort: string;
}

export const PRODUCT_SORT_OPTIONS: ProductSortOption[] = [
  { value: "featured", label: "Featured", sort: "" },
  { value: "newest", label: "Newest", sort: "date_created desc" },
  { value: "price_asc", label: "Price: low to high", sort: "price asc" },
  { value: "price_desc", label: "Price: high to low", sort: "price desc" },
];

export interface ProductFilterItem {
  label: string;
  value: string;
  active: boolean;
  toggle: () => void;
}

export interface ProductAttributeFilter {
  id: string;
  label: string;
  items: ProductFilterItem[];
}

export interface ProductPriceFilter {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  set: (value: [number, number]) => void;
  format: (amount: number) => string;
}

export interface UseProductsResult {
  products: Product[];
  count: number;
  query: ProductQuery;
  search: {
    value: string;
    set: (value: string) => void;
  };
  categories: ProductFilterItem[];
  price: ProductPriceFilter | null;
  attributes: ProductAttributeFilter[];
  sort: {
    value: string;
    options: Array<{ value: string; label: string }>;
    set: (value: string) => void;
  };
  pagination: {
    page: number;
    pageCount: number;
    limit: number;
    hasPrevious: boolean;
    hasNext: boolean;
    setPage: (page: number) => void;
  };
  activeFilterCount: number;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export type UseProductsOptions = ProductQuery & {
  sortOptions?: ProductSortOption[];
};

interface ProductQueryResult {
  products: Product[];
  count: number;
  page: number;
  pageCount: number;
  limit: number;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

interface RawFilter {
  id: string;
  label: string;
  type: "range" | "select";
  options: Array<{ value: string | number; label: string | number }>;
}

/**
 * Fetches and controls a product list with filters, search, sort, and pagination for product grids and product listing pages.
 */
export function useProducts(input: UseProductsOptions = {}): UseProductsResult {
  const { sortOptions = PRODUCT_SORT_OPTIONS, ...baseQuery } = input;
  const [searchParams, setSearchParams] = useSearchParams();
  const { format } = useCurrency();
  const categoriesQuery = useCategories();
  const filterSample = useProductQuery({
    ...baseQuery,
    page: 1,
    limit: FILTER_SAMPLE_LIMIT,
  });

  const defaultPage = positiveIntValue(baseQuery.page, 1);
  const defaultLimit = positiveIntValue(baseQuery.limit, DEFAULT_LIMIT);
  const page = positiveInt(searchParams.get("page"), defaultPage);
  const limit = positiveInt(searchParams.get("limit"), defaultLimit);
  const category = searchParams.get("category") ?? stringValue(baseQuery.category);
  const search = searchParams.get("search") ?? stringValue(baseQuery.search);
  const sortParam = searchParams.get("sort");
  const defaultSort = stringValue(baseQuery.sort);
  const defaultSortValue =
    sortOptions.find((option) => option.sort === defaultSort)?.value ?? sortOptions[0]?.value ?? "";
  const sortValue = sortParam ?? defaultSortValue;
  const sort = sortParam
    ? (sortOptions.find((option) => option.value === sortParam)?.sort ?? "")
    : defaultSort;
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";

  const rawFilters = useMemo(
    () => getProductFilters(filterSample.products),
    [filterSample.products],
  );
  const selectFilters = rawFilters.filter((filter) => filter.type === "select");
  const activeFilters = useMemo(() => {
    const filters: Record<string, unknown> = {
      ...(isRecord(baseQuery.$filters) ? baseQuery.$filters : {}),
    };
    if (minPrice || maxPrice) {
      filters.price = [minPrice ? Number(minPrice) : null, maxPrice ? Number(maxPrice) : null];
    }
    for (const filter of selectFilters) {
      const value = searchParams.get(filter.id);
      if (value) filters[filter.id] = value;
    }
    return filters;
  }, [baseQuery.$filters, maxPrice, minPrice, searchParams, selectFilters]);

  const query: ProductQuery = {
    ...baseQuery,
    limit,
    page,
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
    ...(sort ? { sort } : {}),
    ...(Object.keys(activeFilters).length > 0 ? { $filters: activeFilters } : {}),
  };
  const productsQuery = useProductQuery(query);

  const setParam = useCallback(
    (keyOrValues: string | Record<string, string>, value?: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("page");
        const values =
          typeof keyOrValues === "string" ? { [keyOrValues]: value ?? "" } : keyOrValues;
        for (const [key, nextValue] of Object.entries(values)) {
          if (nextValue) next.set(key, nextValue);
          else next.delete(key);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (nextPage <= 1) next.delete("page");
        else next.set("page", String(nextPage));
        return next;
      });
    },
    [setSearchParams],
  );

  const price = buildPriceFilter(rawFilters, minPrice, maxPrice, setParam, format);
  const categories = categoriesQuery.categories.map((item) => {
    const value = item.slug ?? "";
    return {
      label: item.name ?? value,
      value,
      active: category === value,
      toggle: () => setParam("category", category === value ? "" : value),
    };
  });
  const attributes = selectFilters.map((filter) => ({
    id: filter.id,
    label: filter.label,
    items: filter.options.map((option) => {
      const value = String(option.value);
      return {
        label: String(option.label),
        value,
        active: searchParams.get(filter.id) === value,
        toggle: () => setParam(filter.id, searchParams.get(filter.id) === value ? "" : value),
      };
    }),
  }));
  const activeFilterCount =
    (searchParams.has("category") ? 1 : 0) +
    (searchParams.has("search") ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    selectFilters.filter((filter) => searchParams.get(filter.id)).length;
  const pageCount = productsQuery.pageCount || 1;

  return {
    products: productsQuery.products,
    count: productsQuery.count,
    query,
    search: {
      value: search,
      set: (value) => setParam("search", value),
    },
    categories,
    price,
    attributes,
    sort: {
      value: sortValue,
      options: sortOptions.map(({ value, label }) => ({ value, label })),
      set: (value) => setParam("sort", value),
    },
    pagination: {
      page: productsQuery.page,
      pageCount,
      limit: productsQuery.limit,
      hasPrevious: productsQuery.page > 1,
      hasNext: productsQuery.page < pageCount,
      setPage,
    },
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
    clearFilters: () => setSearchParams(new URLSearchParams()),
    error: categoriesQuery.error ?? filterSample.error ?? productsQuery.error,
    isLoading: categoriesQuery.isLoading || filterSample.isLoading || productsQuery.isLoading,
    isFetching: categoriesQuery.isFetching || filterSample.isFetching || productsQuery.isFetching,
    refetch: async () => {
      await Promise.all([
        categoriesQuery.refetch(),
        filterSample.refetch(),
        productsQuery.refetch(),
      ]);
    },
  };
}

function useProductQuery(query: ProductQuery): ProductQueryResult {
  const { queryScope } = useStorefront();
  const key = queryScope ? `products|${queryScope}|${stableQueryKey(query)}` : "";
  const result = useQuery(
    key,
    async () => (await swell.products.list(query)) as ResultsResponse<Product>,
    { keepPreviousData: true },
  );

  return {
    products: result.data?.results ?? [],
    count: result.data?.count ?? 0,
    page: result.data?.page ?? positiveIntValue(query.page, 1),
    pageCount: result.data?.page_count ?? 0,
    limit: result.data?.limit ?? positiveIntValue(query.limit, 0),
    error: result.error,
    isLoading: !queryScope || result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
}

function getProductFilters(products: Product[]): RawFilter[] {
  if (products.length === 0) return [];

  const rawFilters = swell.products.filters(products) as RawFilter[];
  return mergeOptionFilters(rawFilters ?? [], products);
}

function buildPriceFilter(
  filters: RawFilter[],
  minPrice: string,
  maxPrice: string,
  setParam: (values: Record<string, string>) => void,
  format: (amount: number) => string,
): ProductPriceFilter | null {
  const price = filters.find((filter) => filter.id === "price" && filter.type === "range");
  if (!price) return null;
  const min = Number(price.options[0]?.value ?? 0);
  const max = Number(price.options[1]?.value ?? min);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;

  const value: [number, number] = [
    minPrice ? Number(minPrice) : min,
    maxPrice ? Number(maxPrice) : max,
  ];

  return {
    min,
    max,
    step: 1,
    value,
    set: ([low, high]) => setParam({ min: String(low), max: String(high) }),
    format,
  };
}

function mergeOptionFilters(rawFilters: RawFilter[], products: Product[]): RawFilter[] {
  const seen = new Set(rawFilters.map((filter) => filter.id));
  const derived = new Map<string, { label: string; values: Set<string> }>();

  for (const product of products) {
    for (const option of product.options ?? []) {
      if (!option.name || !option.values?.length) continue;
      const id = option.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      if (seen.has(id)) continue;
      const entry = derived.get(id) ?? { label: option.name, values: new Set<string>() };
      for (const value of option.values) {
        if (value.name) entry.values.add(value.name);
      }
      derived.set(id, entry);
    }
  }

  return [
    ...rawFilters,
    ...[...derived.entries()]
      .filter(([, entry]) => entry.values.size >= 2)
      .map(([id, entry]) => ({
        id,
        label: entry.label,
        type: "select" as const,
        options: [...entry.values].map((value) => ({ value, label: value })),
      })),
  ];
}

function positiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function positiveIntValue(raw: unknown, fallback: number): number {
  return typeof raw === "number" && Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
