import type { ResolvedMenu } from "@/lib/swell/menu";
import { useStorefront } from "@/lib/swell/storefront";

/**
 * Returns all resolved storefront menus available to generated sections.
 */
export function useMenus(): ResolvedMenu[] {
  return Object.values(useStorefront().menus);
}

/**
 * Returns one resolved storefront menu by id.
 */
export function useMenu(id: string | undefined): ResolvedMenu | null {
  const { menus } = useStorefront();
  return id ? (menus[id] ?? null) : null;
}
