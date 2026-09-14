import type { UseProductResult } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/storefront/primitives";

/**
 * Renders product content fields as accordions for detail-heavy product sections.
 */
export interface ProductDetailsProps {
  /**
   * Complete result returned from useProduct().
   */
  product: UseProductResult;
  /**
   * Styles the accordion root.
   */
  className?: string;
  /**
   * Styles each accordion item.
   */
  itemClassName?: string;
  /**
   * Styles each accordion trigger.
   */
  triggerClassName?: string;
  /**
   * Styles each accordion content panel.
   */
  contentClassName?: string;
  /**
   * Accordion item keys that should be open initially.
   */
  defaultOpen?: string[];
  /**
   * Controls whether product.description is shown as the first detail item.
   */
  showDescription?: boolean;
  /**
   * Label used for the optional description accordion item.
   */
  descriptionLabel?: string;
}

export function ProductDetails({
  product,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
  defaultOpen,
  showDescription = false,
  descriptionLabel = "Description",
}: ProductDetailsProps) {
  const entity = product.product;
  if (!entity) return null;

  const details = Object.entries(entity.content ?? {})
    .map(([key, value]) => ({ key, label: humanize(key), content: displayValue(value) }))
    .filter((item) => item.content !== null);

  if (showDescription && entity.description) {
    details.unshift({ key: "description", label: descriptionLabel, content: entity.description });
  }

  if (details.length === 0) return null;

  return (
    <Accordion
      data-slot="product-details"
      type="multiple"
      defaultValue={defaultOpen}
      className={className}
    >
      {details.map((detail) => (
        <AccordionItem key={detail.key} value={detail.key} className={itemClassName}>
          <AccordionTrigger className={triggerClassName}>{detail.label}</AccordionTrigger>
          <AccordionContent className={cn("text-muted-foreground", contentClassName)}>
            <div dangerouslySetInnerHTML={{ __html: detail.content! }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function humanize(value: string): string {
  const words = value.replace(/[_-]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : value;
}

function displayValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const values = value.filter((item) => ["string", "number", "boolean"].includes(typeof item));
    return values.length > 0 ? values.join(", ") : null;
  }
  return null;
}
