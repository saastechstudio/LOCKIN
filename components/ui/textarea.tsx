import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-xl border border-lk-line bg-lk-surface px-4 py-3 text-sm text-lk-black transition-[border-color,box-shadow] duration-200 outline-none focus-visible:border-lk-blue-soft focus-visible:ring-4 focus-visible:ring-lk-blue-soft/15 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-lk-line focus-visible:outline-none",
        "aria-invalid:border-lk-line aria-invalid:border-l-2",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
