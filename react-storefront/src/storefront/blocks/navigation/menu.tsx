import type { ResolvedMenu, ResolvedMenuItem } from "@/lib/swell/menu";
import { cn } from "@/lib/utils";
import {
  Link,
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/storefront/primitives";

/**
 * Renders a storefront navigation menu with support for nested menu items.
 */
export interface NavigationMenuProps {
  /**
   * Resolved menu returned from the storefront menu data layer.
   */
  menu: ResolvedMenu | null;
  /**
   * Styles the navigation root.
   */
  className?: string;
  /**
   * Styles the navigation list.
   */
  listClassName?: string;
  /**
   * Styles each top-level menu item.
   */
  itemClassName?: string;
  /**
   * Styles top-level menu links.
   */
  linkClassName?: string;
  /**
   * Styles top-level menu triggers that open nested content.
   */
  triggerClassName?: string;
  /**
   * Styles nested menu content panels.
   */
  contentClassName?: string;
  /**
   * Styles links inside nested menu content.
   */
  childLinkClassName?: string;
  /**
   * Accessible label for the navigation region; defaults to the menu name.
   */
  ariaLabel?: string;
  /**
   * Spacing preset between top-level navigation items.
   */
  gap?: "sm" | "md" | "lg";
  /**
   * Controls whether the shadcn navigation viewport is rendered.
   */
  showViewport?: boolean;
}

export function NavigationMenu({
  menu,
  className,
  listClassName,
  itemClassName,
  linkClassName,
  triggerClassName,
  contentClassName,
  childLinkClassName,
  ariaLabel,
  gap = "md",
  showViewport = false,
}: NavigationMenuProps) {
  if (!menu || menu.items.length === 0) return null;

  return (
    <NavigationMenuPrimitive
      data-slot="storefront-navigation"
      aria-label={ariaLabel ?? menu.name}
      viewport={showViewport}
      className={cn("w-full justify-start", className)}
    >
      <NavigationMenuList
        className={cn("flex flex-wrap items-center", navigationGapClassName[gap], listClassName)}
      >
        {menu.items.map((item) => (
          <NavigationItem
            key={`${item.type}-${item.href}-${item.name}`}
            item={item}
            itemClassName={itemClassName}
            linkClassName={linkClassName}
            triggerClassName={triggerClassName}
            contentClassName={contentClassName}
            childLinkClassName={childLinkClassName}
          />
        ))}
      </NavigationMenuList>
    </NavigationMenuPrimitive>
  );
}

const navigationGapClassName = {
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-10",
} as const;

interface NavigationItemProps {
  item: ResolvedMenuItem;
  itemClassName?: string;
  linkClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  childLinkClassName?: string;
}

function NavigationItem({
  item,
  itemClassName,
  linkClassName,
  triggerClassName,
  contentClassName,
  childLinkClassName,
}: NavigationItemProps) {
  const children = item.children.length > 0 ? item.children : item.items;

  if (children.length === 0) {
    return (
      <NavigationMenuItem className={itemClassName}>
        <NavigationMenuLink
          asChild
          className={cn(
            "text-sm font-medium text-foreground transition-colors hover:text-primary",
            linkClassName,
          )}
        >
          <MenuLink item={item} />
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem className={itemClassName}>
      <NavigationMenuTrigger className={triggerClassName}>{item.name}</NavigationMenuTrigger>
      <NavigationMenuContent className={cn("min-w-56", contentClassName)}>
        <ul className="grid gap-1 p-1">
          {children.map((child) => (
            <li key={`${child.type}-${child.href}-${child.name}`}>
              <NavigationMenuLink asChild className={childLinkClassName}>
                <MenuLink item={child} />
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function MenuLink({ item }: { item: ResolvedMenuItem }) {
  if (isExternal(item.href)) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer">
        {item.name}
      </a>
    );
  }

  return <Link to={item.href}>{item.name}</Link>;
}

function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}
