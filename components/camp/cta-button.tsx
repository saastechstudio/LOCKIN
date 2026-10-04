import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Bouton brutaliste pour les écrans Lock-In Camp : angles droits, aucune
 * ombre (même pas l'ombre "dure" décalée des versions précédentes) — juste
 * un aplat de couleur et un contour net. "primary" porte le doré mat de
 * l'identité ; "secondary" reste un simple contour noir charbon.
 */
const ctaButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 px-7 py-3.5 font-mono text-sm font-bold tracking-[0.1em] uppercase shadow-none transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "border-camp-gold bg-camp-gold text-camp-charcoal hover:bg-camp-charcoal hover:border-camp-charcoal hover:text-camp-white",
        secondary: "border-camp-charcoal bg-transparent text-camp-charcoal hover:bg-camp-charcoal hover:text-camp-white",
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
