type MotivationScreenProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Écran 1 — ce texte devient le tout premier post de l'utilisateur dans le feed. */
export function MotivationScreen({ value, onChange }: MotivationScreenProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-black/50 uppercase">
        Écran 01 — Motivation
      </p>
      <h1 className="font-display mt-3 text-3xl text-lk-black sm:text-4xl sm:text-3xl">
        Pourquoi veux-tu devenir Lockin ?
      </h1>
      <p className="mt-2 text-sm text-camp-charcoal/60">
        Sois honnête. Ce texte devient ton premier post dans le feed — le
        premier pas du rituel.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        maxLength={600}
        placeholder="Je veux devenir Lockin parce que…"
        autoFocus
        className="mt-6 w-full resize-none border border-camp-hairline bg-camp-white px-4 py-3.5 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
      />
      <p className="mt-2 text-right text-[10px] text-camp-charcoal/40">
        {value.length} / 600
      </p>
    </div>
  );
}
