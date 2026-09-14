import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EnabledCurrency, Locale } from "swell-js";

import { initializeSwell, readSwellConfig, swell, type SwellConfig } from "./client";
import { normalizeMenus, type ResolvedMenu } from "./menu";

export type StorefrontStatus = "loading" | "ready" | "unconfigured" | "error";

interface StorefrontState {
  status: StorefrontStatus;
  error: Error | null;
  currency: string;
  currencies: EnabledCurrency[];
  locale: string;
  locales: Locale[];
  menus: Record<string, ResolvedMenu>;
}

interface StorefrontContextValue extends StorefrontState {
  queryScope: string;
  refresh: () => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
  setLocale: (code: string) => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

async function loadStorefrontState(): Promise<Omit<StorefrontState, "status" | "error">> {
  await swell.settings.load();

  const [currencies, locales] = await Promise.all([
    Promise.resolve(swell.currency.list()),
    Promise.resolve(swell.locale.list()),
  ]);

  const menuState = (swell.settings as typeof swell.settings & { menuState?: unknown }).menuState;

  return {
    currency: swell.currency.selected() || currencies[0]?.code || "",
    currencies,
    locale: swell.locale.selected() || locales[0]?.code || "",
    locales,
    menus: normalizeMenus(menuState),
  };
}

export interface StorefrontProviderProps {
  children: ReactNode;
  config?: SwellConfig | null;
}

export function StorefrontProvider({ children, config }: StorefrontProviderProps) {
  const resolvedConfig = config === undefined ? readSwellConfig() : config;
  const [state, setState] = useState<StorefrontState>(() => ({
    status: resolvedConfig ? "loading" : "unconfigured",
    error: null,
    currency: "",
    currencies: [],
    locale: "",
    locales: [],
    menus: {},
  }));

  const refresh = useCallback(async () => {
    if (!resolvedConfig) {
      setState((current) => ({
        ...current,
        status: "unconfigured",
        error: null,
      }));
      return;
    }

    initializeSwell(resolvedConfig);
    setState((current) => ({ ...current, status: "loading", error: null }));

    try {
      const next = await loadStorefrontState();
      setState({ ...next, status: "ready", error: null });
    } catch (cause) {
      setState((current) => ({
        ...current,
        status: "error",
        error: toError(cause),
      }));
    }
  }, [
    resolvedConfig?.publicKey,
    resolvedConfig?.storeId,
    resolvedConfig?.url,
    resolvedConfig?.vaultUrl,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setCurrency = useCallback(async (code: string) => {
    await swell.currency.select(code);
    setState((current) => ({ ...current, currency: code }));
  }, []);

  const setLocale = useCallback(async (code: string) => {
    await swell.locale.select(code);
    await swell.settings.load();

    const menuState = (swell.settings as typeof swell.settings & { menuState?: unknown }).menuState;

    setState((current) => ({
      ...current,
      locale: code,
      menus: normalizeMenus(menuState),
    }));
  }, []);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      ...state,
      queryScope: state.status === "ready" ? `${state.currency}|${state.locale}` : "",
      refresh,
      setCurrency,
      setLocale,
    }),
    [refresh, setCurrency, setLocale, state],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): StorefrontContextValue {
  const value = useContext(StorefrontContext);
  if (!value) {
    throw new Error("useStorefront must be used inside <StorefrontProvider>.");
  }
  return value;
}
