import * as React from "react";

import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

function Heading({
  className,
  level = 2,
  ...props
}: React.ComponentProps<"h2"> & { level?: HeadingLevel }) {
  const Component = `h${level}` as const;

  return <Component data-slot="heading" data-level={level} className={cn(className)} {...props} />;
}

export { Heading };
export type { HeadingLevel };
