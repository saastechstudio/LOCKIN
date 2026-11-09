import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getOrCreateDbUser } from "@/lib/auth";
import { isClubMember } from "@/lib/club/access";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { conversationTitle } from "@/lib/channel/queries";
import { eq } from "drizzle-orm";
import { loadLifeOs } from "@/lib/life-os/snapshot";
import { GoalComposer } from "@/components/goals/goal-composer";
import { LivingGoal } from "@/components/goals/living-goal";
import { HabitsToday } from "@/components/cockpit/habits-today";

export const dynamic = "force-dynamic";

/**
 * Mode immersif : on a plongé dans une planète de la SphereLife. Ici, tout ce
 * qui fait vivre ce domaine : son score, son énergie, ses objectifs, ses
 * habitudes, ce qui l'influence et ce qu'elle influence.
 */
export default async function SpherePage({ params }: PageProps<"/dashboard/sphere/[id]">) {
  const { id } = await params;
  const sphereId = Number(id);
  if (!Number.isInteger(sphereId) || sphereId <= 0) notFound();

  const user = await getOrCreateDbUser();
  const snapshot = await loadLifeOs(user);
  const sphere = snapshot.spheres.find((s) => s.id === sphereId);
  if (!sphere) notFound();

  const spheres = snapshot.spheres.map((s) => ({ id: s.id, name: s.name, color: s.color }));
  const name = (sid: number) => snapshot.spheres.find((s) => s.id === sid)?.name ?? "?";
  const goals = snapshot.goals.filter((g) => g.sphereId === sphere.id);
  const habits = snapshot.habits.filter((h) => h.sphereId === sphere.id);
  const signals = snapshot.sphereSignals.filter((s) => s.sphereId === sphere.id);
  const influences = snapshot.links.filter((l) => l.from === sphere.id);
  const influencedBy = snapshot.links.filter((l) => l.to === sphere.id);
  const linkedConversations = await db.query.conversations.findMany({
    where: eq(conversations.sphereId, sphere.id),
    columns: { id: true, kind: true, title: true },
    with: { members: { with: { user: { columns: { id: true, name: true, avatarUrl: true } } } } },
  });
  const myConversations = linkedConversations
    .filter((c) => c.members.some((m) => m.userId === user.id))
    .map((c) => ({ id: c.id, title: conversationTitle(c, c.members.map((m) => m.user), user.id) }));
  const { stats } = sphere;
  const glow = 0.25 + (stats.energy / 100) * 0.75;

  return (
    <div className="lk-sphere-enter mx-auto max-w-5xl space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-lk-stone-3 hover:text-lk-black">
        <ArrowLeft className="size-4" /> Retour à l&apos;univers
      </Link>

      <section className="lk-glass lk-edge relative overflow-hidden rounded-[28px] p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full blur-3xl"
          style={{ background: sphere.color, opacity: glow * 0.35 }}
        />
        <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="animate-float relative mx-auto size-44 sm:size-56">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 32% 28%, #FFFFFF 0%, ${sphere.color} 28%, #153617 78%)`,
                opacity: 0.35 + glow * 0.65,
                boxShadow: `0 0 ${40 + stats.energy}px ${sphere.color}, inset -18px -24px 60px rgba(11,34,16,0.85)`,
              }}
            />
            <div className="absolute inset-[-14px] rounded-full border" style={{ borderColor: `${sphere.color}55` }} />
            {stats.level >= 4 ? (
              <div className="absolute inset-[-34px] rotate-[-18deg] scale-y-[0.32] rounded-full border-2" style={{ borderColor: `${sphere.color}aa` }} />
            ) : null}
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Sphère · niveau {stats.level}</p>
            <h1 className="font-display mt-2 text-4xl text-lk-black sm:text-5xl">{sphere.name}</h1>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Score", stats.score],
                ["Progression", `${stats.progress} %`],
                ["Énergie", stats.energy],
                ["Part de l'effort", `${stats.effortShare} %`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-lk-line bg-lk-surface px-4 py-3">
                  <dt className="text-[10px] tracking-[0.2em] text-lk-stone-3 uppercase">{label}</dt>
                  <dd className="font-display mt-1 text-2xl text-lk-black tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-lk-stone-3">
              {stats.idleDays === null
                ? "Aucune activité encore : ajoute un objectif ou une habitude pour allumer cette sphère."
                : stats.idleDays === 0
                  ? "Active aujourd'hui."
                  : `Dernière activité il y a ${stats.idleDays} jour${stats.idleDays > 1 ? "s" : ""}.`}
            </p>
          </div>
        </div>
      </section>

      {signals.length > 0 ? (
        <ul className="space-y-2">
          {signals.map((s) => (
            <li key={s.id} className="lk-glass rounded-2xl px-4 py-3 text-sm text-lk-black">
              <span className="text-lk-stone-3">Copilote · </span>
              {s.message}
            </li>
          ))}
        </ul>
      ) : null}

      {influences.length + influencedBy.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {influencedBy.map((l) => (
            <Link key={`in-${l.id}`} href={`/dashboard/sphere/${l.from}`} className="lk-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-lk-stone-3 hover:text-lk-black">
              {name(l.from)} <ArrowRight className="size-3" /> <span className="text-lk-black">{sphere.name}</span>
            </Link>
          ))}
          {influences.map((l) => (
            <Link key={`out-${l.id}`} href={`/dashboard/sphere/${l.to}`} className="lk-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-lk-stone-3 hover:text-lk-black">
              <span className="text-lk-black">{sphere.name}</span> <ArrowRight className="size-3" /> {name(l.to)}
            </Link>
          ))}
        </section>
      ) : null}

      {myConversations.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Conversations liées</p>
          <div className="flex flex-wrap gap-2">
            {myConversations.map((c) => (
              <Link key={c.id} href={`/dashboard/messages/c/${c.id}`} className="lk-glass lk-lift inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-lk-black">
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Objectifs · {sphere.name}</p>
        <GoalComposer spheres={spheres} defaultSphereId={sphere.id} />
        {goals.map((goal, i) => (
          <LivingGoal key={goal.id} goal={goal} spheres={spheres} canShare={isClubMember(user)} defaultOpen={i === 0} />
        ))}
      </section>

      <section>
        <HabitsToday habits={habits} />
        {habits.length === 0 ? (
          <p className="mt-3 text-xs text-lk-stone-3">
            Relie une habitude à cette sphère depuis la page{" "}
            <Link href="/dashboard/habitudes" className="underline underline-offset-4">
              Habitudes
            </Link>
            .
          </p>
        ) : null}
      </section>
    </div>
  );
}
