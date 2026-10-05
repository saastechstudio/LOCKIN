import Link from "next/link";
import { Logo } from "@/components/lockin/logo";

/**
 * Pied de page premium, propre au Lock-In Camp — pas le footer générique
 * du site. Seul endroit de la page où le beige crème sert de fond plein :
 * un repère de clôture, pas une section de plus.
 */
export function Footer() {
  return (
    <footer className="border-t-2 border-camp-charcoal bg-camp-cream px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <Logo size="sm" />

        <p className="font-mono text-[11px] tracking-[0.1em] text-camp-charcoal/50 uppercase">
          Édition Phuket 2027 · Groupe limité à 20 participants
        </p>

        <Link
          href="/legal/mentions"
          className="font-mono text-[11px] font-semibold tracking-[0.1em] text-camp-charcoal/70 uppercase hover:text-camp-charcoal"
        >
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
