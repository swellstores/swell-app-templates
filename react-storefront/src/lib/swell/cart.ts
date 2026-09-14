import type { CartItem, Product } from "swell-js";

import {
  getDefaultOptions,
  getDefaultPurchaseOption,
  type PurchaseOptionSelection,
} from "./product";

export type BillingInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface CartItemPayload {
  product_id: string;
  quantity: number;
  options?: Array<{
    id: string;
    name: string;
    value: string;
    value_id: string;
    variant?: boolean;
  }>;
  variant_id?: string;
  purchase_option?: PurchaseOptionSelection;
}

export interface AddProductOptions {
  options?: Record<string, string>;
  purchaseOption?: PurchaseOptionSelection;
  quantity?: number;
}

export function buildCartItemPayload(
  product: Product,
  input: AddProductOptions = {},
): CartItemPayload {
  if (!product.id) {
    throw new Error("Cannot add a product without an id to the cart.");
  }

  const selectedOptions = input.options ?? getDefaultOptions(product);
  const purchaseOption = input.purchaseOption ?? getDefaultPurchaseOption(product);
  const payload: CartItemPayload = {
    product_id: product.id,
    quantity: input.quantity ?? product.quantity_min ?? 1,
  };

  const options: NonNullable<CartItemPayload["options"]> = [];
  const variantValueIds: string[] = [];

  for (const option of product.options ?? []) {
    if (!option.id || option.active === false) continue;

    const valueName = selectedOptions[option.id];
    if (!valueName) continue;

    const value = option.values?.find((candidate) => candidate.name === valueName);
    if (!value?.id) continue;

    options.push({
      id: option.id,
      name: option.name ?? "",
      value: valueName,
      value_id: value.id,
      ...(option.variant ? { variant: true } : {}),
    });

    if (option.variant) variantValueIds.push(value.id);
  }

  if (options.length > 0) payload.options = options;

  if (variantValueIds.length > 0) {
    const selectedIds = [...variantValueIds].sort();
    const variant = product.variants?.results?.find((candidate) => {
      const candidateIds = [...(candidate.option_value_ids ?? [])].sort();
      return (
        candidateIds.length === selectedIds.length &&
        candidateIds.every((id, index) => id === selectedIds[index])
      );
    });

    if (variant?.id) payload.variant_id = variant.id;
  }

  if (purchaseOption.type === "subscription") {
    payload.purchase_option = purchaseOption;
  }

  return payload;
}

export interface CartLineDetails {
  name: string;
  imageUrl: string | null;
  options: Array<{ name: string; value: string }>;
  billing: { interval: BillingInterval; count: number } | null;
}

export function getCartLineDetails(item: CartItem): CartLineDetails {
  const subscription =
    item.purchase_option?.type === "subscription"
      ? {
          interval: item.purchase_option.billing_schedule?.interval as BillingInterval,
          count: item.purchase_option.billing_schedule?.interval_count ?? 1,
        }
      : null;

  return {
    name: item.product_name || item.product?.name || "",
    imageUrl: item.product?.images?.find((image) => image.file?.url)?.file?.url ?? null,
    options: (item.options ?? []).map((option) => ({
      name: option.name ?? "",
      value: option.value ?? "",
    })),
    billing: subscription,
  };
}
