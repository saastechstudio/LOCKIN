import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { getMentors } from "@/lib/actions/mentors";
import { LOCKIN_TAGS } from "@/lib/social/data";
import { cn } from "@/lib/utils";
import { LockIcon } from "@/components/lockin/lock-icon";
import { PageHeader } from "@/components/lockin/primitives";
import { MentorSettings } from "@/components/mentors/mentor-settings";

export const dynamic = "force-dynamic";

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ domaine?: string }>;
}) {
  const me = await requireLockinOnboarded("/dashboard/mentors");
  const { domaine } = await searchParams;
  const domain = LOCKIN_TAGS.find((t) => t === domaine);
  const mentors = await getMentors(domain);

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <PageHeader
        eyebrow="Mode Mentor"
        title="Ceux qui sont passés par là."
        description="Des membres qui ont déjà mené le combat que tu mènes, et qui donnent de leur temps. Écris-leur directement."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par domaine">
        {[undefined, ...LOCKIN_TAGS].map((tag) => (
          <Link
            key={tag ?? "tous"}
            href={tag ? `/dashboard/mentors?domaine=${encodeURIComponent(tag)}` : "/dashboard/mentors"}
            className={cn(
              "border px-3 py-1.5 text-xs font-medium",
              domain === tag ? "border-lk-line bg-lk-black text-lk-white" : "border-lk-line hover:border-lk-line",
            )}
          >
            {tag ?? "Tous"}
          </Link>
        ))}
      </nav>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {mentors.length === 0 ? (
            <p className="text-sm text-lk-stone-3">
              Aucun mentor {domain ? `en ${domain} ` : ""}pour l&apos;instant. Sois le premier.
            </p>
          ) : (
            <ul className="border-t border-lk-line">
              {mentors.map((m) => (
                <li key={m.id} className="flex flex-col gap-3 border-b border-lk-line py-5 sm:flex-row sm:items-start">
                  <LockIcon level={m.lockinLevel} className="h-8 w-6" title={`Niveau ${m.lockinLevel}`} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/u/${m.id}`} className="font-display text-lg hover:underline">
                      {m.name ?? "Membre Lockin"}
                    </Link>
                    <p className="text-xs text-lk-stone-3">
                      {[m.sector, [m.city, m.country].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                    </p>
                    {m.mentorPitch ? <p className="mt-2 text-sm leading-relaxed">{m.mentorPitch}</p> : null}
                    <p className="mt-2 text-[11px] font-semibold tracking-[0.15em] text-lk-gold uppercase">
                      {m.mentorDomains.join(" · ")}
                    </p>
                  </div>
                  {m.isMe ? null : (
                    <Link
                      href={`/dashboard/messages/${m.id}`}
                      className="shrink-0 border border-lk-line px-4 py-2 text-xs font-medium hover:bg-lk-black hover:text-lk-white"
                    >
                      Écrire
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <MentorSettings
            initial={{ isMentor: me.isMentor, domains: me.mentorDomains, pitch: me.mentorPitch ?? "" }}
          />
        </aside>
      </div>
    </div>
  );
}
