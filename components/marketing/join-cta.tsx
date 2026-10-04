import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Section de clôture — dernier appel à rejoindre le Club, identité brutaliste. */
export function JoinCta() {
  return (
    <section className="camp-scope px-6 py-24 text-center">
      <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
        Rejoindre
      </p>
      <h2 className="font-display mx-auto mt-3 max-w-2xl text-3xl font-bold text-camp-charcoal uppercase sm:text-4xl">
        Le Lockin Social Club est gratuit. Entre, maintenant.
      </h2>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center gap-2 border-2 border-camp-charcoal bg-camp-gold px-6 py-3.5 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase"
        >
          Rejoindre le Club <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/methode"
          className="inline-flex items-center justify-center gap-2 border-2 border-camp-charcoal px-6 py-3.5 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase hover:bg-camp-cream"
        >
          Voir la Méthode Lock In
        </Link>
      </div>
    </section>
  );
}
