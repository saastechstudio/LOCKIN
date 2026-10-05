import type { Metadata } from "next";
import { ChartColumn, LifeBuoy, Rows3, Swords, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/lockin/icon";
import { LockIcon } from "@/components/lockin/lock-icon";
import { Logo } from "@/components/lockin/logo";
import { Eyebrow, Section, Slogan, Stat, Title } from "@/components/lockin/primitives";
import { VerticalBars } from "@/components/lockin/vertical-bars";
import { LEVEL_MAX, levelName } from "@/lib/lockin-level";

export const metadata: Metadata = {
  title: "Design system — Lockin Social Club",
  robots: { index: false },
};

const PALETTE = [
  { name: "Blanc", token: "lk-white", hex: "#FFFFFF", className: "bg-lk-white border border-lk-line" },
  { name: "Noir", token: "lk-black", hex: "#000000", className: "bg-lk-black" },
  { name: "Gris 1", token: "lk-ink-1", hex: "#111111", className: "bg-lk-ink-1" },
  { name: "Gris 2", token: "lk-ink-2", hex: "#222222", className: "bg-lk-ink-2" },
  { name: "Gris 3", token: "lk-ink-3", hex: "#333333", className: "bg-lk-ink-3" },
  { name: "Doré mat", token: "lk-gold", hex: "#C6A667", className: "bg-lk-gold" },
];

const RULES = [
  "Angles droits partout. Aucune courbe, aucun rayon.",
  "Aucun dégradé, aucune ombre floue, aucun effet de verre.",
  "Le doré est un accent : un chiffre, un filet, un palier. Jamais un fond d'action.",
  "Anti-dopamine : « Respect » au lieu du like, pas de cœur, pas d'emoji, pas de compteur public.",
  "Graphiques en barres verticales uniquement. Pas de camembert.",
  "Interaction : un changement d'opacité ou une inversion noir/blanc. Rien qui bouge pour décorer.",
];

/** Référence vivante du design system : chaque élément est rendu par le vrai composant. */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-lk-white text-lk-black">
      <header className="border-b border-lk-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="sm" />
          <span className="text-[11px] font-semibold tracking-[0.25em] text-lk-black/50 uppercase">
            Design system
          </span>
        </div>
      </header>

      <Section>
        <Eyebrow gold>Lockin Social Club</Eyebrow>
        <Slogan className="mt-6" />
        <ul className="mt-12 grid gap-x-10 gap-y-4 border-t border-lk-black pt-6 text-sm sm:grid-cols-2">
          {RULES.map((rule, i) => (
            <li key={rule} className="flex gap-4">
              <span className="text-xs text-lk-gold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {rule}
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Eyebrow>Palette</Eyebrow>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-6">
          {PALETTE.map((c) => (
            <div key={c.token}>
              <div className={`h-24 ${c.className}`} />
              <p className="mt-3 text-sm font-medium">{c.name}</p>
              <p className="text-xs text-lk-black/50">
                {c.hex} · {c.token}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Typographie</Eyebrow>
        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div>
            <Title size="xl">Space Grotesk</Title>
            <p className="mt-2 text-sm text-lk-black/60">Titres · font-display · 700, interlettrage -0,03 em</p>
          </div>
          <div>
            <p className="text-2xl">Inter</p>
            <p className="mt-2 text-sm text-lk-black/60">Texte et interface · 400 / 500 / 600</p>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Cadenas · logo et niveau</Eyebrow>
        <div className="mt-6 flex flex-wrap items-end gap-10">
          <LockIcon className="h-24 w-[72px]" />
          <LockIcon className="h-24 w-[72px]" solid={false} />
          {Array.from({ length: LEVEL_MAX }, (_, i) => i + 1).map((level) => (
            <div key={level} className="text-center">
              <LockIcon level={level} className="h-16 w-12" />
              <p className="mt-2 text-xs">{level} · {levelName(level)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Boutons</Eyebrow>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button>Entrer dans le club</Button>
          <Button variant="outline">Respect</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="link">Lien</Button>
        </div>
      </Section>

      <Section>
        <Eyebrow>Icônes géométriques</Eyebrow>
        <div className="mt-6 flex flex-wrap gap-3">
          {[Rows3, Target, ChartColumn, Swords, LifeBuoy].map((I, i) => (
            <Icon key={i} icon={I} framed />
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Données</Eyebrow>
        <div className="mt-6 grid gap-10 sm:grid-cols-3">
          <Stat label="Discipline 7 j" value={74} hint="16 pts avant le palier suivant" />
          <div className="sm:col-span-2">
            <VerticalBars
              height={140}
              bars={[60, 70, null, 80, 50, 90, 70, 60, 80, 90, 70, 80, 90, 100].map((v, i, a) => ({
                key: String(i),
                value: v,
                label: String(i + 1),
                accent: i === a.length - 1,
              }))}
            />
          </div>
        </div>
      </Section>

      <Section tone="black">
        <Slogan as="p" size="xl" className="text-lk-white" />
      </Section>
    </div>
  );
}
