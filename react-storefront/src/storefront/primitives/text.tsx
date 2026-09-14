import * as React from "react";

import { cn } from "@/lib/utils";

type TextElement = "p" | "span";

function Text({
  as: Component = "p",
  className,
  ...props
}: React.ComponentProps<"p"> & { as?: TextElement }) {
  return <Component data-slot="text" className={cn(className)} {...props} />;
}

export { Text };
export type { TextElement };
