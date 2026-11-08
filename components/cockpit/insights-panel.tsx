import Link from "next/link";
import { AlertOctagon, AlertTriangle, Info, TrendingUp } from "lucide-react";

import type { Insight } from "@/lib/life-os/insights";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader } from "./ring";

const STYLE = {
  critical: { Icon: AlertOctagon, className: "text-lk-coral", dot: "bg-lk-coral" },
  warning: { Icon: AlertTriangle, className: "text-lk-gold", dot: "bg-lk-gold" },
  info: { Icon: Info, className: "text-lk-blue-soft", dot: "bg-lk-blue-soft" },
  positive: { Icon: TrendingUp, className: "text-lk-gold", dot: "bg-lk-gold" },
} as const;

/** Ce que le copilote a détecté : tendances, décrochages, leviers. */
export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <Panel>
      <PanelHeader eyebrow="Insights IA" title="Ce que je remarque" />
      <ul className="mt-4 space-y-2">
        {insights.map((insight) => {
          const { Icon, className } = STYLE[insight.tone];
          const body = (
            <>
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} />
              <span>
                <span className="block text-sm text-lk-black">{insight.title}</span>
                <span className="block text-xs leading-relaxed text-lk-stone-3">{insight.detail}</span>
              </span>
            </>
          );
          return (
            <li key={insight.id}>
              {insight.href ? (
                <Link href={insight.href} className="-mx-2 flex gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-lk-surface">
                  {body}
                </Link>
              ) : (
                <div className="-mx-2 flex gap-3 px-2 py-2">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
