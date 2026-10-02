import { SwellError } from "@swell/apps-sdk";
import Card from "@/components/card";
import { getBackend, getSwellContext } from "@/lib/swell";

export default async function StaffCard() {
  const staff = (await getSwellContext())?.staff;
  let name: string | undefined;
  let message = "";

  // Identity comes from Swell's request context. The optional Backend read below
  // uses the app's permissions and cannot change whether the viewer is staff.
  if (staff) {
    try {
      const backend = await getBackend();
      const user = await backend.get<{ name?: string }>(`/:users/${encodeURIComponent(staff.userId)}`, { fields: "name" });
      name = user?.name;
    } catch (error) {
      if (error instanceof SwellError && error.status === 403) {
        message = "This app has no permission to read your name.";
      } else {
        console.error("Staff name lookup failed", error);
        message = "Your name could not be loaded. Please try again.";
      }
    }
  }

  return (
    <Card title="Visitor or staff" runs="Server component · Backend API" file="components/staff-card.tsx">
      {staff ? (
        <p>Staff{name ? `: ${name}` : "."}{message && ` ${message}`}</p>
      ) : (
        <p>Visitor. Run <code>swell app push</code>, then open this app from the Swell dashboard to be recognized as staff.</p>
      )}
    </Card>
  );
}
