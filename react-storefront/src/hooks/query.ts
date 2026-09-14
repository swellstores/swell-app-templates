import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

interface QueryEntry<T> {
  data: T | null;
  error: Error | null;
  promise: Promise<void> | null;
}

type Listener = () => void;

const cache = new Map<string, QueryEntry<unknown>>();
const listeners = new Map<string, Set<Listener>>();
const EMPTY_ENTRY: QueryEntry<unknown> = {
  data: null,
  error: null,
  promise: null,
};

function getEntry<T>(key: string): QueryEntry<T> {
  if (!key) return EMPTY_ENTRY as QueryEntry<T>;

  if (!cache.has(key)) {
    cache.set(key, { data: null, error: null, promise: null });
  }

  return cache.get(key) as QueryEntry<T>;
}

function notify(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

function setEntry<T>(key: string, patch: Partial<QueryEntry<T>>): void {
  cache.set(key, { ...getEntry<T>(key), ...patch });
  notify(key);
}

function subscribe(key: string, listener: Listener): () => void {
  if (!key) return () => undefined;
  if (!listeners.has(key)) listeners.set(key, new Set());

  listeners.get(key)?.add(listener);
  return () => listeners.get(key)?.delete(listener);
}

async function fetchQuery<T>(key: string, fetcher: () => Promise<T>, force = false): Promise<void> {
  const entry = getEntry<T>(key);
  if (entry.promise) return entry.promise;
  if (!force && entry.data !== null) return;

  const promise = (async () => {
    try {
      const data = await fetcher();
      setEntry<T>(key, { data, error: null, promise: null });
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      setEntry<T>(key, { error, promise: null });
    }
  })();

  setEntry<T>(key, { error: null, promise });
  return promise;
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

interface QueryOptions {
  keepPreviousData?: boolean;
}

export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: QueryOptions = {},
): QueryResult<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const entry = useSyncExternalStore(
    useCallback((listener) => subscribe(key, listener), [key]),
    useCallback(() => getEntry<T>(key), [key]),
    useCallback(() => getEntry<T>(key), [key]),
  );

  useEffect(() => {
    if (key) void fetchQuery(key, () => fetcherRef.current());
  }, [key]);

  const previousDataRef = useRef<T | null>(null);
  if (entry.data !== null) previousDataRef.current = entry.data;

  const showingPrevious =
    options.keepPreviousData === true &&
    entry.data === null &&
    previousDataRef.current !== null &&
    entry.promise !== null;

  return {
    data: showingPrevious ? previousDataRef.current : entry.data,
    error: entry.error,
    isLoading: Boolean(key) && entry.data === null && entry.error === null && !showingPrevious,
    isFetching: entry.promise !== null,
    refetch: () => (key ? fetchQuery(key, () => fetcherRef.current(), true) : Promise.resolve()),
  };
}

export function stableQueryKey(value: unknown): string {
  if (value === undefined) return "";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableQueryKey).join(",")}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableQueryKey(record[key])}`)
    .join(",")}}`;
}
