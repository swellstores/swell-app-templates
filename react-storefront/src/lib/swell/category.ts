import type { Category } from "swell-js";

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

type CategoryWithMedia = Category & {
  image?: SwellImage | null;
  images?: SwellImage[] | null;
};

export interface CategoryImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export function getCategoryHref(category: Category): string {
  return `/categories/${category.slug ?? category.id ?? ""}`;
}

export function getCategoryImage(category: Category | null | undefined): CategoryImage | null {
  const entity = category as CategoryWithMedia | null | undefined;
  const image = entity?.image ?? entity?.images?.[0];
  const url = image?.file?.url ?? image?.url;
  if (!url) return null;

  return {
    url,
    alt: image?.alt || image?.caption || category?.name || "",
    ...(typeof image.file?.width === "number" ? { width: image.file.width } : {}),
    ...(typeof image.file?.height === "number" ? { height: image.file.height } : {}),
  };
}

export function stripCategoryMarkup(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
