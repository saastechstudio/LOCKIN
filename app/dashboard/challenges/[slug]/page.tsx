import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getChallenge } from "@/lib/actions/challenges";
import { cn } from "@/lib/utils";
import { LockIcon } from "@/components/lockin/lock-icon";
import { Eyebrow, PageHeader } from "@/components/lockin/primitives";
import { ChallengeActions } from "@/components/challenges/challenge-actions";

export const dynamic = "force-dynamic";

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireLockinOnboarded(`/dashboard/challenges/${slug}`);
  const challenge = await getChallenge(slug);
  if (!challenge) notFound();

  const { mine } = challenge;

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <Link
        href="/dashboard/challenges"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-black/60 hover:text-lk-black"
      >
        <ArrowLeft className="size-3.5" /> Challenges
      </Link>

      <PageHeader
        eyebrow={`Challenge · ${challenge.durationDays} jours`}
        title={challenge.title}
        description={challenge.description}
        actions={<ChallengeActions challengeId={challenge.id} mine={mine} />}
      />

      {mine ? (
        <section>
          <Eyebrow>
            {mine.finished
              ? `Terminé · ${mine.done} jours tenus sur ${challenge.durationDays}`
              : `Jour ${mine.dayIndex} sur ${challenge.durationDays} · ${mine.done} validé${mine.done > 1 ? "s" : ""}`}
          </Eyebrow>
          {/* Une case par jour : pleine = tenu, vide = manqué ou à venir. */}
          <ol
            className={cn(
              "mt-4 grid gap-1",
              challenge.durationDays === 7 ? "grid-cols-7" : "grid-cols-10",
            )}
          >
            {mine.days.map((done, i) => (
              <li
                key={i}
                className={cn(
                  "flex aspect-square items-end justify-start border p-1 text-[10px] tabular-nums",
                  done ? "border-lk-black bg-lk-black text-lk-white" : "border-lk-line text-lk-black/40",
                  !mine.finished && i + 1 === mine.dayIndex && !done && "border-lk-gold",
                )}
                title={`Jour ${i + 1}${done ? " : tenu" : ""}`}
              >
                {i + 1}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section>
        <Eyebrow>Classement · jours tenus</Eyebrow>
        {challenge.leaderboard.length === 0 ? (
          <p className="mt-4 text-sm text-lk-black/60">Personne n&apos;a encore relevé ce challenge.</p>
        ) : (
          <ol className="mt-4 border-t border-lk-black">
            {challenge.leaderboard.map((row, i) => (
              <li
                key={row.user.id}
                className={cn(
                  "flex items-center gap-4 border-b border-lk-line py-3",
                  row.isMe && "bg-lk-mist",
                )}
              >
                <span className="w-8 pl-2 text-xs text-lk-gold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <LockIcon level={row.user.lockinLevel} className="h-5 w-[15px]" />
                <Link href={`/dashboard/u/${row.user.id}`} className="flex-1 text-sm hover:underline">
                  {row.user.name ?? "Membre Lockin"}
                  {row.isMe ? <span className="text-lk-black/50"> · toi</span> : null}
                </Link>
                <span className="pr-2 text-sm tabular-nums">
                  {row.done}/{challenge.durationDays}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
