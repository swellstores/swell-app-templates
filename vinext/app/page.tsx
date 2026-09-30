import ApiDemo from "@/components/api-demo";
import CartCard from "@/components/cart-card";
import CatalogCard from "@/components/catalog-card";
import StaffCard from "@/components/staff-card";
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
            <>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Three working patterns for talking to Swell. Each card names its file.
              </p>
              <p className="text-sm text-slate-600">
                Store <code>{swell.storeId}</code>
                {swell.environmentId && ` · ${swell.environmentId} environment`}
              </p>
            </>
          ) : (
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              This page was opened without Swell, so it has no store to talk to. Run the command below from the app
              folder, one level above <code>frontend</code>, and open the address it prints.
            </p>
          )}
        </div>

        {swell ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <CatalogCard />
            <CartCard />
            <StaffCard />
          </div>
        ) : (
          <code className="block rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm">swell app dev</code>
        )}

        <ApiDemo />

        <p className="text-sm leading-6 text-slate-600">
          Preview with <code>swell app dev</code> and deploy with <code>swell app push</code>, both from the app folder.
        </p>

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
        </nav>
      </section>
    </main>
  );
}
