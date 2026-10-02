import { SwellError } from "@swell/apps-sdk";
import Card from "@/components/card";
import { getBackend, getSwellContext } from "@/lib/swell";

export default async function StoreUserCard() {
  const storeUser = (await getSwellContext())?.storeUser;
  let name: string | undefined;
  let message = "";

  // Identity comes from Swell's request context. The optional Backend read below
  // uses the app's permissions and cannot change whether the viewer is a store user.
  if (storeUser) {
    try {
      const backend = await getBackend();
      const user = await backend.get<{ name?: string }>(`/:users/${encodeURIComponent(storeUser.userId)}`, { fields: "name" });
      name = user?.name;
    } catch (error) {
      if (error instanceof SwellError && error.status === 403) {
        message = "This app has no permission to read your name.";
      } else {
        console.error("Store user name lookup failed", error);
        message = "Your name could not be loaded. Please try again.";
      }
    }
  }

  return (
    <Card title="Recognize store users" file="components/store-user-card.tsx">
      {storeUser ? (
        <p>
          You are viewing as {name ? "" : "a "}
          <span className="font-medium text-slate-950">{name ? `store user ${name}` : "store user"}</span>.
          {message && ` ${message}`}
        </p>
      ) : (
        <>
          <p>
            You are viewing as a <span className="font-medium text-slate-950">visitor</span>.
          </p>
          <p className="mt-2">
            Run <code className="whitespace-nowrap rounded bg-slate-900/5 px-1.5 py-0.5 text-[0.85em]">swell app dev --store-user</code>{" "}
            to view it the way it opens inside the Swell dashboard.
          </p>
        </>
      )}
    </Card>
  );
}
