import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Les cinq briques du module Formation, branchées sur les classes
 * `.lockin-*` de globals.css. Aucune logique : du style strict et rectangulaire.
 */

export function LockinTitle({
  as: Tag = "h2",
  className,
  ...props
}: React.ComponentProps<"h1"> & { as?: "h1" | "h2" | "h3" | "p" }) {
  return <Tag className={cn("lockin-title", className)} {...props} />;
}

export function LockinSection({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("lockin-section", className)} {...props} />;
}

export function LockinCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("lockin-card", className)} {...props} />;
}

export function LockinButton({
  variant = "solid",
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: "solid" | "outline" }) {
  return (
    <button
      type={type}
      className={cn("lockin-button", variant === "outline" && "lockin-button--outline", className)}
      {...props}
    />
  );
}

export const LockinInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function LockinInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn("lockin-input", className)} {...props} />;
  },
);

export const LockinTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  function LockinTextarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn("lockin-input resize-y", className)} {...props} />;
  },
);

/** Libellé de champ : capitales espacées, lié au champ par htmlFor. */
export function LockinLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-2 block text-[11px] font-semibold tracking-[0.2em] text-lk-black/60 uppercase", className)}
      {...props}
    />
  );
}
