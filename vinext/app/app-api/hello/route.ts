import { SwellError } from "@swell/apps-sdk";
import { requireStoreUser } from "@/lib/swell";

// Endpoints live under /app-api because Swell reserves /api.
export function GET() {
  return Response.json({
    message: "Hello from vinext on Cloudflare Workers",
  }, { headers: { "Cache-Control": "private, no-store" } });
}

// Start a store-user-only mutation with this check, then validate input and apply the
// app's permissions before writing. This example returns identity and changes no data.
export async function POST() {
  try {
    const storeUser = await requireStoreUser();
    return Response.json({ storeUser }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (!(error instanceof SwellError)) throw error;
    return Response.json({
      error: error.status === 401 ? "Store user access required." : "Unable to verify store user access. Please try again.",
    }, { status: error.status, headers: { "Cache-Control": "private, no-store" } });
  }
}
