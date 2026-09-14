# src/storefront/blocks/navigation

Import from: `@/storefront/blocks`

## Exports

### NavigationMenu

Renders a storefront navigation menu with support for nested menu items.

Properties:

- `menu: ResolvedMenu | null`
  Resolved menu returned from the storefront menu data layer.
- `className?: string`
  Styles the navigation root.
- `listClassName?: string`
  Styles the navigation list.
- `itemClassName?: string`
  Styles each top-level menu item.
- `linkClassName?: string`
  Styles top-level menu links.
- `triggerClassName?: string`
  Styles top-level menu triggers that open nested content.
- `contentClassName?: string`
  Styles nested menu content panels.
- `childLinkClassName?: string`
  Styles links inside nested menu content.
- `ariaLabel?: string`
  Accessible label for the navigation region; defaults to the menu name.
- `gap?: "sm" | "md" | "lg"`
  Spacing preset between top-level navigation items.
- `showViewport?: boolean`
  Controls whether the shadcn navigation viewport is rendered.
