import { useEffect, useState } from 'react'
import { useSwell } from '../swell'
import Card from './card'

export default function CartCard() {
  const swell = useSwell()
  const [count, setCount] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    swell.cart
      .get()
      .then((cart) => setCount(cart?.item_quantity ?? 0))
      .catch((error: unknown) => {
        console.error('Cart lookup failed', error)
        setMessage('The cart could not be loaded. Please try again.')
      })
  }, [swell])

  async function addItem() {
    setMessage('')
    setPending(true)
    try {
      const { results } = await swell.products.list({ limit: 1 })
      const product = results[0]
      if (!product?.id) {
        setMessage('This store has no products yet.')
        return
      }
      // A product with options (size, color) is added with a value for each one.
      // A product page lets the shopper choose; this takes the first value.
      const options = product.options
        ?.filter((option) => option.values?.length)
        .map((option) => ({ name: option.name, value: option.values?.[0]?.name }))
      const cart = await swell.cart.addItem({ product_id: product.id, quantity: 1, options })
      if ('errors' in cart) {
        // A refused change, such as a missing option, is returned, not thrown.
        // Stock is not checked here: an out-of-stock item is accepted and refused when the order is placed.
        setMessage(Object.values(cart.errors).map((error) => error?.message).join(' '))
        return
      }
      setCount(cart.item_quantity ?? 0)
    } catch (error) {
      console.error('Cart change failed', error)
      setMessage('The item could not be added. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card title="Use the cart" file="src/components/cart-card.tsx">
      <p>
        Items in this browser's cart <span className={`badge ${count === null && !message ? 'loading' : ''}`}>{count ?? '…'}</span>
      </p>
      <button className="counter" disabled={pending} onClick={addItem} type="button">
        Add to cart
      </button>
      {message && <p>{message}</p>}
    </Card>
  )
}
