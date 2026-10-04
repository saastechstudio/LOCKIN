import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Bouton brutaliste pour les écrans Lock-In Camp : angles droits, ombre
 * "dure" décalée (pas de flou), qui se rétracte au clic/survol comme un
 * bouton qu'on enfonce — volontairement différent du `Button` partagé
 * (rounded-lg, dégradé, glow) utilisé par le reste de l'app.
 */
const ctaButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 px-7 py-3.5 font-mono text-sm font-bold tracking-[0.1em] uppercase transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "border-camp-charcoal bg-camp-charcoal text-camp-cream shadow-[6px_6px_0_0_var(--camp-gold)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:translate-x-[6px] active:translate-y-[6px]",
        secondary:
          "border-camp-brown bg-transparent text-camp-brown shadow-[4px_4px_0_0_var(--camp-charcoal)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
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
