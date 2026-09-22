import { Compass, Hammer, Rocket, Anchor } from "lucide-react";

import { METHODOLOGY_NAME, METHODOLOGY_STAGES } from "@/lib/methodology";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STAGE_ICONS = [Compass, Hammer, Rocket, Anchor];

export function MethodologySection() {
  return (
    <section id="methode" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-blue-deep uppercase">
            {METHODOLOGY_NAME}
          </span>
          <h2 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">
            Un seul cadre, tous les profils
          </h2>
          <p className="mt-4 text-muted-foreground">
            Peu importe ton secteur, ton niveau de revenus ou ton objectif —
            chaque membre progresse selon les 4 mêmes étapes. C&apos;est le
            contenu qui s&apos;adapte à toi, jamais la structure.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METHODOLOGY_STAGES.map((stage, i) => {
            const Icon = STAGE_ICONS[i];
            return (
              <Card key={stage.id} className="surface">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-lg border border-brand-blue/25 bg-brand-blue/10">
                      <Icon className="size-5 text-brand-blue" />
                    </div>
                    <span className="font-display text-xs text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <CardTitle className="font-display text-lg">
                    {stage.name}
                  </CardTitle>
                  <p className="text-xs font-medium text-brand-coral">
                    {stage.tagline}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {stage.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {stage.shareOfDuration}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
