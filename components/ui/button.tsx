import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background-color,box-shadow,transform,color,border-color] duration-200 ease-premium disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lk-blue-soft active:scale-[0.98]",
  {
    variants: {
      variant: {
        // CTA principal : bleu focus, survol plus clair + ombre diffuse + léger soulèvement.
        default:
          "bg-lk-blue text-white hover:-translate-y-0.5 hover:bg-lk-blue-soft hover:shadow-focus active:translate-y-0",
        destructive: "bg-destructive text-white hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        outline:
          "border border-lk-line bg-lk-surface text-lk-black shadow-xs hover:border-lk-stone-2 hover:bg-lk-mist hover:shadow-sm",
        secondary: "bg-lk-mist text-lk-black hover:bg-lk-line",
        ghost: "text-lk-black hover:bg-lk-mist",
        link: "rounded-none text-lk-blue underline decoration-lk-line underline-offset-4 hover:decoration-lk-blue active:scale-100",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-5",
        sm: "h-9 gap-1.5 rounded-lg px-4 has-[>svg]:px-3 text-xs",
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
