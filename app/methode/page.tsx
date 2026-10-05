import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PillarsSection } from "@/components/marketing/pillars-section";
import { Pillars } from "@/components/marketing/pillars";
import { MethodologySection } from "@/components/marketing/methodology-section";
import { DiscordCta } from "@/components/marketing/discord-cta";

/**
 * La Méthode Lock In (audit, feuille de route, Coach IA, suivi quotidien)
 * — incluse gratuitement pour chaque membre du club, comme tout le reste :
 * seuls les Lock-In Camp sont payants.
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
            Incluse gratuitement pour chaque membre du club : audit
            d&apos;entrée, feuille de route personnalisée, Coach IA et suivi
            quotidien.
          </p>
        </section>
        <PillarsSection />
        <Pillars />
        <MethodologySection />
        <DiscordCta />
      </main>
      <SiteFooter />
    </div>
  );
}
