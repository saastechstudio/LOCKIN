import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-brand-blue/30 bg-brand-blue/10 text-brand-blue-deep dark:text-brand-blue-soft",
        coral: "border-brand-coral/30 bg-brand-coral/10 text-brand-coral",
        yellow: "border-brand-yellow/40 bg-brand-yellow/15 text-[#8a6416] dark:text-brand-yellow",
        secondary: "border-border bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
