import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-28 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.14),_transparent_60%)]"
      />

      <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-gold-soft uppercase">
        Club privé d&apos;entrepreneurs
      </span>

      <h1 className="mx-auto mt-8 max-w-3xl font-serif text-5xl leading-[1.1] text-foreground sm:text-6xl">
        Le Club d&apos;Entrepreneurs{" "}
        <span className="text-gradient-gold">d&apos;Excellence</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
        L&apos;excellence n&apos;est pas une destination, c&apos;est une quête.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/sign-up">
            Rejoindre le Club <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="#pricing">Voir les tarifs</a>
        </Button>
      </div>

      <p className="mt-6 text-xs tracking-wide text-muted-foreground/70">
        14 jours d&apos;essai · Sans engagement · Annulation à tout moment
      </p>
    </section>
  );
}
