import { Slogan } from "@/components/lockin/primitives";
import { SPORT_ACTIVITIES, type LockinTag } from "@/lib/social/data";

type ConfirmationScreenProps = {
  data: {
    motivation: string;
    goalDomain: LockinTag | null;
    subGoal: string;
    mainSport: string | null;
    morningRoutine: string | null;
    eveningRoutine: string | null;
  };
};

/** Écran 5 — récapitulatif avant la création réelle du compte Lockin. */
export function ConfirmationScreen({ data }: ConfirmationScreenProps) {
  const sport = SPORT_ACTIVITIES.find((s) => s.id === data.mainSport);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Motivation", value: data.motivation ?? "—" },
    {
      label: "Objectif 30 jours",
      value: [data.goalDomain, data.subGoal].filter(Boolean).join(" · ") || "—",
    },
    { label: "Sport principal", value: sport ? `${sport.emoji} ${sport.name}` : "—" },
    { label: "Routine matin", value: data.morningRoutine ?? "—" },
    { label: "Routine soir", value: data.eveningRoutine ?? "—" },
  ];

  return (
    <div>
      <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
        Écran 05 — Confirmation
      </p>
      <h1 className="font-display mt-3 text-2xl font-bold text-camp-charcoal uppercase sm:text-3xl">
        Ton rituel Lockin
      </h1>
      <p className="mt-2 text-sm text-camp-charcoal/60">
        Dernière vérification avant d&apos;entrer dans le club.
      </p>

      <Slogan as="p" size="md" className="mt-8 border-l-2 border-lk-gold pl-4" />

      <dl className="mt-6 divide-y divide-camp-hairline border border-camp-hairline">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
            <dt className="font-mono text-[11px] font-bold tracking-[0.08em] text-camp-charcoal/50 uppercase">
              {row.label}
            </dt>
            <dd className="text-sm text-camp-charcoal sm:max-w-[60%] sm:text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-camp-charcoal/60">
        Ta motivation devient ton premier post, visible par toute la
        communauté Lockin.
      </p>
      <p className="mt-2 text-xs text-camp-charcoal/40">
        En continuant, tu acceptes les{" "}
        <a href="/legal/cgu" target="_blank" className="underline hover:text-camp-charcoal">
          CGU
        </a>{" "}
        et la{" "}
        <a href="/legal/charte-moderation" target="_blank" className="underline hover:text-camp-charcoal">
          Charte de modération
        </a>{" "}
        du Lockin Social Club.
      </p>
    </div>
  );
}
