import { useCallback, useEffect, useMemo, useState } from "react";
import type { Cart, Product, ProductOption, ProductQuery } from "swell-js";

import { swell } from "@/lib/swell/client";
import {
  getActiveOptions,
  getDefaultOptions,
  getDefaultPurchaseOption,
  getProductImage,
  getProductImages,
  getProductPrice,
  getProductPurchaseOptions,
  type CommerceImage,
  type ProductPrice,
  type ProductPurchaseOption,
  type PurchaseOptionSelection,
} from "@/lib/swell/product";
import { useStorefront } from "@/lib/swell/storefront";

import { stableQueryKey, useQuery } from "./query";
import { useCart } from "./useCart";
import { useCurrency } from "./useCurrency";

const DEFAULT_PRODUCT_QUERY: ProductQuery = {
  expand: ["variants"],
};

export type ProductOptionControl =
  | {
      type: "select";
      id: string;
      name: string;
      value: string;
      values: Array<{ value: string; label: string; price: number | null }>;
      setValue: (value: string) => void;
    }
  | {
      type: "toggle";
      id: string;
      name: string;
      active: boolean;
      price: number | null;
      setActive: (active: boolean) => void;
    }
  | {
      type: "text";
      id: string;
      name: string;
      value: string;
      placeholder: string;
      multiline: boolean;
      setValue: (value: string) => void;
    };

export interface ProductPurchaseOptionControl extends ProductPurchaseOption {
  select: () => void;
}

export interface ProductGalleryState {
  images: CommerceImage[];
  activeIndex: number;
  activeImage: CommerceImage | null;
  setActiveIndex: (index: number) => void;
  next: () => void;
  previous: () => void;
}

export interface ProductQuantityState {
  value: number;
  min: number;
  increment: number;
  set: (quantity: number) => void;
  increase: () => void;
  decrease: () => void;
}

export interface ProductAddToCartAction {
  execute: () => Promise<Cart | null>;
  disabled: boolean;
  isPending: boolean;
}

