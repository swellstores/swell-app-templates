import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ScrollArea,
} from "@/storefront/primitives";

/**
 * Renders a reusable drawer surface for carts, filters, mobile navigation, and other overlay content.
 */
export interface SurfaceDrawerProps {
  /**
   * Element that opens the drawer, usually another block such as CartTrigger or a styled button.
   */
  trigger: ReactNode;
  /**
   * Main drawer body content, usually composed from other blocks.
   */
  children: ReactNode;
  /**
   * Drawer title text or node.
   */
  title?: ReactNode;
  /**
   * Optional supporting text rendered under the title.
   */
  description?: ReactNode;
  /**
   * Optional footer content, commonly actions such as checkout or apply filters.
   */
  footer?: ReactNode;
  /**
   * Optional close control rendered in the footer.
   */
  closeLabel?: ReactNode;
  /**
   * Styles the drawer content panel.
   */
  className?: string;
  /**
   * Styles the drawer header.
   */
  headerClassName?: string;
  /**
   * Styles the drawer title.
   */
  titleClassName?: string;
  /**
   * Styles the drawer description.
   */
  descriptionClassName?: string;
  /**
   * Styles the scrollable body area.
   */
  bodyClassName?: string;
  /**
   * Styles the drawer footer.
   */
  footerClassName?: string;
  /**
   * Styles the optional close control.
   */
  closeClassName?: string;
  /**
   * Drawer edge used by the underlying drawer primitive.
   */
  direction?: "top" | "right" | "bottom" | "left";
  /**
   * Drawer panel width/height preset.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Controls whether body content is wrapped in a scroll area.
   */
  scrollBody?: boolean;
}

export function SurfaceDrawer({
  trigger,
  children,
  title,
  description,
  footer,
  closeLabel,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  footerClassName,
  closeClassName,
  direction = "right",
  size = "md",
  scrollBody = true,
}: SurfaceDrawerProps) {
  const hasHeader = Boolean(title || description);
  const body = scrollBody ? (
    <ScrollArea
      data-slot="surface-drawer-body"
      className={cn("min-h-0 flex-1 px-4 pb-4", bodyClassName)}
    >
      {children}
    </ScrollArea>
  ) : (
    <div data-slot="surface-drawer-body" className={cn("min-h-0 flex-1 px-4 pb-4", bodyClassName)}>
      {children}
    </div>
  );

  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent
        data-slot="surface-drawer"
        className={cn(surfaceDrawerSizeClassName[size], className)}
      >
        {hasHeader && (
          <DrawerHeader className={headerClassName}>
            {title && <DrawerTitle className={titleClassName}>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription className={descriptionClassName}>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {body}

        {(footer || closeLabel) && (
          <DrawerFooter className={footerClassName}>
            {footer}
            {closeLabel && (
              <DrawerClose asChild>
                <Button type="button" variant="outline" className={closeClassName}>
                  {closeLabel}
                </Button>
              </DrawerClose>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

const surfaceDrawerSizeClassName = {
  sm: "data-[vaul-drawer-direction=left]:sm:max-w-xs data-[vaul-drawer-direction=right]:sm:max-w-xs",
  md: "data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
  lg: "data-[vaul-drawer-direction=left]:sm:max-w-lg data-[vaul-drawer-direction=right]:sm:max-w-lg",
} as const;
