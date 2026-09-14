interface MenuItem {
  type: string;
  name: string;
  value?: string | { id?: string; slug?: string };
  url?: string;
  model?: string;
  items?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  items?: MenuItem[];
}

export interface ResolvedMenuItem {
  name: string;
  type: string;
  href: string;
  children: ResolvedMenuItem[];
  items: ResolvedMenuItem[];
}

export interface ResolvedMenu {
  id: string;
  name: string;
  items: ResolvedMenuItem[];
}

function getSlug(value?: MenuItem["value"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.slug ?? value.id ?? "";
}

function resolveHref(item: MenuItem): string {
  const slug = getSlug(item.value);

  switch (item.type) {
    case "home":
      return "/";
    case "product_list":
      return "/products";
    case "product":
      return `/products/${slug}`;
    case "category":
      return `/categories/${slug}`;
    case "page":
      return `/pages/${slug}`;
    case "search":
      return "/search";
    case "url":
      return typeof item.value === "string" ? item.value : item.url || "#";
    case "blog":
    case "blog_category":
      return `/blogs/${slug}`;
    case "heading":
      return "#";
    case "content":
      return `/${slug}`;
    case "content_list":
      return `/${item.model || slug}`;
    default:
      return item.url || "#";
  }
}

function normalizeHref(href: string): string {
  return href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
}

function resolveItems(items: MenuItem[]): ResolvedMenuItem[] {
  return items.map((item) => {
    const children = resolveItems(item.items ?? []);
    return {
      name: item.name,
      type: item.type,
      href: normalizeHref(resolveHref(item)),
      children,
      items: children,
    };
  });
}

function pickMenuList(value: unknown): Menu[] {
  if (Array.isArray(value)) return value as Menu[];
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  if (Array.isArray(record.menus)) return record.menus as Menu[];
  if (record.menus && typeof record.menus === "object") {
    return Object.values(record.menus) as Menu[];
  }

  return [];
}

export function normalizeMenus(value: unknown): Record<string, ResolvedMenu> {
  return Object.fromEntries(
    pickMenuList(value)
      .filter((menu) => menu.id)
      .map((menu) => [
        menu.id,
        {
          id: menu.id,
          name: menu.name,
          items: resolveItems(menu.items ?? []),
        },
      ]),
  );
}
