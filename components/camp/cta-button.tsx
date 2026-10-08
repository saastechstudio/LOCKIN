import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Bouton brutaliste pour les écrans Lock-In Camp : angles droits, aucune
 * ombre (même pas l'ombre "dure" décalée des versions précédentes) — juste
 * un aplat et un contour net. "primary" : aplat noir (le doré reste un
 * accent, jamais un fond d'action) ; "secondary" : simple contour noir.
 */
const ctaButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border px-7 py-3.5 text-sm font-medium transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "border-lk-line bg-lk-black text-lk-white hover:opacity-85",
        secondary: "border-lk-line bg-transparent text-lk-black hover:bg-lk-black hover:text-lk-white",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type CTAButtonProps = ComponentProps<"button"> &
  VariantProps<typeof ctaButtonVariants> & { asChild?: boolean };

export function CTAButton({ variant, className, asChild = false, ...props }: CTAButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(ctaButtonVariants({ variant }), className)} {...props} />;
}