export interface UseProductResult {
  product: Product | null;
  selectedProduct: Product | null;
  gallery: ProductGalleryState;
  price: ProductPrice;
  formattedPrice: string | null;
  formattedOriginalPrice: string | null;
  options: ProductOptionControl[];
  purchaseOptions: ProductPurchaseOptionControl[];
  quantity: ProductQuantityState;
  stock: {
    status: Product["stock_status"];
    inStock: boolean;
  };
  addToCart: ProductAddToCartAction;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches and controls one product for product detail, featured product, and quick-view sections.
 */
export function useProduct(
  idOrSlug: string | undefined,
  query: ProductQuery = DEFAULT_PRODUCT_QUERY,
): UseProductResult {
  const { queryScope } = useStorefront();
  const key =
    idOrSlug && queryScope ? `product|${idOrSlug}|${queryScope}|${stableQueryKey(query)}` : "";
  const productQuery = useQuery(key, () => swell.products.get(idOrSlug!, query));
  const product = productQuery.data;

  const selection = useSelection(product);
  const { addProduct, addingProductId } = useCart();
  const { format } = useCurrency();
  const [activeIndex, setActiveIndexState] = useState(0);
  const selectedProduct = selection.variation ?? product;

  const images = useMemo(() => {
    const selectedImages = getProductImages(selectedProduct);
    if (selectedImages.length > 0) return selectedImages;

    const fallbackImage = getProductImage(product);
    return fallbackImage ? [fallbackImage] : [];
  }, [product, selectedProduct]);

  useEffect(() => {
    setActiveIndexState(0);
  }, [product?.id, images.length]);

  const setActiveIndex = (index: number) => {
    setActiveIndexState(Math.min(Math.max(index, 0), Math.max(images.length - 1, 0)));
  };

  const gallery: ProductGalleryState = {
    images,
    activeIndex,
    activeImage: images[activeIndex] ?? null,
    setActiveIndex,
    next: () => setActiveIndex(activeIndex + 1),
    previous: () => setActiveIndex(activeIndex - 1),
  };

  const price = getProductPrice(selectedProduct ?? product);
  const formattedPrice = price.current === null ? null : format(price.current);
  const options = product ? getProductOptionControls(product, selection) : [];
  const purchaseOptions = getProductPurchaseOptions(product, selection.purchaseOption).map(
    (option) => ({
      ...option,
      select: () => selection.setPurchaseOption(option.selection),
    }),
  );
  const min = product?.quantity_min ?? 1;
  const increment = product?.quantity_inc ?? 1;
  const quantity: ProductQuantityState = {
    value: selection.quantity,
    min,
    increment,
    set: selection.setQuantity,
    increase: selection.incrementQuantity,
    decrease: selection.decrementQuantity,
  };
  const stockStatus = selectedProduct?.stock_status ?? product?.stock_status ?? null;
  const inStock = stockStatus !== "out_of_stock" && stockStatus !== "discontinued";
  const isPending = Boolean(product?.id && addingProductId === product.id);

  return {
    product,
    selectedProduct,
    gallery,
    price,
    formattedPrice,
    formattedOriginalPrice: price.compareAt === null ? null : format(price.compareAt),
    options,
    purchaseOptions,
    quantity,
    stock: {
      status: stockStatus,
      inStock,
    },
    addToCart: {
      execute: () => {
        if (!product) return Promise.resolve(null);
        return addProduct(product, {
          options: selection.options,
          purchaseOption: selection.purchaseOption,
          quantity: selection.quantity,
        });
      },
      disabled: !product || !inStock,
      isPending,
    },
    error: productQuery.error,
    isLoading: Boolean(idOrSlug) && (!queryScope || productQuery.isLoading),
    isFetching: productQuery.isFetching,
    refetch: productQuery.refetch,
  };
}

interface ProductSelection {
  options: Record<string, string>;
  purchaseOption: PurchaseOptionSelection;
  quantity: number;
  variation: Product | null;
  setOption: (optionId: string, value: string | null) => void;
  setPurchaseOption: (selection: PurchaseOptionSelection) => void;
  setQuantity: (quantity: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
}

function useSelection(product: Product | null): ProductSelection {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [purchaseOption, setPurchaseOption] = useState<PurchaseOptionSelection>({
    type: "standard",
  });
  const [quantity, setQuantityState] = useState(1);

  useEffect(() => {
    if (!product) return;
    setOptions(getDefaultOptions(product));
    setPurchaseOption(getDefaultPurchaseOption(product));
    setQuantityState(product.quantity_min ?? 1);
  }, [product?.id]);

  const variation = useMemo(() => {
    if (!product) return null;

    try {
      return swell.products.variation(product, options, purchaseOption) as Product;
    } catch {
      return product;
    }
  }, [options, product, purchaseOption]);

  const setOption = useCallback((optionId: string, value: string | null) => {
    setOptions((current) => {
      const next = { ...current };
      if (value === null) delete next[optionId];
      else next[optionId] = value;
      return next;
    });
  }, []);

  const minimum = product?.quantity_min ?? 1;
  const increment = product?.quantity_inc ?? 1;
  const setQuantity = useCallback(
    (next: number) => setQuantityState(Math.max(minimum, next)),
    [minimum],
  );

  return {
    options,
    purchaseOption,
    quantity,
    variation,
    setOption,
    setPurchaseOption,
    setQuantity,
    incrementQuantity: () => setQuantity(quantity + increment),
    decrementQuantity: () => setQuantity(quantity - increment),
  };
}

function getProductOptionControls(
  product: Product,
  selection: ProductSelection,
): ProductOptionControl[] {
  return getActiveOptions(product)
    .filter((option) => option.id)
    .map((option) => toOptionControl(option, selection));
}

function toOptionControl(option: ProductOption, selection: ProductSelection): ProductOptionControl {
  const id = option.id!;
  const name = option.name ?? id;
  const inputType = String(option.input_type ?? "select");

  if (inputType === "toggle") {
    const value = option.values?.[0];
    return {
      type: "toggle",
      id,
      name,
      active: Boolean(selection.options[id]),
      price: numberOrNull(value?.price),
      setActive: (active) => selection.setOption(id, active ? (value?.name ?? "true") : null),
    };
  }

  if (
    inputType === "text" ||
    inputType === "textarea" ||
    inputType === "short_text" ||
    inputType === "long_text"
  ) {
    return {
      type: "text",
      id,
      name,
      value: selection.options[id] ?? "",
      placeholder: option.input_hint ?? "",
      multiline: inputType === "textarea" || inputType === "long_text",
      setValue: (value) => selection.setOption(id, value),
    };
  }

  return {
    type: "select",
    id,
    name,
    value: selection.options[id] ?? "",
    values: (option.values ?? [])
      .filter((value) => value.name)
      .map((value) => ({
        value: value.name!,
        label: value.name!,
        price: numberOrNull(value.price),
      })),
    setValue: (value) => selection.setOption(id, value),
  };
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
