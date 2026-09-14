import type { Product, ProductOption, SubscriptionPlan } from "swell-js";

type SwellImage = {
  alt?: string | null;
  caption?: string | null;
  url?: string | null;
  file?: {
    url?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

export interface CommerceImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductPrice {
  current: number | null;
  compareAt: number | null;
  currency: string | null;
  onSale: boolean;
}

export type PurchaseOptionSelection =
  | { type: "standard" }
  | { type: "subscription"; plan_id: string };

export interface ProductPurchaseOption {
  id: string;
  type: PurchaseOptionSelection["type"];
  label: string;
  price: number | null;
  selected: boolean;
  selection: PurchaseOptionSelection;
  billing: {
    interval: string;
    count: number;
  } | null;
}

interface PurchaseOptionInfo {
  hasStandard: boolean;
  plans: SubscriptionPlan[];
  standardPrice: number | null;
  standardSalePrice: number | null;
}

export function getActiveOptions(product: Product): ProductOption[] {
  return product.options?.filter((option) => option.active !== false) ?? [];
}

export function getDefaultOptions(product: Product): Record<string, string> {
  const selection: Record<string, string> = {};

  for (const option of getActiveOptions(product)) {
    const firstValue = option.values?.[0];
    if (option.id && firstValue?.name && (!option.input_type || option.input_type === "select")) {
      selection[option.id] = firstValue.name;
    }
  }

  return selection;
}

export function getDefaultPurchaseOption(product: Product): PurchaseOptionSelection {
  const plans = product.purchase_options?.subscription?.plans ?? [];
  if (!product.purchase_options?.standard && plans[0]?.id) {
    return { type: "subscription", plan_id: plans[0].id };
  }

  return { type: "standard" };
}

export function getProductPurchaseOptions(
  product: Product | null | undefined,
  selected: PurchaseOptionSelection,
): ProductPurchaseOption[] {
  if (!product) return [];

  const info = getPurchaseOptionInfo(product);
  const options: ProductPurchaseOption[] = [];

  if (info.hasStandard) {
    options.push({
      id: "standard",
      type: "standard",
      label: "One-time purchase",
      price: info.standardSalePrice ?? info.standardPrice,
      selected: selected.type === "standard",
      selection: { type: "standard" },
      billing: null,
    });
  }

  for (const plan of info.plans) {
    if (!plan.id) continue;
    const interval = plan.billing_schedule?.interval;
    const count = plan.billing_schedule?.interval_count ?? 1;
    options.push({
      id: plan.id,
      type: "subscription",
      label: interval ? `Every ${count} ${interval}` : "Subscription",
      price: numberOrNull(plan.price),
      selected: selected.type === "subscription" && selected.plan_id === plan.id,
      selection: { type: "subscription", plan_id: plan.id },
      billing: interval ? { interval, count } : null,
    });
  }

  return options;
}

export function getProductImage(
  product: Product | null | undefined,
  index = 0,
): CommerceImage | null {
  const image = product?.images?.[index] as SwellImage | undefined;
  return imageDetails(image, product?.name);
}

export function getProductImages(product: Product | null | undefined): CommerceImage[] {
  return normalizeImages(product?.images as SwellImage[] | undefined, product?.name);
}

export function getProductPrice(product: Product | null | undefined): ProductPrice {
  const current = numberOrNull(product?.price);
  const original = numberOrNull(product?.orig_price);
  const onSale = current !== null && original !== null && current < original;

  return {
    current,
    compareAt: onSale ? original : null,
    currency: typeof product?.currency === "string" ? product.currency : null,
    onSale,
  };
}

function getPurchaseOptionInfo(product: Product): PurchaseOptionInfo {
  const standard = product.purchase_options?.standard;
  const plans = product.purchase_options?.subscription?.plans ?? [];

  return {
    hasStandard: Boolean(standard),
    plans,
    standardPrice: numberOrNull(standard?.price),
    standardSalePrice: standard?.sale ? numberOrNull(standard.sale_price) : null,
  };
}

function imageDetails(
  image: SwellImage | undefined,
  fallbackAlt: string | null | undefined,
): CommerceImage | null {
  const url = image?.file?.url ?? image?.url;
  if (!url) return null;

  return {
    url,
    alt: image?.alt || image?.caption || fallbackAlt || "",
    ...(typeof image.file?.width === "number" ? { width: image.file.width } : {}),
    ...(typeof image.file?.height === "number" ? { height: image.file.height } : {}),
  };
}

function normalizeImages(
  images: SwellImage[] | undefined,
  fallbackAlt: string | null | undefined,
): CommerceImage[] {
  return (images ?? [])
    .map((image) => imageDetails(image, fallbackAlt))
    .filter((image): image is CommerceImage => image !== null);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
