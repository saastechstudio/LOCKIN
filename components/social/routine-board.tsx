"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { createRoutineItem, deleteRoutineItem, toggleRoutineCheckin } from "@/lib/actions/goals";
import type { RoutineItem } from "@/lib/db/schema";

type RoutineItemWithStatus = RoutineItem & { checkedToday: boolean };

export function RoutineBoard({ items }: { items: RoutineItemWithStatus[] }) {
  const morning = items.filter((i) => i.period === "morning");
  const evening = items.filter((i) => i.period === "evening");

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
      <RoutineColumn title="Routine du matin" period="morning" items={morning} />
      <RoutineColumn title="Routine du soir" period="evening" items={evening} />
    </div>
  );
}

function RoutineColumn({
  title,
  period,
  items,
}: {
  title: string;
  period: "morning" | "evening";
  items: RoutineItemWithStatus[];
}) {
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    const value = label.trim();
    if (!value) return;
    startTransition(async () => {
      await createRoutineItem({ period, label: value });
      setLabel("");
    });
  }

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-camp-gold uppercase">
        {title}
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => startTransition(() => toggleRoutineCheckin(item.id))}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center border",
                item.checkedToday
                  ? "border-lk-line bg-camp-charcoal text-camp-white"
                  : "border-camp-hairline text-transparent",
              )}
            >
              <Check className="size-3.5" />
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                item.checkedToday ? "text-camp-charcoal/40 line-through" : "text-camp-charcoal",
              )}
            >
              {item.label}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => deleteRoutineItem(item.id))}
              className="text-camp-charcoal/30 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-camp-charcoal/40">Aucune routine définie.</p>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2 border-t border-camp-hairline pt-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nouvelle routine"
          className="flex-1 border border-camp-hairline bg-camp-white px-3 py-2 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-lk-line"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !label.trim()}
          className="border border-lk-line px-3 py-2 text-xs font-bold text-camp-charcoal uppercase disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
