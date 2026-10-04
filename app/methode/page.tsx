import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PillarsSection } from "@/components/marketing/pillars-section";
import { Pillars } from "@/components/marketing/pillars";
import { MethodologySection } from "@/components/marketing/methodology-section";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { DiscordCta } from "@/components/marketing/discord-cta";

/**
 * L'accompagnement individuel payant (audit, feuille de route, Coach IA,
 * suivi quotidien) — distinct du Lockin Social Club gratuit qui vit sur
 * la page d'accueil. Anciennement sur "/", déplacé ici pour laisser la
 * home entièrement dédiée au Social Club.
 */
export default function MethodePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background bg-noise">
      <SiteHeader />
      <main className="flex-1">
        <section className="px-6 pt-20 pb-8 text-center">
          <p className="text-xs tracking-[0.2em] text-brand-coral uppercase">
            La Méthode Lock In
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-2xl text-4xl text-foreground sm:text-5xl">
            L&apos;accompagnement individuel pour passer au niveau supérieur
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Au-delà du Social Club gratuit, La Méthode Lock In est notre
            programme de coaching structuré : audit d&apos;entrée, feuille
            de route personnalisée, Coach IA et suivi quotidien.
          </p>
        </section>
        <PillarsSection />
        <Pillars />
        <MethodologySection />
        <Pricing />
        <Faq />
        <DiscordCta />
      </main>
      <SiteFooter />
    </div>
  );
}
