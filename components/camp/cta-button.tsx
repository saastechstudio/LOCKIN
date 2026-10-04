import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAButtonProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  variant?: "primary" | "secondary";
};

/**
 * Bouton d'action pour les écrans Lock-In Camp. "primary" reprend le brun
 * plein (identité camp) plutôt que le dégradé bleu/corail/or du reste de
 * l'app ; "secondary" reste discret (contour brun) pour les actions
 * secondaires (retour, annuler).
 */
export function CTAButton({ variant = "primary", className, ...props }: CTAButtonProps) {
  return (
    <Button
      variant={variant === "primary" ? "default" : "outline"}
      className={cn(
        variant === "primary"
          ? "bg-camp-brown text-camp-cream shadow-none hover:bg-camp-brown-deep hover:brightness-100"
          : "border-camp-border bg-transparent text-camp-brown-deep hover:border-camp-brown/40 hover:text-camp-brown",
        className,
      )}
      {...props}
    />
  );
}
