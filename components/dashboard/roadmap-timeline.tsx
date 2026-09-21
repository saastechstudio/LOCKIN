import { differenceInCalendarWeeks } from "date-fns";
import { Check, Lock as LockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OnboardingAudit } from "@/lib/db/schema";

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
        <p className="text-sm text-foreground">{audit.lockInBlocker}</p>
      </div>

      <ol className="space-y-3">
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
              {phase.status === "done" ? <Check className="size-3.5" /> : i + 1}
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
                  {phase.phase}
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
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
