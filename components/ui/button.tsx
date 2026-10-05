import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lk-black",
  {
    variants: {
      variant: {
        // Bouton Lockin : aplat noir, angles droits, survol sobre.
        default: "bg-lk-black text-lk-white hover:opacity-85",
        destructive: "bg-lk-ink-1 text-lk-white hover:opacity-85",
        outline:
          "border border-lk-black bg-lk-white text-lk-black hover:bg-lk-black hover:text-lk-white",
        secondary: "bg-lk-mist text-lk-black hover:opacity-85",
        ghost: "text-lk-black hover:bg-lk-mist",
        link: "text-lk-black underline decoration-lk-line underline-offset-4 hover:decoration-lk-black",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-5",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-13 px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
