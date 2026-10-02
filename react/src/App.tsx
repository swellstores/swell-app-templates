import { useEffect, useState } from 'react'
import type { PublicConfig } from 'swell-js'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import CartCard from './components/cart-card'
import CatalogCard from './components/catalog-card'
import StoreUserCard from './components/store-user-card'
import SwellProvider from './components/swell-provider'
import './App.css'

function App() {
  // The public config for swell-js, from the Worker: undefined while loading,
  // null when the app was opened without Swell.
  const [config, setConfig] = useState<PublicConfig | null>()
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/app-api/config')
      .then(async (response) => {
        // An answer from in front of the Worker may not be JSON or carry a message.
        const body = await response.json().catch(() => undefined)
        if (!response.ok || body === undefined) {
          throw new Error(typeof body?.error === 'string' ? body.error : `/app-api/config gave an unexpected answer (status ${response.status}).`)
        }
        setConfig(body)
      })
      .catch((error: Error) => setError(error.message))
  }, [])

  return (
    <>
      <section id="center">
        <p className="eyebrow">Swell app · React</p>
        {config ? (
          <div>
            <h1>Your Swell app is connected.</h1>
            <p>
              Live data from store <code>{config.storeId}</code>. Each card shows something the app already does and
              names the file to copy from.
            </p>
          </div>
        ) : config === null ? (
          <div>
            <h1>Not connected to a store.</h1>
            <p>
              This page was opened without Swell, so it has no store to talk to. Run the command below from the app
              folder, one level above <code>frontend</code>, and open the address it prints.
            </p>
          </div>
        ) : error ? (
          <div>
            <h1>The connection to Swell failed.</h1>
            <p>{error}</p>
          </div>
        ) : (
          <p>Connecting to Swell…</p>
        )}

        {config && (
          <SwellProvider config={config}>
            <ul className="cards">
              <CatalogCard />
              <CartCard />
              <StoreUserCard />
            </ul>
          </SwellProvider>
        )}
        {config === null && <code className="command">swell app dev</code>}

        {config && (
          <p className="hint">
            Start in <code>src/App.tsx</code>. Preview with <code>swell app dev</code> and deploy with{' '}
            <code>swell app push</code>, both from the app folder.
          </p>
        )}
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <ul>
            <li>
              <a href="https://developers.swell.is" target="_blank">
                Swell docs
              </a>
            </li>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                React
              </a>
            </li>
            <li>
              {/* Opens in a new tab: the Swell dashboard shows this app in a frame. */}
              <a href="/app-api/hello" target="_blank">
                API route <code>/app-api/hello</code>
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

export default App
