import { useEffect, useState } from 'react'
import type { SwellClient } from 'swell-js'
import { useSwell } from '../swell'
import Card from './card'
import SwellImage from './swell-image'

type Products = Awaited<ReturnType<SwellClient['products']['list']>>

export default function CatalogCard() {
  const swell = useSwell()
  // undefined while loading, null after a failure.
  const [products, setProducts] = useState<Products | null>()

  useEffect(() => {
    swell.products
      .list({ limit: 6 })
      .then(setProducts)
      .catch((error: unknown) => {
        console.error('Catalog lookup failed', error)
        setProducts(null)
      })
  }, [swell])

  return (
    <Card title="Read the catalog" file="src/components/catalog-card.tsx">
      {products === undefined ? (
        <p>Loading the catalog…</p>
      ) : !products ? (
        <p>The catalog could not be loaded. Please try again.</p>
      ) : products.count === 0 ? (
        <p>No products yet. Add one in the Swell dashboard to see it here.</p>
      ) : (
        <>
          <p>
            {products.count} {products.count === 1 ? 'product' : 'products'} in this store, read in the browser.
          </p>
          <ul className="thumbnails">
            {products.results.map((product) => {
              const image = product.images?.[0]?.file?.url
              return (
                <li key={product.id} title={product.name}>
                  {image ? (
                    <SwellImage src={image} alt={product.name ?? ''} width={32} height={32} />
                  ) : (
                    <span>{product.name?.trim().charAt(0).toUpperCase()}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Card>
  )
}
