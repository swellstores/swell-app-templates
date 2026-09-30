import Card from "@/components/card";
import SwellImage from "@/components/swell-image";
import { getStorefront } from "@/lib/swell";

async function loadCatalog() {
  const storefront = await getStorefront();
  const [products, categories] = await Promise.all([
    storefront.products.list({ limit: 6 }),
    storefront.categories.list({ limit: 1 }),
  ]);
  return { products, categories };
}

export default async function CatalogCard() {
  const catalog = await loadCatalog().catch((error: Error) => error);

  return (
    <Card title="Catalog" runs="Server component · Storefront API" file="components/catalog-card.tsx">
      {catalog instanceof Error ? (
        <p>The catalog could not be loaded: {catalog.message}</p>
      ) : (
        <>
          <p>
            {catalog.products.count} products, {catalog.categories.count} categories
          </p>
          {catalog.products.count === 0 ? (
            <p>Add a product in the Swell dashboard to see it here.</p>
          ) : (
            <ul className="mt-3 flex gap-2">
              {catalog.products.results.map((product) => {
                const image = product.images?.[0]?.file?.url;
                return (
                  <li key={product.id} title={product.name}>
                    {image ? (
                      <SwellImage
                        src={image}
                        alt={product.name ?? ""}
                        width={32}
                        height={32}
                        className="size-8 rounded object-cover"
                      />
                    ) : (
                      <span className="block size-8 rounded bg-slate-200" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
