import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-28 pb-32 text-center">
      <div
        aria-hidden
        className="animate-aurora pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[720px] -translate-x-[62%] rounded-full bg-[radial-gradient(closest-side,_rgba(74,144,232,0.38),_transparent_75%)] blur-3xl"
      />
      <div
        aria-hidden
        className="animate-aurora-slow pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-[640px] -translate-x-[38%] rounded-full bg-[radial-gradient(closest-side,_rgba(232,130,90,0.32),_transparent_75%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-[360px] w-[480px] -translate-x-[10%] rounded-full bg-[radial-gradient(closest-side,_rgba(232,181,99,0.3),_transparent_75%)] blur-3xl"
      />
      <div
        aria-hidden
        className="animate-aurora pointer-events-none absolute top-20 left-1/2 -z-10 h-[400px] w-[540px] -translate-x-[85%] rounded-full bg-[radial-gradient(closest-side,_rgba(27,122,140,0.28),_transparent_75%)] blur-3xl"
      />

      <h1 className="font-display mx-auto max-w-4xl text-5xl leading-[1.08] text-foreground sm:text-6xl">
        Le Club d&apos;Entrepreneurs{" "}
        <span className="text-gradient-blue">d&apos;Excellence</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
        L&apos;excellence n&apos;est pas une destination, c&apos;est une
        quête. Lock In structure votre progression, jour après jour.
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
