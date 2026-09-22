import { differenceInCalendarWeeks } from "date-fns";
import { Check, Lock as LockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OnboardingAudit } from "@/lib/db/schema";
import { METHODOLOGY_STAGES } from "@/lib/methodology";
import { GlossaryTerm } from "@/components/ui/glossary-term";
import { GLOSSARY } from "@/lib/glossary";

const DIAGNOSTIC_STAGE = METHODOLOGY_STAGES[0];
const STAGE_BY_NAME = new Map(METHODOLOGY_STAGES.map((stage) => [stage.name, stage]));

export function RoadmapTimeline({ audit }: { audit: OnboardingAudit }) {
  const weeksSinceAudit = Math.max(
    0,
    differenceInCalendarWeeks(new Date(), new Date(audit.createdAt)),
  );

  const phases = audit.roadmap.reduce<
    Array<(typeof audit.roadmap)[number] & { status: "done" | "current" | "upcoming" }>
  >((acc, phase) => {
    const startWeek = acc.reduce((sum, p) => sum + p.durationWeeks, 0);
    const endWeek = startWeek + phase.durationWeeks;
    const status =
      weeksSinceAudit >= endWeek
        ? "done"
        : weeksSinceAudit >= startWeek
          ? "current"
          : "upcoming";
    return [...acc, { ...phase, status }];
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3">
        <LockIcon className="mt-0.5 size-4 shrink-0 text-brand-blue" />
        <div>
          <p className="mb-1 text-xs font-medium text-brand-blue-deep">
            <GlossaryTerm definition={GLOSSARY.freinLockIn}>
              Ton Frein Lock In
            </GlossaryTerm>
          </p>
          <p className="text-sm text-foreground">{audit.lockInBlocker}</p>
        </div>
      </div>

      <ol className="space-y-3">
        <li className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-blue bg-brand-blue font-display text-xs text-white">
            <Check className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm font-medium text-foreground">
              <GlossaryTerm definition={DIAGNOSTIC_STAGE.description}>
                {DIAGNOSTIC_STAGE.name}
              </GlossaryTerm>
            </p>
            <p className="text-xs text-muted-foreground">
              {DIAGNOSTIC_STAGE.tagline}
            </p>
          </div>
        </li>

        {phases.map((phase, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border font-display text-xs",
                phase.status === "done" &&
                  "border-brand-blue bg-brand-blue text-white",
                phase.status === "current" &&
                  "border-brand-coral bg-brand-coral/10 text-brand-coral",
                phase.status === "upcoming" &&
                  "border-border text-muted-foreground",
              )}
            >
              {phase.status === "done" ? <Check className="size-3.5" /> : i + 2}
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    phase.status === "upcoming"
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {STAGE_BY_NAME.get(phase.phase) ? (
                    <GlossaryTerm
                      definition={STAGE_BY_NAME.get(phase.phase)!.description}
                    >
                      {phase.phase}
                    </GlossaryTerm>
                  ) : (
                    phase.phase
                  )}
                </p>
                {phase.status === "current" && (
                  <span className="rounded-full bg-brand-coral/10 px-2 py-0.5 text-[10px] font-medium text-brand-coral">
                    En cours
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {phase.focus} · {phase.durationWeeks} sem.
              </p>
              {phase.objective && (
                <p className="mt-1 text-xs font-medium text-foreground">
                  Objectif : {phase.objective}
                </p>
              )}

              {/* Le détail semaine par semaine n'est déplié que pour l'étape
                  en cours — les autres restent condensées pour ne pas
                  surcharger ce widget de dashboard. */}
              {phase.status === "current" && phase.steps && phase.steps.length > 0 && (
                <div className="mt-2 space-y-2 border-l border-brand-coral/30 pl-3">
                  {phase.steps.map((step, j) => (
                    <div key={j}>
                      <p className="text-xs font-medium text-foreground">
                        {step.title}
                      </p>
                      <ul className="mt-0.5 space-y-0.5">
                        {step.actions.map((action, k) => (
                          <li
                            key={k}
                            className="flex items-start gap-1.5 text-xs text-muted-foreground"
                          >
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {phase.milestone && (
                <p className="mt-1.5 text-xs text-brand-coral">
                  Jalon : {phase.milestone}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
