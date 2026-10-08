import type { Metadata } from "next";
import { ChartColumn, LifeBuoy, Rows3, Swords, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/lockin/icon";
import { LockIcon } from "@/components/lockin/lock-icon";
import { LogoMark } from "@/components/lockin/logo-mark";
import { Logo } from "@/components/lockin/logo";
import { Eyebrow, Section, Slogan, Stat, Title } from "@/components/lockin/primitives";
import { VerticalBars } from "@/components/lockin/vertical-bars";
import { LEVEL_MAX, levelName } from "@/lib/lockin-level";
import { FeatureCard } from "@/components/landing/feature-card";
import { Features } from "@/sections/features";
import { Pricing, type PricingPlan } from "@/sections/pricing";
import { Testimonials } from "@/sections/testimonials";

export const metadata: Metadata = {
  title: "Design system — Lockin Social Club",
  robots: { index: false },
};

const PALETTE = [
  { group: "Fonds anti-fatigue", name: "Blanc cassé", token: "lk-white", hex: "#FAF9F7", className: "bg-lk-white border border-lk-line" },
  { group: "Fonds anti-fatigue", name: "Beige crème", token: "lk-mist", hex: "#F5F2EE", className: "bg-lk-mist border border-lk-line" },
  { group: "Gris chauds", name: "Filet", token: "lk-line", hex: "#E7E3DF", className: "bg-lk-line" },
  { group: "Gris chauds", name: "Pierre", token: "lk-stone-2", hex: "#B8B3AE", className: "bg-lk-stone-2" },
  { group: "Gris chauds", name: "Béton", token: "lk-stone-3", hex: "#6A6764", className: "bg-lk-stone-3" },
  { group: "Focus", name: "Bleu focus", token: "lk-blue", hex: "#3E5C8A", className: "bg-lk-blue" },
  { group: "Focus", name: "Bleu survol", token: "lk-blue-soft", hex: "#4A6FA5", className: "bg-lk-blue-soft" },
  { group: "Dynamique", name: "Corail doux", token: "lk-coral", hex: "#D97A5A", className: "bg-lk-coral" },
  { group: "Dynamique", name: "Doré mat", token: "lk-gold", hex: "#C9A86A", className: "bg-lk-gold" },
  { group: "Premium", name: "Marron profond", token: "lk-black", hex: "#2C1E1A", className: "bg-lk-black" },
];

const RULES = [
  "Fond blanc cassé ou beige crème : jamais de blanc pur en fond de page. Le blanc pur est réservé aux cartes.",
  "Texte en marron profond, secondaire en gris béton (5,2:1). Le texte courant n'est jamais en corail ni en doré.",
  "Un seul bleu pour agir : #3E5C8A, #4A6FA5 au survol. Le corail marque l'énergie, le doré les paliers et le survol des cartes.",
  "Rayons doux (12 à 24 px), ombres ultra-diffuses teintées de marron. Aucune ombre noire, aucun halo vif.",
  "Mouvement court : fade-in + glissement de 10 px, 0,7 s maximum. Tout s'éteint sous prefers-reduced-motion.",
  "Anti-dopamine : « Respect » au lieu du like, pas de cœur, pas d'emoji, pas de compteur public.",
  "Graphiques en barres verticales uniquement. Pas de camembert.",
];

/*
 * Contenus d'exemple : ils servent uniquement à montrer les sections
 * Témoignages et Tarifs. Ils ne sont montés sur aucune page publique.
 */
const SAMPLE_TESTIMONIALS = [
  { quote: "Exemple de citation courte, pour montrer la mise en page.", name: "Prénom N.", role: "Membre" },
  { quote: "Une seconde citation d'exemple, un peu plus longue que la première pour tester les retours à la ligne.", name: "Prénom N.", role: "Membre" },
  { quote: "Une troisième citation d'exemple.", name: "Prénom N.", role: "Membre" },
];

const SAMPLE_PLANS: PricingPlan[] = [
  { name: "Plan A", price: "0 €", description: "Description d'exemple.", features: ["Fonctionnalité un", "Fonctionnalité deux"], cta: "Choisir", href: "#tarifs" },
  { name: "Plan B", price: "00 €", period: "/ mois", description: "Plan recommandé : accent bleu.", features: ["Tout du plan A", "Fonctionnalité trois", "Fonctionnalité quatre"], cta: "Choisir", href: "#tarifs", recommended: true },
  { name: "Plan C", price: "00 €", period: "/ mois", description: "Description d'exemple.", features: ["Tout du plan B", "Fonctionnalité cinq"], cta: "Choisir", href: "#tarifs" },
];

/** Référence vivante du design system : chaque élément est rendu par le vrai composant. */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-lk-white text-lk-black">
      <header className="border-b border-lk-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="sm" />
          <span className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
            Design system
          </span>
        </div>
      </header>

      <Section>
        <Eyebrow gold>Lockin Social Club</Eyebrow>
        <Slogan className="mt-6" />
        <ul className="mt-12 grid gap-x-10 gap-y-4 border-t border-lk-line pt-6 text-sm sm:grid-cols-2">
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
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {PALETTE.map((c) => (
            <div key={c.token}>
              <div className={`h-24 rounded-2xl shadow-sm ${c.className}`} />
              <p className="mt-3 text-sm font-medium">{c.name}</p>
              <p className="text-xs text-lk-stone-3">
                {c.hex} · {c.token}
              </p>
              <p className="text-[11px] text-lk-stone-2">{c.group}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Typographie</Eyebrow>
        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div>
            <Title size="xl">Neue Montreal</Title>
            <p className="mt-2 text-sm text-lk-stone-3">
              Titres · font-display · 500, interlettrage -0,03 em. Police sous licence : tant qu&apos;elle
              n&apos;est pas installée, Space Grotesk la remplace.
            </p>
          </div>
          <div>
            <p className="text-2xl">Inter</p>
            <p className="mt-2 text-sm text-lk-stone-3">Texte et interface · 400 / 500 / 600</p>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Profondeur · ombres et rayons</Eyebrow>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {(["shadow-xs", "shadow-sm", "shadow-md", "shadow-xl"] as const).map((shadow) => (
            <div key={shadow} className={`flex h-28 items-end rounded-2xl border border-lk-line bg-lk-surface p-4 text-xs text-lk-stone-3 ${shadow}`}>
              {shadow}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Cartes · survol doré, icône line-art animée</Eyebrow>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <FeatureCard icon={Target} index={0} title="Carte premium" description="Fond blanc, filet chaud, ombre ultra-douce. Survole-la." />
          <FeatureCard icon={Rows3} index={1} title="Icône animée" description="Le trait de l'icône se redessine au survol de la carte." />
          <FeatureCard icon={ChartColumn} index={2} title="Hiérarchie" description="Chiffre discret en gris pierre, doré au survol." />
        </div>
      </Section>

      <Section>
        <Eyebrow>Logo officiel · icônes de niveau</Eyebrow>
        <div className="mt-6 flex flex-wrap items-end gap-10">
          <LogoMark className="h-24" title="Lockin" />
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
          <Button size="lg">Grand CTA</Button>
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
                live: i === a.length - 1,
              }))}
            />
          </div>
        </div>
      </Section>

      <Features />
      <Testimonials items={SAMPLE_TESTIMONIALS} />
      <Pricing plans={SAMPLE_PLANS} />

      <Section tone="black" className="border-b-0">
        <Slogan as="p" size="xl" className="text-lk-white" />
      </Section>
    </div>
  );
}
