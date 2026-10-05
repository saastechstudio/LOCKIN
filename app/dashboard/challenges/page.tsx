import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { getChallenges } from "@/lib/actions/challenges";
import { Eyebrow, PageHeader } from "@/components/lockin/primitives";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  await requireLockinOnboarded("/dashboard/challenges");
  const challenges = await getChallenges();

  const groups = [
    { label: "7 jours", items: challenges.filter((c) => c.durationDays === 7) },
    { label: "30 jours", items: challenges.filter((c) => c.durationDays === 30) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <PageHeader
        eyebrow="Challenges"
        title="7 jours pour démarrer. 30 pour changer."
        description="Un engagement, une validation par jour. Le classement compte les jours tenus, rien d'autre."
      />

      {groups.map((group) => (
        <section key={group.label}>
          <Eyebrow>{group.label}</Eyebrow>
          <div className="mt-4 grid border-t border-l border-lk-line sm:grid-cols-3">
            {group.items.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/challenges/${c.slug}`}
                className="flex flex-col border-r border-b border-lk-line p-5 transition-colors hover:bg-lk-mist"
              >
                <p className="font-display text-lg">{c.title}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-lk-black/60">{c.description}</p>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="text-lk-black/50">
                    {c.participantCount} membre{c.participantCount > 1 ? "s" : ""}
                  </span>
                  {c.mine ? (
                    <span className="bg-lk-black px-2 py-1 font-medium text-lk-white">
                      {c.mine.finished
                        ? `Terminé · ${c.mine.done}/${c.durationDays}`
                        : `Jour ${c.mine.dayIndex}/${c.durationDays}`}
                    </span>
                  ) : (
                    <span className="border border-lk-black px-2 py-1 font-medium">Rejoindre</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
