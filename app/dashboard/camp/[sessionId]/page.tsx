import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check } from "lucide-react";

import { getCampSession } from "@/lib/actions/camp";
import { CAMP_INCLUDED_ITEMS, CAMP_PROGRAM_BLOCKS, CAMP_DAY_STRUCTURE } from "@/lib/camp/data";
import { SectionTitle } from "@/components/camp/section-title";
import { CTAButton } from "@/components/camp/cta-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Même raison que app/dashboard/camp/page.tsx : places restantes en base.
export const dynamic = "force-dynamic";

export default async function CampSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: slug } = await params;
  const session = await getCampSession(slug);
  if (!session) notFound();

  const isFull = session.remainingSpots <= 0;

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] rounded-xl p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <SectionTitle
          eyebrow={session.destination}
          title={session.name}
          description={`${format(session.startDate, "d MMMM", { locale: fr })} – ${format(
            session.endDate,
            "d MMMM yyyy",
            { locale: fr },
          )}`}
        />

        <Tabs defaultValue="programme">
          <TabsList className="bg-camp-bg-deep">
            <TabsTrigger
              value="programme"
              className="data-[state=active]:bg-camp-brown data-[state=active]:text-camp-cream data-[state=active]:from-transparent data-[state=active]:to-transparent"
            >
              Programme
            </TabsTrigger>
            <TabsTrigger
              value="infos"
              className="data-[state=active]:bg-camp-brown data-[state=active]:text-camp-cream data-[state=active]:from-transparent data-[state=active]:to-transparent"
            >
              Infos pratiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programme" className="space-y-4 pt-4">
            <div className="rounded-lg border border-camp-border bg-camp-card p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-camp-brown-soft">
                Chaque journée
              </p>
              <div className="space-y-3">
                {CAMP_DAY_STRUCTURE.map((block) => (
                  <div key={block.period} className="flex gap-3">
                    <span className="w-24 shrink-0 text-xs font-semibold text-camp-sand">
                      {block.period}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-camp-brown-deep">{block.title}</p>
                      <p className="text-xs text-camp-brown-soft">{block.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-camp-border bg-camp-card p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-camp-brown-soft">
                Contenu Lock In
              </p>
              <ul className="grid grid-cols-2 gap-2 text-sm text-camp-brown-deep">
                {CAMP_PROGRAM_BLOCKS.map((block) => (
                  <li key={block} className="flex items-center gap-2">
                    <Check className="size-3.5 shrink-0 text-camp-sand" />
                    {block}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="infos" className="space-y-4 pt-4">
            <div className="rounded-lg border border-camp-border bg-camp-card p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-camp-brown-soft">
                  Prix
                </p>
                <p className="font-display text-2xl text-camp-brown-deep">
                  {session.pricePerPerson.toLocaleString("fr-FR")} €
                </p>
              </div>
              <p className="mt-1 text-xs text-camp-brown-soft">
                {isFull ? "Complet" : `${session.remainingSpots} places restantes sur ${session.totalSpots}`}
              </p>
            </div>

            <div className="rounded-lg border border-camp-border bg-camp-card p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-camp-brown-soft">
                Inclus
              </p>
              <ul className="space-y-2 text-sm text-camp-brown-deep">
                {CAMP_INCLUDED_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-3.5 shrink-0 text-camp-sand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <CTAButton
          className="w-full"
          disabled={isFull}
          asChild
        >
          <a href={`/dashboard/camp/${session.slug}/reserver`}>
            {isFull ? "Session complète" : "Réserver ma place"}
          </a>
        </CTAButton>
      </div>
    </div>
  );
}
