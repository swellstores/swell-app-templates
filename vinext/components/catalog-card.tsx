import Card from "@/components/card";
import SwellImage from "@/components/swell-image";
import { getStorefront } from "@/lib/swell";

async function loadProducts() {
  const storefront = await getStorefront();
  return storefront.products.list({ limit: 6 });
}

export default async function CatalogCard() {
  const products = await loadProducts().catch((error: unknown) => {
    console.error("Catalog lookup failed", error);
    return null;
  });

  return (
    <Card title="Read the catalog" file="components/catalog-card.tsx">
      {!products ? (
        <p>The catalog could not be loaded. Please try again.</p>
      ) : products.count === 0 ? (
        <p>No products yet. Add one in the Swell dashboard to see it here.</p>
      ) : (
        <>
          <p>
            {products.count} {products.count === 1 ? "product" : "products"} in this store, read on the server.
          </p>
          <ul className="mt-3 flex gap-2">
            {products.results.map((product) => {
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
                    <span className="flex size-8 items-center justify-center rounded bg-slate-200 text-xs font-medium text-slate-500">
                      {product.name?.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
