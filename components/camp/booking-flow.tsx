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
  SPORT_ACTIVITIES,
  sessionDurationDays,
} from "@/lib/camp/data";
import type { CampSportChoice } from "@/lib/db/schema";

type Step = 1 | 2 | 3 | 4;

type BookingFlowProps = {
  session: CampSessionWithAvailability;
  initialFullName?: string;
  initialEmail?: string;
};

export function BookingFlow({ session, initialFullName, initialEmail }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [sportChoices, setSportChoices] = useState<CampSportChoice[]>([]);
  const [excursionChoices, setExcursionChoices] = useState<string[]>([]);
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

  const step1Valid = fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email);
  const step2Valid = sportChoices.length === days.length;
  const step3Valid = excursionChoices.length === EXCURSIONS_TO_CHOOSE;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await createCampRegistration({
          sessionId: session.id,
          fullName: fullName.trim(),
          email: email.trim(),
          sportChoices,
          excursionChoices,
        });
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  }

  if (done) {
    return (
      <div className="camp-scope mx-auto max-w-md space-y-5 text-center">
        <CheckCircle2 className="mx-auto size-12 text-camp-brown" />
        <SectionTitle
          title="Pré-inscription confirmée"
          description={`Ta place pour ${session.name} est réservée. Nous te contacterons par email pour la suite.`}
        />
        <CTAButton onClick={() => router.push(`/dashboard/camp/${session.slug}`)}>
          Retour à la session
        </CTAButton>
      </div>
    );
  }

  return (
    <div className="camp-scope mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-camp-bg-deep">
          <div
            className="h-full rounded-full bg-camp-brown transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <p className="text-right text-xs text-camp-brown-soft">Étape {step} / 4</p>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <SectionTitle eyebrow="Profil" title="Tes coordonnées" />
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-camp-brown-deep">
              Nom complet
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prénom Nom"
              className="border-camp-border bg-camp-card"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-camp-brown-deep">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              className="border-camp-border bg-camp-card"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Sport"
            title="Une activité par jour"
            description="Football, Boxe Thaï, Padel ou Yoga."
          />
          <div className="space-y-3">
            {days.map((day) => {
              const current = sportChoices.find((c) => c.day === day)?.activityId;
              return (
                <div key={day} className="space-y-2">
                  <p className="text-xs font-medium text-camp-brown-soft">Jour {day}</p>
                  <div className="flex gap-2">
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
            eyebrow="Excursions"
            title={`Choisis ${EXCURSIONS_TO_CHOOSE} excursions`}
            description={`${excursionChoices.length}/${EXCURSIONS_TO_CHOOSE} sélectionnées`}
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
          <SectionTitle eyebrow="Récapitulatif" title="Vérifie ta réservation" />
          <div className="space-y-3 rounded-lg border border-camp-border bg-camp-card p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-camp-brown-soft">Session</span>
              <span className="font-medium text-camp-brown-deep">
                {format(session.startDate, "d MMM", { locale: fr })} –{" "}
                {format(session.endDate, "d MMM yyyy", { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-camp-brown-soft">Participant</span>
              <span className="font-medium text-camp-brown-deep">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-camp-brown-soft">Excursions</span>
              <span className="font-medium text-camp-brown-deep">
                {excursionChoices
                  .map((id) => EXCURSIONS.find((e) => e.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="flex justify-between border-t border-camp-border pt-3">
              <span className="text-camp-brown-soft">Prix</span>
              <span className="font-display text-lg text-camp-brown-deep">
                {session.pricePerPerson.toLocaleString("fr-FR")} €
              </span>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
        {step < 4 ? (
          <CTAButton
            disabled={
              (step === 1 && !step1Valid) ||
              (step === 2 && !step2Valid) ||
              (step === 3 && !step3Valid)
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
