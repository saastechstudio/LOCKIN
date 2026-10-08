import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { getProgression } from "@/lib/actions/progression";
import { LEVEL_MAX, levelName, pointsToNextLevel } from "@/lib/lockin-level";
import { LockIcon } from "@/components/lockin/lock-icon";
import { Eyebrow, PageHeader, SLOGAN, Stat } from "@/components/lockin/primitives";
import { VerticalBars } from "@/components/lockin/vertical-bars";

export const dynamic = "force-dynamic";

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });
const fullFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export default async function ProgressionPage() {
  await requireLockinOnboarded("/dashboard/progression");
  const data = await getProgression();
  const toNext = pointsToNextLevel(data.score7);

  return (
    <div className="mx-auto max-w-5xl space-y-14">
      <PageHeader
        eyebrow="Progression"
        title={SLOGAN}
        description="Ta discipline, jour après jour. Le seul adversaire qui compte, c'est toi d'hier."
      />

      <section className="grid gap-8 sm:grid-cols-4">
        <div className="flex items-center gap-4 border-t border-lk-line pt-4 sm:col-span-1">
          <LockIcon level={data.level} max={LEVEL_MAX} className="h-14 w-[42px]" />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-stone-3 uppercase">
              Niveau {data.level}/{LEVEL_MAX}
            </p>
            <p className="font-display text-xl">{levelName(data.level)}</p>
          </div>
        </div>
        <Stat
          label="Discipline 7 j"
          value={data.score7}
          hint={toNext === null ? "Palier maximal" : `${toNext} pts avant le palier suivant`}
        />
        <Stat label="Jours notés" value={`${data.ratedDays}/30`} hint="Sur les 30 derniers jours" />
        <Stat label="Priorités tenues" value={data.completedTasks} hint="Focus du jour accompli" />
      </section>

      <section>
        <Eyebrow>Discipline · 30 jours</Eyebrow>
        <p className="mt-2 mb-6 text-sm text-lk-stone-3">
          Ta note de discipline quotidienne. Aujourd&apos;hui en bleu-vert ; un tiret = journée non notée.
        </p>
        <VerticalBars
          height={200}
          bars={data.days.map((d, i) => ({
            key: d.date.toISOString(),
            value: d.value,
            label: i % 5 === 4 || i === data.days.length - 1 ? dayFormat.format(d.date) : "",
            title: `${fullFormat.format(d.date)} : ${d.value === null ? "non notée" : d.value / 10 + "/10"}`,
            live: i === data.days.length - 1,
          }))}
        />
      </section>

      <section>
        <Eyebrow>Objectifs</Eyebrow>
        {data.goals.length === 0 ? (
          <p className="mt-4 text-sm text-lk-stone-3">
            Aucun objectif.{" "}
            <Link href="/dashboard/objectifs" className="underline underline-offset-4">
              Fixe ton premier objectif à 30, 60 ou 90 jours
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6">
            <VerticalBars
              height={180}
              bars={data.goals.map((g) => ({
                key: String(g.id),
                value: g.progress,
                label: `${g.progress}%`,
                title: `${g.title} : ${g.progress}%`,
                accent: g.progress >= 100,
              }))}
            />
            <ol className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {data.goals.map((g, i) => (
                <li key={g.id} className="flex gap-3 border-t border-lk-line pt-2">
                  <span className="text-xs text-lk-gold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{g.title}</span>
                  <span className="text-xs text-lk-stone-3">
                    {g.horizonDays ? `${g.horizonDays} j` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section>
        <Eyebrow>Challenges</Eyebrow>
        {data.challenges.length === 0 ? (
          <p className="mt-4 text-sm text-lk-stone-3">
            Aucun challenge en cours.{" "}
            <Link href="/dashboard/challenges" className="underline underline-offset-4">
              Choisis un challenge de 7 ou 30 jours
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6">
            <VerticalBars
              height={140}
              bars={data.challenges.map((c) => ({
                key: c.slug,
                value: Math.round((c.done / c.durationDays) * 100),
                label: `${c.done}/${c.durationDays}`,
                title: `${c.title} : ${c.done} jours sur ${c.durationDays}`,
                accent: c.done >= c.durationDays,
              }))}
            />
            <ol className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {data.challenges.map((c) => (
                <li key={c.slug} className="border-t border-lk-line pt-2">
                  <Link href={`/dashboard/challenges/${c.slug}`} className="hover:underline">
                    {c.title}
                  </Link>{" "}
                  <span className="text-xs text-lk-stone-3">· {c.durationDays} jours</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
