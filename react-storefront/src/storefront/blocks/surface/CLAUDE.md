# src/storefront/blocks/surface

Import from: `@/storefront/blocks`

## Exports

### SurfaceDrawer

Renders a reusable drawer surface for carts, filters, mobile navigation, and other overlay content.

Properties:

- `trigger: ReactNode`
  Element that opens the drawer, usually another block such as CartTrigger or a styled button.
- `children: ReactNode`
  Main drawer body content, usually composed from other blocks.
- `title?: ReactNode`
  Drawer title text or node.
- `description?: ReactNode`
  Optional supporting text rendered under the title.
- `footer?: ReactNode`
  Optional footer content, commonly actions such as checkout or apply filters.
- `closeLabel?: ReactNode`
  Optional close control rendered in the footer.
- `className?: string`
  Styles the drawer content panel.
- `headerClassName?: string`
  Styles the drawer header.
- `titleClassName?: string`
  Styles the drawer title.
- `descriptionClassName?: string`
  Styles the drawer description.
- `bodyClassName?: string`
  Styles the scrollable body area.
- `footerClassName?: string`
  Styles the drawer footer.
- `closeClassName?: string`
  Styles the optional close control.
- `direction?: "top" | "right" | "bottom" | "left"`
  Drawer edge used by the underlying drawer primitive.
- `size?: "sm" | "md" | "lg"`
  Drawer panel width/height preset.
- `scrollBody?: boolean`
  Controls whether body content is wrapped in a scroll area.
