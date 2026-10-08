import { EVENING_ROUTINE_CHOICES, MORNING_ROUTINE_CHOICES } from "@/lib/social/data";
import { cn } from "@/lib/utils";

type RoutineScreenProps = {
  morning: string | null;
  onMorningChange: (value: string) => void;
  evening: string | null;
  onEveningChange: (value: string) => void;
};

function RoutineChoiceList({
  choices,
  value,
  onChange,
}: {
  choices: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="divide-y divide-camp-hairline border border-camp-hairline">
      {choices.map((choice) => (
        <button
          key={choice}
          type="button"
          onClick={() => onChange(choice)}
          className={cn(
            "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors",
            value === choice
              ? "bg-camp-charcoal text-camp-white"
              : "text-camp-charcoal hover:bg-camp-cream",
          )}
        >
          {choice}
          {value === choice ? <span className="text-xs text-camp-gold">✓</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Écran 4 — deux lignes `routineItems` (matin / soir), affichées ensuite dans Objectifs. */
export function RoutineScreen({ morning, onMorningChange, evening, onEveningChange }: RoutineScreenProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
        Écran 04 — Routine
      </p>
      <h1 className="font-display mt-3 text-3xl text-lk-black sm:text-4xl sm:text-3xl">
        Tes deux rituels quotidiens
      </h1>
      <p className="mt-2 text-sm text-lk-stone-3">
        Un le matin, un le soir. Tu les coches chaque jour dans Objectifs.
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-lk-stone-3 uppercase">
            Routine du matin
          </p>
          <RoutineChoiceList choices={MORNING_ROUTINE_CHOICES} value={morning} onChange={onMorningChange} />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-lk-stone-3 uppercase">
            Routine du soir
          </p>
          <RoutineChoiceList choices={EVENING_ROUTINE_CHOICES} value={evening} onChange={onEveningChange} />
        </div>
      </div>
    </div>
  );
}
