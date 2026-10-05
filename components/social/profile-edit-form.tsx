"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { updateSocialProfile } from "@/lib/actions/social-profile";
import { SPORT_ACTIVITIES } from "@/lib/social/data";
import type { ProfileLink } from "@/lib/db/schema";

type ProfileEditFormProps = {
  initial: {
    bio: string | null;
    country: string | null;
    city: string | null;
    sector: string | null;
    mainSport: string | null;
    lockinLevel: number;
    links: ProfileLink[];
  };
  onDone: () => void;
};

const fieldClassName =
  "w-full border border-camp-hairline bg-camp-white px-3 py-2 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal";

/** Formulaire d'édition du profil — angles droits, pas d'ombre, cohérent avec le reste du Social Club. */
export function ProfileEditForm({ initial, onDone }: ProfileEditFormProps) {
  const [bio, setBio] = useState(initial.bio ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [sector, setSector] = useState(initial.sector ?? "");
  const [mainSport, setMainSport] = useState(initial.mainSport ?? "");
  const [links, setLinks] = useState<ProfileLink[]>(initial.links);
  const [isPending, startTransition] = useTransition();

  function updateLink(index: number, field: keyof ProfileLink, value: string) {
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function handleSave() {
    startTransition(async () => {
      await updateSocialProfile({
        bio: bio.trim() || undefined,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        sector: sector.trim() || undefined,
        mainSport: mainSport || undefined,
        links: links.filter((l) => l.label.trim() && l.url.trim()),
      });
      onDone();
    });
  }

  return (
    <div className="space-y-5 border-b border-camp-charcoal pb-6">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          placeholder="Une courte présentation"
          className={cn(fieldClassName, "resize-none")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase">
            Ville
          </label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={fieldClassName} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase">
            Pays
          </label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={fieldClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase">
            Métier / domaine
          </label>
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Entrepreneur, créateur…"
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase">
            Sport principal
          </label>
          <select
            value={mainSport}
            onChange={(e) => setMainSport(e.target.value)}
            className={fieldClassName}
          >
            <option value="">—</option>
            {SPORT_ACTIVITIES.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="border-l-2 border-lk-gold pl-3 text-xs text-lk-black/60">
        Ton niveau Lockin ne se déclare pas : il se gagne, chaque jour, avec ta note de discipline.
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase">
          Liens
        </label>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Label"
                className={cn(fieldClassName, "w-28")}
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://…"
                className={fieldClassName}
              />
              <button
                type="button"
                onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
                className="shrink-0 border border-camp-hairline px-2 text-camp-charcoal/60 hover:text-camp-charcoal"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {links.length < 6 ? (
            <button
              type="button"
              onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
              className="text-[11px] font-semibold tracking-[0.06em] text-camp-charcoal/60 uppercase hover:text-camp-charcoal"
            >
              + Ajouter un lien
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="border border-camp-charcoal bg-camp-gold px-5 py-2 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onDone}
          className="border border-camp-charcoal px-5 py-2 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
