import type { Cart, ErrorResponse, Product } from "swell-js";
import { create } from "zustand";

import { buildCartItemPayload, type AddProductOptions, type CartItemPayload } from "./cart";
import { swell } from "./client";

function responseError(response: unknown): Error | null {
  if (!response || typeof response !== "object" || !("errors" in response)) {
    return null;
  }

  const errors = (response as ErrorResponse).errors;
  const message = Object.values(errors)
    .filter(Boolean)
    .map((error) => error?.message)
    .filter(Boolean)
    .join(", ");

  return new Error(message || "Swell rejected the cart operation.");
}

function requireCart(response: Cart | ErrorResponse): Cart {
  const error = responseError(response);
  if (error) throw error;
  return response as Cart;
}

interface CartStore {
  cart: Cart | null;
  loadingKey: string | null;
  loadedKey: string | null;
  error: Error | null;
  addingProductId: string | null;
  updatingItemIds: string[];
  load: (key: string) => Promise<void>;
  addItem: (payload: CartItemPayload) => Promise<Cart>;
  addProduct: (product: Product, options?: AddProductOptions) => Promise<Cart>;
  updateQuantity: (itemId: string, quantity: number) => Promise<Cart>;
  removeItem: (itemId: string) => Promise<Cart>;
  clearError: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  loadingKey: null,
  loadedKey: null,
  error: null,
  addingProductId: null,
  updatingItemIds: [],

  load: async (key) => {
    if (!key || get().loadedKey === key || get().loadingKey === key) return;

    set({ loadingKey: key, error: null });
    try {
      const cart = (await swell.cart.get()) as Cart | null;
      if (get().loadingKey === key) {
        set({ cart, loadedKey: key, loadingKey: null });
      }
    } catch (cause) {
      if (get().loadingKey === key) {
        set({
          error: cause instanceof Error ? cause : new Error(String(cause)),
          loadingKey: null,
        });
      }
    }
  },

  addItem: async (payload) => {
    set({ addingProductId: payload.product_id, error: null });
    try {
      const cart = requireCart(await swell.cart.addItem(payload));
      set({ cart });
      return cart;
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      set({ error });
      throw error;
    } finally {
      set({ addingProductId: null });
    }
  },

  addProduct: (product, options) => get().addItem(buildCartItemPayload(product, options)),

  updateQuantity: async (itemId, quantity) => {
    set((current) => ({
      error: null,
      updatingItemIds: [...new Set([...current.updatingItemIds, itemId])],
    }));

    try {
      const response =
        quantity <= 0
          ? await swell.cart.removeItem(itemId)
          : await swell.cart.updateItem(itemId, { quantity });
      const cart = requireCart(response);
      set({ cart });
      return cart;
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      set({ error });
      throw error;
    } finally {
      set((current) => ({
        updatingItemIds: current.updatingItemIds.filter((id) => id !== itemId),
      }));
    }
  },

  removeItem: (itemId) => get().updateQuantity(itemId, 0),
  clearError: () => set({ error: null }),
}));
