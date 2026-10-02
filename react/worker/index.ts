import { getStorefrontConfig, requireStoreUser, SwellBackendAPI, SwellError } from '@swell/apps-sdk'
import { getSwellContext, json, requireContext } from './swell.ts'

type Handler = (request: Request, params: Record<string, string | undefined>) => Response | Promise<Response>

// Endpoints live under /app-api because Swell reserves /api and /functions. To add
// one, write a handler and list it here. A `:name` segment arrives in the handler's
// params as it is in the URL, still percent-encoded.
const routes: [method: string, pathname: string, handler: Handler][] = [
  ['GET', '/app-api/config', getConfig],
  ['GET', '/app-api/store-user', getStoreUser],
  ['GET', '/app-api/hello', getHello],
  ['POST', '/app-api/hello', postHello],
]

// Only this public projection of the context goes to the browser, for swell-js.
// null means the app was opened without Swell.
async function getConfig(request: Request) {
  const context = await getSwellContext(request)
  return json(context && getStorefrontConfig(context))
}

// Identity comes from Swell's request context. The optional Backend read uses the
// app's access token, not the viewer's permissions, and cannot change whether the
// viewer is a store user. Authorize the caller before exposing private data.
async function getStoreUser(request: Request) {
  const context = await requireContext(request)
  if (!context.storeUser) return json({ storeUser: null })
  try {
    const backend = new SwellBackendAPI({ context })
    const user = await backend.get<{ name?: string }>(`/:users/${encodeURIComponent(context.storeUser.userId)}`, { fields: 'name' })
    return json({ storeUser: { name: user?.name } })
  } catch (error) {
    if (error instanceof SwellError && error.status === 403) {
      return json({ storeUser: {}, message: 'This app has no permission to read your name.' })
    }
    console.error('Store user name lookup failed', error)
    return json({ storeUser: {}, message: 'Your name could not be loaded. Please try again.' })
  }
}

function getHello() {
  return json({ message: 'Hello from your app Worker' })
}

// Start a store-user-only change with this check, then validate input and apply the
// app's permissions before writing. Swell's proxy authenticates store users and
// withholds their identity on a request from another origin, unless it is a GET,
// HEAD or OPTIONS. So GET handlers must not change data. This example returns
// identity and changes no data.
async function postHello(request: Request) {
  const storeUser = requireStoreUser(await requireContext(request))
  return json({ storeUser })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/app-api/')) return env.ASSETS.fetch(request)

    const matches = routes.flatMap(([method, pathname, handler]) => {
      const match = new URLPattern({ pathname }).exec(url)
      return match ? [{ method, handler, params: match.pathname.groups }] : []
    })
    if (matches.length === 0) return json({ error: 'Not found' }, 404)
    const route = matches.find(({ method }) => method === request.method)
    if (!route) return json({ error: 'Method not allowed' }, 405)

    try {
      return await route.handler(request, route.params)
    } catch (error) {
      if (error instanceof SwellError && error.code === 'store_user_required') {
        return json({ error: 'Store user access required.' }, 401)
      }
      if (error instanceof SwellError && error.code === 'invalid_swell_context') {
        return json({ error: error.message }, 401)
      }
      // Details stay in the log; the browser gets a general message.
      console.error(error)
      return json({ error: 'Something went wrong. Please try again.' }, 500)
    }
  },
} satisfies ExportedHandler<Env>
