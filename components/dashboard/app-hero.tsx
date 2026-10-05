import { LockIcon } from "@/components/lockin/lock-icon";
import { Slogan } from "@/components/lockin/primitives";
import { LEVEL_MAX, disciplineLevel, levelName, pointsToNextLevel } from "@/lib/lockin-level";

/**
 * Hero de l'application : le slogan, le cadenas de niveau et les trois
 * chiffres du jour. Aplat noir, aucun effet : c'est le seuil de l'app.
 */
export function AppHero({
  firstName,
  discipline,
  progress,
  activeGoals,
}: {
  firstName: string;
  /** Score de discipline 0–100 (moyenne des 7 derniers jours). */
  discipline: number;
  /** Progression moyenne des objectifs, 0–100. */
  progress: number;
  activeGoals: number;
}) {
  const level = disciplineLevel(discipline);
  const toNext = pointsToNextLevel(discipline);

  return (
    <section className="bg-lk-black text-lk-white">
      <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-gold uppercase">
            {firstName}, ton combat du jour
          </p>
          <Slogan size="xl" className="mt-6 text-lk-white" />
        </div>

        <div className="flex items-end gap-5 lg:col-span-4 lg:justify-end">
          <LockIcon
            level={level}
            max={LEVEL_MAX}
            className="h-20 w-[60px] text-lk-white"
            title={`Niveau ${level} sur ${LEVEL_MAX}`}
          />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-white/50 uppercase">
              Niveau {level}/{LEVEL_MAX}
            </p>
            <p className="font-display mt-1 text-2xl">{levelName(level)}</p>
            <p className="mt-1 text-xs text-lk-white/50">
              {toNext === null ? "Palier maximal atteint." : `${toNext} pts pour le palier suivant`}
            </p>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-3 border-t border-lk-white/15">
        {[
          { label: "Discipline 7 j", value: `${discipline}` },
          { label: "Progression", value: `${progress}%` },
          { label: "Objectifs actifs", value: `${activeGoals}` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`px-4 py-5 sm:px-10 ${i > 0 ? "border-l border-lk-white/15" : ""}`}
          >
            <dt className="text-[10px] font-semibold tracking-[0.2em] text-lk-white/50 uppercase sm:text-[11px]">
              {stat.label}
            </dt>
            <dd className="font-display mt-2 text-3xl tabular-nums sm:text-4xl">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
