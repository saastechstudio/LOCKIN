"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { ProfileView } from "@/components/social/profile-view";
import { ProfileEditForm } from "@/components/social/profile-edit-form";
import type { Goal, ProfileLink, RoutineItem } from "@/lib/db/schema";

type OwnProfileProps = {
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

/** Bascule entre la vue profil et le formulaire d'édition — seule la page "mon profil" l'utilise. */
export function OwnProfile({ profile, goals, routine }: OwnProfileProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <ProfileEditForm initial={profile} onDone={() => setEditing(false)} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mb-4 inline-flex items-center gap-1.5 border border-camp-hairline px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal/70 uppercase hover:border-camp-charcoal hover:text-camp-charcoal"
      >
        <Pencil className="size-3.5" /> Modifier mon profil
      </button>
      <ProfileView profile={profile} goals={goals} routine={routine} />
    </div>
  );
}
