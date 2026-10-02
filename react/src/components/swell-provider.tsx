import { useState } from 'react'
import swell, { type PublicConfig } from 'swell-js'
import { SwellContext } from '../swell'

// One swell-js client for the browser, configured by the Worker's /app-api/config.
export default function SwellProvider({ config, children }: Readonly<{ config: PublicConfig; children: React.ReactNode }>) {
  const [client] = useState(() => swell.create(config.storeId, config.publicKey, config))
  return <SwellContext.Provider value={client}>{children}</SwellContext.Provider>
}
