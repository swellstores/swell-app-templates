"use client";

import { useEffect, useState } from "react";
import Card from "@/components/card";
import { useSwell } from "@/components/swell-provider";

export default function CartCard() {
  const swell = useSwell();
  const [count, setCount] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    swell.cart
      .get()
      .then((cart) => setCount(cart?.item_quantity ?? 0))
      .catch((error: Error) => setMessage(`The cart could not be loaded: ${error.message}`));
  }, [swell]);

  async function addItem() {
    setMessage("");
    setPending(true);
    try {
      const { results } = await swell.products.list({ limit: 1 });
      const product = results[0];
      if (!product?.id) {
        setMessage("This store has no products yet.");
        return;
      }
      // A product with options (size, color) is added with a value for each one.
      // A product page lets the shopper choose; this takes the first value.
      const options = product.options
        ?.filter((option) => option.values?.length)
        .map((option) => ({ name: option.name, value: option.values?.[0]?.name }));
      const cart = await swell.cart.addItem({ product_id: product.id, quantity: 1, options });
      if ("errors" in cart) {
        // A refused change, such as a missing option, is returned, not thrown.
        // Stock is not checked here: an out-of-stock item is accepted and refused when the order is placed.
        setMessage(Object.values(cart.errors).map((error) => error?.message).join(" "));
        return;
      }
      setCount(cart.item_quantity ?? 0);
    } catch (error) {
      setMessage(`The item could not be added: ${(error as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Cart" runs="Client component · swell-js" file="components/cart-card.tsx">
      <p className="flex items-center gap-2">
        Items in this visitor's cart
        <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-sm font-semibold text-white">{count ?? "…"}</span>
      </p>
      <button
        className="mt-3 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        onClick={addItem}
        type="button"
      >
        Add an item
      </button>
      {message && <p className="mt-3">{message}</p>}
    </Card>
  );
}
