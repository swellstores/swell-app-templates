import { SwellError } from "@swell/apps-sdk";
import { requireStaff } from "@/lib/swell";

// Endpoints live under /app-api because Swell reserves /api.
export function GET() {
  return Response.json({
    message: "Hello from vinext on Cloudflare Workers",
  }, { headers: { "Cache-Control": "private, no-store" } });
}

// Start a staff-only mutation with this check, then validate input and apply the
// app's permissions before writing. This example returns identity and changes no data.
export async function POST() {
  try {
    const staff = await requireStaff();
    return Response.json({ staff }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (!(error instanceof SwellError)) throw error;
    return Response.json({
      error: error.status === 401 ? "Staff access required." : "Unable to verify staff access. Please try again.",
    }, { status: error.status, headers: { "Cache-Control": "private, no-store" } });
  }
}
