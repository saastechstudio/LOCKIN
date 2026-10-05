import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full border border-lk-line bg-lk-white px-4 py-3 text-sm text-lk-black transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-lk-black focus-visible:outline-none",
        "aria-invalid:border-lk-black aria-invalid:border-l-2",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
