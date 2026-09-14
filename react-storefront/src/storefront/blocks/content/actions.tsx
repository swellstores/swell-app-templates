import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, Link } from "@/storefront/primitives";

/**
 * Renders a group of content call-to-action buttons or links.
 */
export interface ContentActionsProps {
  /**
   * Action definitions to render.
   */
  actions: Array<{
    label: ReactNode;
    href: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
    external?: boolean;
    icon?: ReactNode;
    className?: string;
  }>;
  /**
   * Styles the actions group root.
   */
  className?: string;
  /**
   * Styles every action button.
   */
  actionClassName?: string;
  /**
   * Styles the generated external-link icon.
   */
  externalIconClassName?: string;
  /**
   * shadcn button size used for every action.
   */
  size?: "default" | "xs" | "sm" | "lg";
  /**
   * Controls whether external actions show a trailing external-link icon.
   */
  showExternalIcon?: boolean;
}

export function ContentActions({
  actions,
  className,
  actionClassName,
  externalIconClassName,
  size = "lg",
  showExternalIcon = true,
}: ContentActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div data-slot="content-actions" className={cn("flex flex-wrap items-center gap-3", className)}>
      {actions.map((action, index) => {
        const isExternal = action.external ?? /^(https?:|mailto:|tel:)/.test(action.href);
        const content = (
          <>
            {action.icon}
            {action.label}
            {isExternal && showExternalIcon && (
              <ArrowUpRightIcon className={externalIconClassName} aria-hidden="true" />
            )}
          </>
        );

        return (
          <Button
            key={`${action.href}-${index}`}
            asChild
            variant={action.variant ?? (index === 0 ? "default" : "outline")}
            size={size}
            className={cn(actionClassName, action.className)}
          >
            {isExternal ? (
              <a href={action.href} target="_blank" rel="noreferrer">
                {content}
              </a>
            ) : (
              <Link to={action.href}>{content}</Link>
            )}
          </Button>
        );
      })}
    </div>
  );
}
