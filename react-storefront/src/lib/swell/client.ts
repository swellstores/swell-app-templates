import swell from "swell-js";

export interface SwellConfig {
  storeId: string;
  publicKey: string;
  url?: string;
  vaultUrl?: string;
}

declare global {
  interface Window {
    __SWELL__?: SwellConfig;
  }
}

let initializedWith: string | null = null;

export function readSwellConfig(): SwellConfig | null {
  const injected = typeof window === "undefined" ? undefined : window.__SWELL__;

  if (!injected?.storeId || !injected?.publicKey) return null;

  return {
    storeId: injected.storeId,
    publicKey: injected.publicKey,
    url: injected.url || undefined,
    vaultUrl: injected.vaultUrl || undefined,
  };
}

export function initializeSwell(config: SwellConfig): void {
  const signature = JSON.stringify(config);
  if (initializedWith === signature) return;

  const options = {
    ...(config.url ? { url: config.url } : {}),
    ...(config.vaultUrl ? { vaultUrl: config.vaultUrl } : {}),
  };

  swell.init(config.storeId, config.publicKey, options);
  initializedWith = signature;
}

export { swell };
