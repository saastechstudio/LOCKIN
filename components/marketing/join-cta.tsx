import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Section de clôture — dernier appel à rejoindre le Club, identité brutaliste. */
export function JoinCta() {
  return (
    <section className="camp-scope px-6 py-28 text-center sm:py-36">
      <p className="font-mono text-xs font-bold tracking-[0.3em] text-camp-gold uppercase">
        Rejoindre
      </p>
      <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-bold text-camp-charcoal sm:text-4xl">
        Le Lockin Social Club est gratuit. Entre, maintenant.
      </h2>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center gap-2 border-2 border-camp-charcoal bg-camp-charcoal px-7 py-3.5 font-mono text-xs font-bold tracking-[0.1em] text-camp-white uppercase transition-colors hover:bg-camp-gold hover:text-camp-charcoal"
        >
          Rejoindre le Club <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/methode"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-mono text-xs font-bold tracking-[0.1em] text-camp-charcoal/70 uppercase transition-colors hover:text-camp-charcoal"
        >
          Voir la Méthode Lock In
        </Link>
      </div>
    </section>
  );
}
