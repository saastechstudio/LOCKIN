import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const clubButton = cva(
  "group inline-flex items-center justify-center gap-2 rounded-[14px] text-[13px] font-medium tracking-[0.05em] whitespace-nowrap transition-colors duration-500 ease-club select-none",
  {
    variants: {
      variant: {
        primary: "bg-club-bordeaux text-club-ivory hover:bg-club-bordeaux-light",
        light: "bg-club-ivory text-club-ink hover:bg-club-pierre-soft",
        glass:
          "border border-club-ivory/35 bg-club-ivory/[0.06] text-club-ivory backdrop-blur-md hover:bg-club-ivory/[0.12]",
        outline: "border border-club-concrete text-club-ink hover:border-club-ink",
        link: "h-auto rounded-none px-0 text-club-ink underline-offset-[6px] hover:underline",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-12 px-6",
        lg: "h-14 px-8",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ClubButtonProps = VariantProps<typeof clubButton> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Petite flèche ↗ qui glisse de 2 px au survol. */
  arrow?: boolean;
};

/** Bouton du club, toujours un lien (toutes les actions mènent quelque part). */
export function ClubButton({ href, variant, size, arrow = false, className, children }: ClubButtonProps) {
  return (
    <Link href={href} className={cn(clubButton({ variant, size }), className)}>
      {children}
      {arrow ? (
        <span aria-hidden className="club-arrow">
          ↗
        </span>
      ) : null}
    </Link>
  );
}
