"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  FORMATION_LEVELS,
  FORMATION_LEVEL_LABELS,
  FORMATION_LIMITS,
  FORMATION_THEMES,
  type FormationLevel,
} from "@/lib/formations-data";
import { createFormation, updateFormation } from "@/lib/actions/formations";
import { LockinButton, LockinInput, LockinLabel, LockinTextarea } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

type Initial = {
  title: string;
  description: string;
  theme: string;
  level: FormationLevel;
  durationHours: number;
  priceEuros: string;
};

const EMPTY: Initial = {
  title: "",
  description: "",
  theme: FORMATION_THEMES[0],
  level: "debutant",
  durationHours: 1,
  priceEuros: "",
};

/**
 * Formulaire de formation — création (« Créer le squelette ») ou
 * modification depuis le builder. Les règles vivent dans l'action serveur ;
 * ici, seulement la saisie.
 */
export function FormationForm({
  formationId,
  initial = EMPTY,
}: {
  /** Absent = création ; présent = modification de cette formation. */
  formationId?: number;
  initial?: Initial;
}) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const [values, setValues] = useState<Initial>(initial);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Initial>(key: K, value: Initial[K]) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = values.priceEuros.trim() === "" ? null : Number(values.priceEuros.replace(",", "."));
    const payload = {
      title: values.title,
      description: values.description,
      theme: values.theme as (typeof FORMATION_THEMES)[number],
      level: values.level,
      durationHours: Number(values.durationHours),
      priceEuros: price !== null && Number.isFinite(price) ? price : null,
    };
    if (formationId === undefined) {
      run(() => createFormation(payload), ({ id }) => router.push(`/formations/${id}/builder`));
    } else {
      run(() => updateFormation(formationId, payload), () => setSaved(true));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <LockinLabel htmlFor="f-title">Titre</LockinLabel>
        <LockinInput
          id="f-title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={FORMATION_LIMITS.title}
          required
          placeholder="Ex. 30 jours pour reprendre le contrôle de ses matins"
        />
      </div>

      <div>
        <LockinLabel htmlFor="f-desc">Description</LockinLabel>
        <LockinTextarea
          id="f-desc"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={FORMATION_LIMITS.description}
          rows={5}
          required
          placeholder="Ce que l'apprenant saura faire à la fin, et pour qui c'est fait."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <LockinLabel htmlFor="f-theme">Thème</LockinLabel>
          <select id="f-theme" className="lockin-input" value={values.theme} onChange={(e) => set("theme", e.target.value)}>
            {FORMATION_THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <LockinLabel htmlFor="f-level">Niveau</LockinLabel>
          <select
            id="f-level"
            className="lockin-input"
            value={values.level}
            onChange={(e) => set("level", e.target.value as FormationLevel)}
          >
            {FORMATION_LEVELS.map((l) => (
              <option key={l} value={l}>
                {FORMATION_LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <LockinLabel htmlFor="f-duration">Durée (heures)</LockinLabel>
          <LockinInput
            id="f-duration"
            type="number"
            min={1}
            max={FORMATION_LIMITS.maxHours}
            value={values.durationHours}
            onChange={(e) => set("durationHours", Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="max-w-xs">
        <LockinLabel htmlFor="f-price">Prix en euros (facultatif)</LockinLabel>
        <LockinInput
          id="f-price"
          inputMode="decimal"
          value={values.priceEuros}
          onChange={(e) => set("priceEuros", e.target.value)}
          placeholder="Vide = gratuite"
        />
        <p className="mt-2 text-xs leading-relaxed text-lk-black/50">
          Le paiement n&apos;est pas encore activé sur Lockin : une formation payante reste visible, mais fermée aux
          inscriptions tant qu&apos;il ne l&apos;est pas.
        </p>
      </div>

      <FormError message={error} />
      <div className="flex items-center gap-4">
        <LockinButton type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : formationId === undefined ? "Créer le squelette" : "Enregistrer"}
        </LockinButton>
        {saved ? <span className="text-sm text-lk-black/60">Enregistré.</span> : null}
      </div>
    </form>
  );
}
