import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";

import { LockIcon } from "@/components/lockin/lock-icon";
import { LEVEL_MAX, levelName } from "@/lib/lockin-level";
import type { Goal, ProfileLink, RoutineItem } from "@/lib/db/schema";

type ProfileViewProps = {
  profile: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
    bio: string | null;
    sector: string | null;
    country: string | null;
    city: string | null;
    mainSport: string | null;
    lockinLevel: number;
    links: ProfileLink[];
  };
  goals: Goal[];
  routine: RoutineItem[];
};

/** Fiche de profil brutaliste — pas de carte, des blocs séparés par des filets. */
export function ProfileView({ profile, goals, routine }: ProfileViewProps) {
  const morning = routine.filter((r) => r.period === "morning");
  const evening = routine.filter((r) => r.period === "evening");
  const personalGoals = goals.filter((g) => g.category === "personal");
  const professionalGoals = goals.filter((g) => g.category === "professional");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-lk-black pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center border border-camp-hairline bg-camp-cream text-xl font-bold text-camp-charcoal">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar Clerk externe, cf. components/ui/avatar.tsx
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              (profile.name ?? "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl text-lk-black">
              {profile.name ?? "Membre Lockin"}
            </h1>
            {profile.bio ? (
              <p className="mt-1 max-w-md text-sm text-camp-charcoal/70">{profile.bio}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-lk-black/60">
              {profile.city || profile.country ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </span>
              ) : null}
              {profile.sector ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-3.5" /> {profile.sector}
                </span>
              ) : null}
              {profile.mainSport ? <span>· {profile.mainSport}</span> : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 border border-lk-black px-5 py-4">
          <LockIcon
            level={profile.lockinLevel}
            max={LEVEL_MAX}
            className="h-12 w-9"
            title={`Niveau ${profile.lockinLevel} sur ${LEVEL_MAX}`}
          />
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-lk-black/50 uppercase">
              Niveau {profile.lockinLevel}/{LEVEL_MAX}
            </p>
            <p className="font-display text-lg text-lk-black">{levelName(profile.lockinLevel)}</p>
          </div>
        </div>
      </div>

      {profile.links.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-camp-hairline px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-camp-charcoal uppercase hover:border-camp-charcoal"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <GoalColumn title="Objectifs personnels" goals={personalGoals} />
        <GoalColumn title="Objectifs professionnels" goals={professionalGoals} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <RoutineColumn title="Routine du matin" items={morning} />
        <RoutineColumn title="Routine du soir" items={evening} />
      </div>

      <Link
        href="/dashboard/objectifs"
        className="inline-block text-xs font-bold text-camp-charcoal/60 uppercase underline-offset-4 hover:text-camp-charcoal hover:underline"
      >
        Gérer dans le module Objectifs →
      </Link>
    </div>
  );
}

function GoalColumn({ title, goals }: { title: string; goals: Goal[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-gold uppercase">
        {title}
      </p>
      {goals.length === 0 ? (
        <p className="mt-2 text-sm text-camp-charcoal/40">Aucun objectif partagé.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {goals.map((g) => (
            <li key={g.id} className="border-t border-camp-hairline pt-2 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-camp-charcoal">{g.title}</span>
                <span className="text-xs text-camp-charcoal/50">{g.progress}%</span>
              </div>
              {g.horizonDays ? (
                <span className="text-[10px] text-camp-charcoal/40 uppercase">
                  {g.horizonDays} jours
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RoutineColumn({ title, items }: { title: string; items: RoutineItem[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-gold uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-camp-charcoal/40">Aucune routine définie.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="text-sm text-camp-charcoal/80">
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
