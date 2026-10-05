"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Loader2 } from "lucide-react";

import { CTAButton } from "@/components/camp/cta-button";
import { CardActivity } from "@/components/camp/card-activity";
import { CardExcursion } from "@/components/camp/card-excursion";
import { SectionTitle } from "@/components/camp/section-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCampRegistration,
  type CampSessionWithAvailability,
} from "@/lib/actions/camp";
import {
  EXCURSIONS,
  EXCURSIONS_TO_CHOOSE,
  FUN_ACTIVITIES,
  FUN_ACTIVITIES_TO_CHOOSE,
  SPORT_ACTIVITIES,
  sessionDurationDays,
} from "@/lib/camp/data";
import type { CampSportChoice } from "@/lib/db/schema";

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;

type BookingFlowProps = {
  session: CampSessionWithAvailability;
  initialFullName: string;
  /** Email du compte membre — affiché, pas modifiable (la réservation y est rattachée). */
  email: string;
};

const fieldClassName =
  "rounded-none border-2 border-camp-charcoal bg-camp-white text-camp-charcoal shadow-none placeholder:text-camp-charcoal/40 focus-visible:border-camp-gold focus-visible:ring-0";

export function BookingFlow({ session, initialFullName, email }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState(initialFullName);
  const [sportChoices, setSportChoices] = useState<CampSportChoice[]>([]);
  const [excursionChoices, setExcursionChoices] = useState<string[]>([]);
  const [funActivityChoice, setFunActivityChoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const days = useMemo(
    () =>
      Array.from(
        { length: sessionDurationDays(session.startDate, session.endDate) },
        (_, i) => i + 1,
      ),
    [session.startDate, session.endDate],
  );

  function setDayActivity(day: number, activityId: string) {
    setSportChoices((prev) => [...prev.filter((c) => c.day !== day), { day, activityId }]);
  }

  function toggleExcursion(id: string) {
    setExcursionChoices((prev) =>
      prev.includes(id)
        ? prev.filter((e) => e !== id)
        : prev.length < EXCURSIONS_TO_CHOOSE
          ? [...prev, id]
          : prev,
    );
  }

  const step1Valid = fullName.trim().length > 1;
  const step2Valid = sportChoices.length === days.length;
  const step3Valid = excursionChoices.length === EXCURSIONS_TO_CHOOSE;
  const step4Valid = funActivityChoice !== null;

  function handleSubmit() {
    if (!funActivityChoice) return;
    setError(null);
    startTransition(async () => {
      try {
        await createCampRegistration({
          sessionId: session.id,
          fullName: fullName.trim(),
          sportChoices,
          excursionChoices,
          funActivityChoice,
        });
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-6 py-20 text-center">
        <CheckCircle2 className="mx-auto size-12 text-camp-gold" />
        <SectionTitle
          eyebrow="C'est verrouillé"
          title="Pré-inscription confirmée"
          description={`Ta place pour ${session.name} est réservée. Nous te contacterons par email pour la suite.`}
        />
        <CTAButton onClick={() => router.push("/camp")}>Retour à la page du camp</CTAButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-14">
      <div className="space-y-2">
        <div className="h-2 w-full border-2 border-camp-charcoal bg-camp-hairline">
          <div
            className="h-full bg-camp-charcoal transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <p className="text-right font-mono text-xs font-bold tracking-[0.1em] text-camp-charcoal/60 uppercase">
          Étape {step} / {TOTAL_STEPS}
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <SectionTitle eyebrow="Profil" title="Tes coordonnées" />
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase">
              Nom complet
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prénom Nom"
              className={fieldClassName}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              className={`${fieldClassName} cursor-default opacity-70`}
            />
            <p className="text-xs text-camp-charcoal/50">L&apos;email de ton compte Lockin.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Sport"
            title="Une activité par jour"
            description="Football, Muay Thaï, Pilates, Padel, Fitness ou Yoga."
          />
          <div className="space-y-3">
            {days.map((day) => {
              const current = sportChoices.find((c) => c.day === day)?.activityId;
              return (
                <div key={day} className="space-y-2">
                  <p className="font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal/60 uppercase">
                    Jour {day}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_ACTIVITIES.map((activity) => (
                      <CardActivity
                        key={activity.id}
                        activity={activity}
                        selected={current === activity.id}
                        onSelect={() => setDayActivity(day, activity.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Excursion"
            title={`Choisis ${EXCURSIONS_TO_CHOOSE} excursion`}
            description={`${excursionChoices.length}/${EXCURSIONS_TO_CHOOSE} sélectionnée`}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {EXCURSIONS.map((excursion) => (
              <CardExcursion
                key={excursion.id}
                excursion={excursion}
                selected={excursionChoices.includes(excursion.id)}
                disabled={excursionChoices.length >= EXCURSIONS_TO_CHOOSE}
                onToggle={() => toggleExcursion(excursion.id)}
              />
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Activité fun"
            title={`Choisis ${FUN_ACTIVITIES_TO_CHOOSE} activité`}
            description={funActivityChoice ? "1/1 sélectionnée" : "0/1 sélectionnée"}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {FUN_ACTIVITIES.map((activity) => (
              <CardExcursion
                key={activity.id}
                excursion={activity}
                selected={funActivityChoice === activity.id}
                disabled={funActivityChoice !== null && funActivityChoice !== activity.id}
                onToggle={() =>
                  setFunActivityChoice((prev) => (prev === activity.id ? null : activity.id))
                }
              />
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <SectionTitle eyebrow="Récapitulatif" title="Vérifie ta réservation" />
          <div className="space-y-3 border-2 border-camp-charcoal p-5 text-sm">
            <div className="flex justify-between border-b border-camp-hairline pb-3">
              <span className="font-mono text-xs text-camp-charcoal/60 uppercase">Session</span>
              <span className="font-bold text-camp-charcoal">
                {format(session.startDate, "d MMM", { locale: fr })} –{" "}
                {format(session.endDate, "d MMM yyyy", { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between border-b border-camp-hairline pb-3">
              <span className="font-mono text-xs text-camp-charcoal/60 uppercase">Participant</span>
              <span className="font-bold text-camp-charcoal">{fullName}</span>
            </div>
            <div className="flex justify-between border-b border-camp-hairline pb-3">
              <span className="font-mono text-xs text-camp-charcoal/60 uppercase">Excursion</span>
              <span className="font-bold text-camp-charcoal">
                {excursionChoices
                  .map((id) => EXCURSIONS.find((e) => e.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="flex justify-between border-b border-camp-hairline pb-3">
              <span className="font-mono text-xs text-camp-charcoal/60 uppercase">Activité fun</span>
              <span className="font-bold text-camp-charcoal">
                {FUN_ACTIVITIES.find((a) => a.id === funActivityChoice)?.name}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-mono text-xs text-camp-charcoal/60 uppercase">Prix</span>
              <span className="font-display text-xl font-bold text-camp-charcoal">
                {session.pricePerPerson.toLocaleString("fr-FR")} €
              </span>
            </div>
          </div>
          {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <CTAButton variant="secondary" onClick={() => setStep((s) => (s - 1) as Step)}>
            Retour
          </CTAButton>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <CTAButton
            disabled={
              (step === 1 && !step1Valid) ||
              (step === 2 && !step2Valid) ||
              (step === 3 && !step3Valid) ||
              (step === 4 && !step4Valid)
            }
            onClick={() => setStep((s) => (s + 1) as Step)}
          >
            Continuer
          </CTAButton>
        ) : (
          <CTAButton onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Réserver ma place
          </CTAButton>
        )}
      </div>
    </div>
  );
}
