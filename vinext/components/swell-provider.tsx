"use client";

import { createContext, useContext, useState } from "react";
import swell, { type PublicConfig, type SwellClient } from "swell-js";

const SwellContext = createContext<SwellClient | null>(null);

// One swell-js client for the browser, configured by the server in app/layout.tsx.
export function SwellProvider({ config, children }: Readonly<{ config: PublicConfig; children: React.ReactNode }>) {
  const [client] = useState(() => swell.create(config.storeId, config.publicKey, config));
  return <SwellContext.Provider value={client}>{children}</SwellContext.Provider>;
}

// Call its methods in effects and event handlers, not while rendering.
export function useSwell() {
  const client = useContext(SwellContext);
  if (!client) throw new Error("useSwell() needs SwellProvider, which app/layout.tsx adds when the app is opened through Swell");
  return client;
}
