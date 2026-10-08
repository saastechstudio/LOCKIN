import { Flame, Handshake, Target } from "lucide-react";

import { FeatureCard } from "@/components/landing/feature-card";
import { Reveal } from "@/components/ui/reveal";

const PILLARS = [
  {
    icon: Target,
    title: "Discipline",
    description: "Un espace pour tes objectifs, tes routines, ta progression.",
  },
  {
    icon: Handshake,
    title: "Entraide",
    description: "Une communauté qui te soutient, te répond, te pousse.",
  },
  {
    icon: Flame,
    title: "Réseau",
    description: "Des gens ambitieux, partout dans le monde, connectés par le même club.",
  },
];

/** Les trois piliers Lock In. L'ancre #mouvement est la cible du lien du Hero. */
export function Features() {
  return (
    <section id="mouvement" className="scroll-mt-20 bg-lk-mist">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-blue uppercase">
            Ce qu&apos;est Lockin
          </p>
          <h2 className="font-display mt-5 text-4xl text-lk-black sm:text-5xl">
            Trois piliers, une seule direction.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 120}>
              <FeatureCard index={i} {...pillar} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
