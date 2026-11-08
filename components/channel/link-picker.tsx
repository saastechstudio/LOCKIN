"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";

import { linkConversation } from "@/lib/actions/channel";
import { cn } from "@/lib/utils";
import { DialogShell } from "./dialog-shell";

export type LinkOptions = {
  goals: { id: number; label: string }[];
  habits: { id: number; label: string }[];
  spheres: { id: number; label: string }[];
  current: { goalId: number | null; habitId: number | null; sphereId: number | null };
};

function Group({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: { id: number; label: string }[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="mb-1.5 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            aria-pressed={value === i.id}
            onClick={() => onChange(value === i.id ? null : i.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              value === i.id ? "border-lk-blue-soft bg-lk-blue/30 text-lk-black" : "border-lk-line text-lk-stone-3 hover:text-lk-black",
            )}
          >
            {i.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Relie la conversation à un objectif, une habitude ou une sphère de SphereLife. */
export function LinkButton({ conversationId, options }: { conversationId: number; options: LinkOptions }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [goalId, setGoalId] = useState(options.current.goalId);
  const [habitId, setHabitId] = useState(options.current.habitId);
  const [sphereId, setSphereId] = useState(options.current.sphereId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await linkConversation(conversationId, { goalId, habitId, sphereId });
      if (!result.ok) return setError(result.error);
      setOpen(false);
      router.refresh();
    });
  }

  const empty = options.goals.length + options.habits.length + options.spheres.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Lier à un objectif, une habitude ou une sphère"
        title="Lier à LockIn"
        className="lk-press rounded-lg p-2 text-lk-stone-3 transition-colors hover:bg-lk-surface hover:text-lk-black"
      >
        <Link2 className="size-4" />
      </button>
      <DialogShell open={open} onOpenChange={setOpen} title="Lier à ta vie" description="La conversation apparaît sur la sphère, l'objectif ou l'habitude choisis.">
        {empty ? <p className="text-sm text-lk-stone-3">Aucun objectif, habitude ou sphère à lier pour l&apos;instant.</p> : null}
        <Group title="Objectif" items={options.goals} value={goalId} onChange={setGoalId} />
        <Group title="Habitude" items={options.habits} value={habitId} onChange={setHabitId} />
        <Group title="Sphère" items={options.spheres} value={sphereId} onChange={setSphereId} />
        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-lk-coral/40 bg-lk-coral/10 px-3 py-2 text-sm text-lk-coral">
            {error}
          </p>
        ) : null}
        <button type="button" onClick={save} disabled={pending || empty} className="lockin-button mt-5 w-full rounded-xl">
          Enregistrer
        </button>
      </DialogShell>
    </>
  );
}
