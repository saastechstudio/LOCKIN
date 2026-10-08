import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground flex h-11 w-full min-w-0 rounded-xl border border-lk-line bg-lk-surface px-4 py-2 text-sm text-lk-black transition-[border-color,box-shadow] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-lk-blue-soft focus-visible:ring-4 focus-visible:ring-lk-blue-soft/15 focus-visible:outline-none",
        "aria-invalid:border-lk-line aria-invalid:border-l-2",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
