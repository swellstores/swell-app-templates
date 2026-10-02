import { SwellError, verifySwellContext } from '@swell/apps-sdk'

// Server-only request context, including credentials. Never send it to the browser.
// Verify it once per request and pass the result on. No context means plain
// `npm run dev`; an invalid context still throws.
export async function getSwellContext(request: Request) {
  return request.headers.get('Swell-Context') === null ? null : verifySwellContext(request.headers)
}

// For endpoints that need the store.
export async function requireContext(request: Request) {
  const context = await getSwellContext(request)
  if (!context) {
    throw new SwellError('Not connected to a store. Run `swell app dev` from the app folder and open the address it prints.', {
      status: 401,
      code: 'invalid_swell_context',
    })
  }
  return context
}

// Answers may depend on the viewer, so they are never cached.
export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}
