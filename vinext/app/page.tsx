import CartCard from "@/components/cart-card";
import CatalogCard from "@/components/catalog-card";
import StoreUserCard from "@/components/store-user-card";
import { getSwellContext } from "@/lib/swell";

const links = [
  {
    href: "https://developers.swell.is",
    label: "Swell docs",
  },
  {
    href: "https://github.com/cloudflare/vinext",
    label: "vinext",
  },
];

// Commands, paths and ids inside a sentence.
const chip = "whitespace-nowrap rounded bg-slate-900/5 px-1.5 py-0.5 text-[0.85em]";

export default async function Home() {
  const swell = await getSwellContext();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Swell app · vinext</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            {swell ? "Your Swell app is connected." : "Not connected to a store."}
          </h1>
          {swell ? (
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Live data from store <code className={chip}>{swell.storeId}</code>
              {swell.environmentId && ` (${swell.environmentId} environment)`}. Each card shows something the app already
              does and names the file to copy from.
            </p>
          ) : (
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              This page was opened without Swell, so it has no store to talk to. Run the command below from the app
              folder, one level above <code className={chip}>frontend</code>, and open the address it prints.
            </p>
          )}
        </div>

        {swell ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <CatalogCard />
            <CartCard />
            <StoreUserCard />
          </div>
        ) : (
          <code className="block rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm">swell app dev</code>
        )}

        {swell && (
          <p className="text-sm leading-6 text-slate-600">
            Start in <code className={chip}>app/page.tsx</code>. Preview with <code className={chip}>swell app dev</code>{" "}
            and deploy with <code className={chip}>swell app push</code>, both from the app folder.
          </p>
        )}

        <nav className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
              href={link.href}
              key={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          ))}
          {/* Opens in a new tab: the Swell dashboard shows this app in a frame. */}
          <a
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
            href="/app-api/hello"
            target="_blank"
          >
            API route <code className="ml-1 font-normal text-slate-500">/app-api/hello</code>
          </a>
        </nav>
      </section>
    </main>
  );
}
