import { GOAL_DOMAINS, type LockinTag } from "@/lib/social/data";
import { cn } from "@/lib/utils";

type GoalScreenProps = {
  domain: LockinTag | null;
  onDomainChange: (domain: LockinTag) => void;
  subGoal: string;
  onSubGoalChange: (value: string) => void;
};

/** Écran 2 — l'objectif 30 jours devient une ligne du module Objectifs. */
export function GoalScreen({ domain, onDomainChange, subGoal, onSubGoalChange }: GoalScreenProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-black/50 uppercase">
        Écran 02 — Objectif 30 jours
      </p>
      <h1 className="font-display mt-3 text-3xl text-lk-black sm:text-4xl sm:text-3xl">
        Sur quoi tu te concentres ?
      </h1>
      <p className="mt-2 text-sm text-camp-charcoal/60">
        Choisis un domaine. Tu pourras en ajouter d&apos;autres plus tard
        dans Objectifs.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-px bg-camp-hairline sm:grid-cols-3">
        {GOAL_DOMAINS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onDomainChange(option)}
            className={cn(
              "border border-camp-hairline bg-camp-white px-3 py-4 text-center text-xs font-semibold tracking-[0.08em] uppercase transition-colors",
              domain === option
                ? "border-camp-charcoal bg-camp-charcoal text-camp-white"
                : "text-camp-charcoal hover:border-camp-charcoal",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <label className="mt-6 block">
        <span className="text-[11px] font-semibold tracking-[0.08em] text-camp-charcoal/60 uppercase">
          Sous-objectif (optionnel)
        </span>
        <input
          value={subGoal}
          onChange={(e) => onSubGoalChange(e.target.value)}
          maxLength={140}
          placeholder="Ex. : courir 5 km trois fois par semaine"
          className="mt-2 w-full border border-camp-hairline bg-camp-white px-4 py-3 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
        />
      </label>
    </div>
  );
}
