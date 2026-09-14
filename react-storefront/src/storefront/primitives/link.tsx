import * as React from "react";
import { Link as RouterLink } from "react-router-dom";

import { cn } from "@/lib/utils";

function Link({ className, ...props }: React.ComponentProps<typeof RouterLink>) {
  return <RouterLink data-slot="link" className={cn(className)} {...props} />;
}

export { Link };
