import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Heading, Link, Text, type HeadingLevel } from "@/storefront/primitives";

/**
 * Renders a single feature, benefit, step, or value proposition.
 */
export interface ContentFeatureProps {
  /**
   * Feature title content.
   */
  title: ReactNode;
  /**
   * Optional supporting description.
   */
  description?: ReactNode;
  /**
   * Optional icon rendered above the title.
   */
  icon?: ReactNode;
  /**
   * Optional index or step marker rendered above the title.
   */
  index?: ReactNode;
  /**
   * Optional route or URL for the feature link.
   */
  href?: string;
  /**
   * Optional link label; the link is rendered only when href and linkLabel are both provided.
   */
  linkLabel?: ReactNode;
  /**
   * Semantic heading level passed to the Heading primitive.
   */
  level?: HeadingLevel;
  /**
   * Visual feature preset.
   */
  variant?: "plain" | "card" | "step";
  /**
   * Text alignment preset.
   */
  align?: "start" | "center" | "end";
  /**
   * Styles the feature root.
   */
  className?: string;
  /**
   * Styles the icon wrapper.
   */
  iconClassName?: string;
  /**
   * Styles the index marker.
   */
  indexClassName?: string;
  /**
   * Styles the title heading.
   */
  titleClassName?: string;
  /**
   * Styles the description text.
   */
  descriptionClassName?: string;
  /**
   * Styles the optional link.
   */
  linkClassName?: string;
}

export function ContentFeature({
  title,
  description,
  icon,
  index,
  href,
  linkLabel,
  level = 3,
  variant = "plain",
  align = "start",
  className,
  iconClassName,
  indexClassName,
  titleClassName,
  descriptionClassName,
  linkClassName,
}: ContentFeatureProps) {
  return (
    <article
      data-slot="content-feature"
      className={cn(
        "grid content-start gap-3",
        featureVariantClassName[variant],
        featureAlignClassName[align],
        className,
      )}
    >
      {(icon || index) && (
        <div
          className={cn(
            "flex min-h-8 items-center",
            align === "center" && "justify-center",
            align === "end" && "justify-end",
          )}
        >
          {icon && <span className={cn("text-primary [&_svg]:size-6", iconClassName)}>{icon}</span>}
          {index && (
            <Text
              as="span"
              className={cn("font-mono text-xs text-muted-foreground", indexClassName)}
            >
              {index}
            </Text>
          )}
        </div>
      )}
      <Heading level={level} className={cn("font-heading text-lg font-medium", titleClassName)}>
        {title}
      </Heading>
      {description && (
        <Text className={cn("leading-relaxed text-muted-foreground", descriptionClassName)}>
          {description}
        </Text>
      )}
      {href && linkLabel && (
        <Link
          to={href}
          className={cn(
            "mt-1 w-fit text-sm font-medium underline-offset-4 hover:underline",
            align === "center" && "mx-auto",
            align === "end" && "ml-auto",
            linkClassName,
          )}
        >
          {linkLabel}
        </Link>
      )}
    </article>
  );
}

const featureVariantClassName = {
  plain: "",
  card: "rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm",
  step: "border-t border-border pt-5",
} as const;

const featureAlignClassName = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const;
