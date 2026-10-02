import { createContext, useContext } from 'react'
import type { SwellClient } from 'swell-js'

export const SwellContext = createContext<SwellClient | null>(null)

// The browser's swell-js client: products, cart, account and checkout on the
// visitor's session. Call its methods in effects and event handlers, not while rendering.
export function useSwell() {
  const client = useContext(SwellContext)
  if (!client) throw new Error('useSwell() needs SwellProvider, which src/App.tsx adds when the app is opened through Swell')
  return client
}
