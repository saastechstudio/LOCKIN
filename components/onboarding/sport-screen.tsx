import { SPORT_ACTIVITIES } from "@/lib/social/data";
import { cn } from "@/lib/utils";

type SportScreenProps = {
  value: string | null;
  onChange: (sportId: string) => void;
};

/** Écran 3 — devient `users.mainSport`, réutilisé partout dans le profil et les groupes. */
export function SportScreen({ value, onChange }: SportScreenProps) {
  return (
    <div>
      <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
        Écran 03 — Sport Lockin
      </p>
      <h1 className="font-display mt-3 text-2xl font-bold text-camp-charcoal uppercase sm:text-3xl">
        Quel est ton sport principal ?
      </h1>
      <p className="mt-2 text-sm text-camp-charcoal/60">
        Le même que celui du Lock-In Camp et des groupes sport.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-px bg-camp-hairline sm:grid-cols-3">
        {SPORT_ACTIVITIES.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => onChange(sport.id)}
            className={cn(
              "flex flex-col items-center gap-2 border border-camp-hairline bg-camp-white px-3 py-5 text-center transition-colors",
              value === sport.id
                ? "border-camp-charcoal bg-camp-charcoal text-camp-white"
                : "text-camp-charcoal hover:border-camp-charcoal",
            )}
          >
            <span className="text-xl" aria-hidden>
              {sport.emoji}
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.06em] uppercase">
              {sport.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
