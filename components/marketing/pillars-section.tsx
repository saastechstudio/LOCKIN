"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  HeartHandshake,
  HeartPulse,
  PiggyBank,
  Rocket,
  Scale,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The club's 6 founding pillars — its actual membership criteria, distinct
 * from the product-feature "Pillars" section elsewhere on the page. Order
 * is alphabetical and intentional (the club's own canonical ordering).
 */
type PillarId =
  | "ambition"
  | "discipline"
  | "education-financiere"
  | "ethique"
  | "humilite"
  | "vie-saine";

const ICONS: Record<PillarId, LucideIcon> = {
  ambition: Rocket,
  discipline: CalendarCheck,
  "education-financiere": PiggyBank,
  ethique: Scale,
  humilite: HeartHandshake,
  "vie-saine": HeartPulse,
};

export const pillarsData: {
  id: PillarId;
  title: string;
  description: string;
  iconName: PillarId;
}[] = [
  {
    id: "ambition",
    title: "Ambition",
    description:
      "Viser l'excellence sans jamais se satisfaire du confort de la moyenne.",
    iconName: "ambition",
  },
  {
    id: "discipline",
    title: "Discipline",
    description: "Transformer la vision en action, chaque jour, sans exception.",
    iconName: "discipline",
  },
  {
    id: "education-financiere",
    title: "Éducation financière",
    description:
      "Maîtriser ses chiffres pour bâtir un empire, pas seulement une entreprise.",
    iconName: "education-financiere",
  },
  {
    id: "ethique",
    title: "Éthique",
    description: "Réussir sans jamais compromettre son intégrité ni sa parole.",
    iconName: "ethique",
  },
  {
    id: "humilite",
    title: "Humilité",
    description: "Rester élève à vie, même au sommet.",
    iconName: "humilite",
  },
  {
    id: "vie-saine",
    title: "Vie saine",
    description:
      "Un corps et un esprit forts sont le socle de toute réussite durable.",
    iconName: "vie-saine",
  },
];

export function PillarsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pillars-values" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-coral/25 bg-brand-blue/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-coral uppercase">
            Le socle du club
          </span>
          <h2 className="font-display mt-4 text-3xl text-foreground sm:text-4xl">
            Les 6 Piliers de l&apos;Excellence
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ce que Lock In exige de chacun de ses membres — non négociable.
          </p>
        </div>

        <div ref={sectionRef} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillarsData.map((pillar, index) => {
            const Icon = ICONS[pillar.iconName];
            return (
              <div
                key={pillar.id}
                style={{ transitionDelay: `${index * 90}ms` }}
                className={cn(
                  "surface motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 group relative overflow-hidden rounded-xl p-6 transition-all duration-700 ease-out",
                  visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                )}
              >
                <span
                  aria-hidden
                  className="font-display absolute top-4 right-5 text-3xl font-thin text-foreground/[0.06]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="border-brand-blue/25 bg-brand-blue/10 group-hover:border-brand-coral/40 mb-4 flex size-11 items-center justify-center rounded-lg border transition-colors">
                  <Icon className="text-brand-blue size-5" />
                </div>

                <h3 className="font-display text-xl text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
