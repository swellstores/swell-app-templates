import { SwellError } from "@swell/apps-sdk";
import Card from "@/components/card";
import { getBackend, getStaff } from "@/lib/swell";

async function loadViewer() {
  const staff = await getStaff();
  if (!staff) return { staff: false as const };

  const backend = await getBackend();
  try {
    // Works with permissions [] or a list that includes "read_:users" in swell.json.
    const user = await backend.get<{ name?: string }>(`/:users/${staff.userId}`, { fields: "name" });
    return { staff: true as const, name: user?.name };
  } catch (error) {
    if (error instanceof SwellError && error.status === 403) return { staff: true as const };
    throw error;
  }
}

export default async function StaffCard() {
  const viewer = await loadViewer().catch((error: Error) => error);

  return (
    <Card title="Visitor or staff" runs="Server component · Backend API" file="components/staff-card.tsx">
      {viewer instanceof Error ? (
        <p>The staff check could not be completed: {viewer.message}</p>
      ) : !viewer.staff ? (
        <p>Visitor. Open this app from the Swell dashboard to be recognized as staff.</p>
      ) : (
        <p>Staff{viewer.name ? `: ${viewer.name}` : ". This app has no permission to read your name."}</p>
      )}
    </Card>
  );
}
