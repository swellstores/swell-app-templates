import { useEffect, useMemo } from "react";
import type { Cart, Product } from "swell-js";

import {
  getCartLineDetails,
  type AddProductOptions,
  type CartItemPayload,
  type CartLineDetails,
} from "@/lib/swell/cart";
import { useCartStore } from "@/lib/swell/cartStore";
import { useStorefront } from "@/lib/swell/storefront";

import { useCurrency } from "./useCurrency";

export interface CartLine extends CartLineDetails {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  originalTotal: number | null;
  isUpdating: boolean;
  productHref: string | null;
  setQuantity: (quantity: number) => Promise<Cart>;
  remove: () => Promise<Cart>;
}

export interface UseCartResult {
  cart: Cart | null;
  items: CartLine[];
  isEmpty: boolean;
  isLoading: boolean;
  error: Error | null;
  currency: string;
  format: (amount: number) => string;
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  checkoutUrl: string | null;
  addingProductId: string | null;
  addItem: (payload: CartItemPayload) => Promise<Cart>;
  addProduct: (product: Product, options?: AddProductOptions) => Promise<Cart>;
  updateQuantity: (itemId: string, quantity: number) => Promise<Cart>;
  removeItem: (itemId: string) => Promise<Cart>;
  clearError: () => void;
}

/**
 * Loads the current storefront cart and exposes cart data, formatting, and actions.
 */
export function useCart(): UseCartResult {
  const { queryScope } = useStorefront();
  const { code: currency, format } = useCurrency();

  const cart = useCartStore((state) => state.cart);
  const loadingKey = useCartStore((state) => state.loadingKey);
  const error = useCartStore((state) => state.error);
  const addingProductId = useCartStore((state) => state.addingProductId);
  const updatingItemIds = useCartStore((state) => state.updatingItemIds);
  const load = useCartStore((state) => state.load);
  const addItem = useCartStore((state) => state.addItem);
  const addProduct = useCartStore((state) => state.addProduct);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearError = useCartStore((state) => state.clearError);

  useEffect(() => {
    if (queryScope) void load(queryScope);
  }, [load, queryScope]);

  const items = useMemo<CartLine[]>(
    () =>
      (cart?.items ?? []).map((item) => {
        const quantity = item.quantity ?? 1;
        const unitPrice = item.price ?? 0;
        const total = item.price_total ?? unitPrice * quantity;
        const originalUnitPrice = item.orig_price ?? 0;

        return {
          id: item.id,
          ...getCartLineDetails(item),
          quantity,
          unitPrice,
          total,
          originalTotal: originalUnitPrice > unitPrice ? originalUnitPrice * quantity : null,
          isUpdating: updatingItemIds.includes(item.id),
          productHref: item.product?.slug ? `/products/${item.product.slug}` : null,
          setQuantity: (next) => updateQuantity(item.id, next),
          remove: () => removeItem(item.id),
        };
      }),
    [cart?.items, removeItem, updateQuantity, updatingItemIds],
  );

  return {
    cart,
    items,
    isEmpty: items.length === 0,
    isLoading: loadingKey !== null,
    error,
    currency: cart?.currency || currency || "USD",
    format,
    itemCount: cart?.item_quantity ?? 0,
    subtotal: cart?.sub_total ?? 0,
    discountTotal: cart?.discount_total ?? 0,
    taxTotal: cart?.tax_total ?? 0,
    total: cart?.capture_total ?? cart?.grand_total ?? 0,
    checkoutUrl: cart?.checkout_url ?? null,
    addingProductId,
    addItem,
    addProduct: (product, options) => addProduct(product, options),
    updateQuantity,
    removeItem,
    clearError,
  };
}
