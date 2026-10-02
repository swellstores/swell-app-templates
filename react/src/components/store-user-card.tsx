import { useEffect, useState } from 'react'
import Card from './card'

type Result = { storeUser: { name?: string } | null; message?: string }

// The browser cannot tell who is viewing. The Worker reads the store user from
// Swell's request context: see getStoreUser in worker/index.ts.
export default function StoreUserCard() {
  // undefined while loading, null after a failure.
  const [result, setResult] = useState<Result | null>()

  useEffect(() => {
    fetch('/app-api/store-user')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`Status ${response.status}`))))
      .then(setResult)
      .catch((error: unknown) => {
        console.error('Store user lookup failed', error)
        setResult(null)
      })
  }, [])

  const name = result?.storeUser?.name

  return (
    <Card title="Recognize store users" file="src/components/store-user-card.tsx">
      {result === undefined ? (
        <p>Checking who is viewing…</p>
      ) : !result ? (
        <p>The viewer could not be checked. Please try again.</p>
      ) : result.storeUser ? (
        <p>
          You are viewing as {name ? '' : 'a '}
          <strong>{name ? `store user ${name}` : 'store user'}</strong>.{result.message && ` ${result.message}`}
        </p>
      ) : (
        <>
          <p>
            You are viewing as a <strong>visitor</strong>.
          </p>
          <p>
            Run <code>swell app dev --store-user</code> to view it the way it opens inside the Swell dashboard.
          </p>
        </>
      )}
    </Card>
  )
}
