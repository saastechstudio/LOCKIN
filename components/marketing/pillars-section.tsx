import {
  CalendarCheck,
  Handshake,
  Activity,
  PiggyBank,
  Rocket,
  Scale,
  type LucideIcon,
} from "lucide-react";

import { Icon as LockinIcon } from "@/components/lockin/icon";

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
  humilite: Handshake,
  "vie-saine": Activity,
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
  return (
    <section id="pillars-values" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
            Le socle du club
          </span>
          <h2 className="font-display mt-4 text-3xl text-foreground sm:text-4xl">
            Les 6 Piliers de l&apos;Excellence
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ce que Lock In exige de chacun de ses membres, sans exception.
          </p>
        </div>

        <div className="mt-14 grid border-t border-l border-lk-line sm:grid-cols-2 lg:grid-cols-3">
          {pillarsData.map((pillar, index) => {
            const Icon = ICONS[pillar.iconName];
            return (
              <div key={pillar.id} className="relative border-r border-b border-lk-line p-6">
                <span
                  aria-hidden
                  className="absolute top-5 right-6 text-xs font-medium text-lk-gold tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <LockinIcon icon={Icon} framed className="mb-5" />

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
