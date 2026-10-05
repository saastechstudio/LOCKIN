"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Logo } from "@/components/lockin/logo";
import { completeLockinOnboarding } from "@/lib/actions/onboarding-lockin";
import type { LockinTag } from "@/lib/social/data";
import { cn } from "@/lib/utils";

import { MotivationScreen } from "./motivation-screen";
import { GoalScreen } from "./goal-screen";
import { SportScreen } from "./sport-screen";
import { RoutineScreen } from "./routine-screen";
import { ConfirmationScreen } from "./confirmation-screen";

type WizardState = {
  motivation: string;
  goalDomain: LockinTag | null;
  subGoal: string;
  mainSport: string | null;
  morningRoutine: string | null;
  eveningRoutine: string | null;
};

const INITIAL_STATE: WizardState = {
  motivation: "",
  goalDomain: null,
  subGoal: "",
  mainSport: null,
  morningRoutine: null,
  eveningRoutine: null,
};

const STEP_LABELS = ["Motivation", "Objectif", "Sport", "Routine", "Confirmation"];

/** `next` : où aller une fois le rituel enregistré (déjà validé côté serveur, cf. safeNextPath). */
export function LockinOnboardingWizard({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return state.motivation.trim().length >= 10;
      case 1:
        return state.goalDomain !== null;
      case 2:
        return state.mainSport !== null;
      case 3:
        return state.morningRoutine !== null && state.eveningRoutine !== null;
      default:
        return true;
    }
  }, [step, state]);

  function goNext() {
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    if (!state.goalDomain || !state.mainSport || !state.morningRoutine || !state.eveningRoutine) return;

    startTransition(async () => {
      try {
        await completeLockinOnboarding({
          motivation: state.motivation,
          goalDomain: state.goalDomain!,
          subGoal: state.subGoal || undefined,
          mainSport: state.mainSport!,
          morningRoutine: state.morningRoutine!,
          eveningRoutine: state.eveningRoutine!,
        });
        router.push(next);
      } catch {
        setError("Impossible d'enregistrer ton rituel. Réessaie.");
      }
    });
  }

  return (
    <div className="camp-scope min-h-screen px-5 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo size="sm" href={null} />
          <span className="text-xs font-semibold tracking-[0.08em] text-camp-charcoal/50 uppercase">
            0{step + 1} / 0{STEP_LABELS.length}
          </span>
        </div>

        <div className="mb-10 flex h-1 w-full bg-camp-hairline">
          <div
            className="h-full bg-camp-charcoal transition-all"
            style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>

        {step === 0 ? (
          <MotivationScreen
            value={state.motivation}
            onChange={(motivation) => setState((s) => ({ ...s, motivation }))}
          />
        ) : null}
        {step === 1 ? (
          <GoalScreen
            domain={state.goalDomain}
            onDomainChange={(goalDomain) => setState((s) => ({ ...s, goalDomain }))}
            subGoal={state.subGoal}
            onSubGoalChange={(subGoal) => setState((s) => ({ ...s, subGoal }))}
          />
        ) : null}
        {step === 2 ? (
          <SportScreen
            value={state.mainSport}
            onChange={(mainSport) => setState((s) => ({ ...s, mainSport }))}
          />
        ) : null}
        {step === 3 ? (
          <RoutineScreen
            morning={state.morningRoutine}
            onMorningChange={(morningRoutine) => setState((s) => ({ ...s, morningRoutine }))}
            evening={state.eveningRoutine}
            onEveningChange={(eveningRoutine) => setState((s) => ({ ...s, eveningRoutine }))}
          />
        ) : null}
        {step === 4 ? <ConfirmationScreen data={state} /> : null}

        {error ? (
          <p className="mt-6 border border-camp-charcoal bg-camp-cream px-4 py-3 text-sm text-camp-charcoal">
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex items-center justify-between border-t border-camp-charcoal pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || isPending}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase",
              step === 0 ? "pointer-events-none opacity-0" : "text-camp-charcoal/60 hover:text-camp-charcoal",
            )}
          >
            <ArrowLeft className="size-3.5" /> Précédent
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className="inline-flex items-center gap-2 border border-camp-charcoal bg-camp-charcoal px-6 py-3 text-xs font-semibold tracking-[0.08em] text-camp-white uppercase disabled:opacity-30"
            >
              Suivant <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-2 border border-camp-charcoal bg-camp-gold px-6 py-3 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
            >
              {isPending ? "Création…" : "Entrer dans le Lockin Social Club"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
