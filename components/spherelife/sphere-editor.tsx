"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Link2, Plus, Trash2, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import {
  createSphere,
  deleteSphere,
  reorderSpheres,
  toggleSphereLink,
  updateSphere,
} from "@/lib/actions/life-os";
import { SPHERE_PALETTE, SPHERE_SUGGESTIONS } from "@/lib/life-os/spheres";
import type { UniverseLink, UniverseSphere } from "./types";

/**
 * Panneau « Univers » : le membre construit sa SphereLife sans formulaire
 * lourd. Ajouter d'un geste (suggestions), renommer sur place, choisir sa
 * couleur, monter ou descendre une priorité, relier deux domaines.
 */
export function SphereEditor({
  open,
  onOpenChange,
  spheres,
  links,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spheres: UniverseSphere[];
  links: UniverseLink[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [linkFrom, setLinkFrom] = useState<number | "">("");
  const [linkTo, setLinkTo] = useState<number | "">("");

  const ordered = [...spheres].sort((a, b) => a.position - b.position);
  const name = (id: number) => spheres.find((s) => s.id === id)?.name ?? "?";
  const suggestions = SPHERE_SUGGESTIONS.filter(
    (s) => !spheres.some((sp) => sp.name.toLowerCase() === s.toLowerCase()),
  );

  function run(task: () => Promise<ActionResult<unknown>>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error);
    });
  }

  function add(label: string) {
    const color = SPHERE_PALETTE[spheres.length % SPHERE_PALETTE.length].value;
    run(() => createSphere({ name: label, color }));
    setDraft("");
  }

  function move(index: number, delta: number) {
    const ids = ordered.map((s) => s.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderSpheres(ids));
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-lk-white/40 backdrop-blur-sm" />
        <DialogPrimitive.Content className="lk-glass-strong data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-3 right-3 z-50 flex w-[min(440px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl duration-300">
          <div className="flex items-start justify-between border-b border-lk-line px-6 py-5">
            <div>
              <DialogPrimitive.Title className="font-display text-xl text-lk-black">Ton univers</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-lk-stone-3">
                Tes domaines de vie, leur couleur, leur priorité et leurs influences.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black">
              <X className="size-4" />
              <span className="sr-only">Fermer</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            <section>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Sphères · par priorité</p>
              <ul className="mt-3 space-y-2">
                {ordered.map((sphere, index) => (
                  <li key={sphere.id} className="rounded-2xl border border-lk-line bg-lk-surface p-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="size-3.5 shrink-0 rounded-full"
                        style={{ background: sphere.color, boxShadow: `0 0 12px ${sphere.color}` }}
                      />
                      <input
                        defaultValue={sphere.name}
                        aria-label={`Nom de la sphère ${sphere.name}`}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && value !== sphere.name) run(() => updateSphere(sphere.id, { name: value }));
                        }}
                        className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-0.5 text-sm text-lk-black outline-none focus:bg-lk-surface"
                      />
                      <span className="text-xs text-lk-stone-3 tabular-nums">{sphere.score}</span>
                      <div className="flex">
                        <IconButton label="Monter" disabled={index === 0 || pending} onClick={() => move(index, -1)}>
                          <ArrowUp className="size-3.5" />
                        </IconButton>
                        <IconButton
                          label="Descendre"
                          disabled={index === ordered.length - 1 || pending}
                          onClick={() => move(index, 1)}
                        >
                          <ArrowDown className="size-3.5" />
                        </IconButton>
                        <IconButton
                          label={`Supprimer ${sphere.name}`}
                          disabled={pending}
                          onClick={() => {
                            if (window.confirm(`Supprimer la sphère « ${sphere.name} » ? Ses objectifs et habitudes sont conservés.`)) {
                              run(() => deleteSphere(sphere.id));
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </IconButton>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-6">
                      {SPHERE_PALETTE.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          title={c.name}
                          aria-label={`Couleur ${c.name}`}
                          onClick={() => run(() => updateSphere(sphere.id, { color: c.value }))}
                          className={cn(
                            "size-5 rounded-full border transition-transform hover:scale-110",
                            sphere.color.toLowerCase() === c.value.toLowerCase()
                              ? "border-lk-black ring-2 ring-lk-black/30"
                              : "border-lk-line",
                          )}
                          style={{ background: c.value }}
                        />
                      ))}
                      <label className="relative size-5 cursor-pointer overflow-hidden rounded-full border border-dashed border-lk-stone-2" title="Couleur libre">
                        <span className="sr-only">Couleur libre</span>
                        <input
                          type="color"
                          defaultValue={sphere.color}
                          onChange={(e) => run(() => updateSphere(sphere.id, { color: e.target.value }))}
                          className="absolute inset-0 size-full cursor-pointer opacity-0"
                        />
                        <Plus className="absolute inset-0 m-auto size-3 text-lk-stone-3" />
                      </label>
                    </div>
                  </li>
                ))}
              </ul>

              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) add(draft.trim());
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nouvelle sphère : Famille, Voyage…"
                  aria-label="Nom de la nouvelle sphère"
                  className="lockin-input flex-1 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={pending || !draft.trim()}
                  className="lockin-button rounded-xl px-4"
                >
                  <Plus className="size-4" />
                </button>
              </form>
              {suggestions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={pending}
                      onClick={() => add(s)}
                      className="rounded-full border border-lk-line px-3 py-1 text-xs text-lk-stone-3 transition-colors hover:border-lk-blue-soft hover:text-lk-black"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <section>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Influences</p>
              <p className="mt-1.5 text-xs text-lk-stone-3">« Sport nourrit Santé » : un flux lumineux relie les deux sphères.</p>
              <div className="mt-3 flex items-center gap-2">
                <SphereSelect value={linkFrom} onChange={setLinkFrom} spheres={ordered} label="Sphère source" />
                <Link2 className="size-4 shrink-0 text-lk-stone-3" />
                <SphereSelect value={linkTo} onChange={setLinkTo} spheres={ordered} label="Sphère influencée" />
                <button
                  type="button"
                  disabled={pending || linkFrom === "" || linkTo === "" || linkFrom === linkTo}
                  onClick={() => {
                    if (linkFrom === "" || linkTo === "") return;
                    run(() => toggleSphereLink(linkFrom, linkTo));
                  }}
                  className="lockin-button rounded-xl px-3 text-xs"
                >
                  Relier
                </button>
              </div>
              <ul className="mt-3 space-y-1.5">
                {links.map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-xl border border-lk-line px-3 py-2 text-sm">
                    <span className="text-lk-black">
                      {name(l.from)} <span className="text-lk-stone-3">→</span> {name(l.to)}
                    </span>
                    <IconButton label="Retirer le lien" disabled={pending} onClick={() => run(() => toggleSphereLink(l.from, l.to))}>
                      <X className="size-3.5" />
                    </IconButton>
                  </li>
                ))}
                {links.length === 0 ? <li className="text-xs text-lk-stone-2">Aucune influence pour l&apos;instant.</li> : null}
              </ul>
            </section>

            {error ? (
              <p role="alert" className="rounded-xl border border-lk-coral/40 bg-lk-coral/10 px-3 py-2 text-sm text-lk-coral">
                {error}
              </p>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg p-1.5 text-lk-stone-3 transition-colors hover:bg-lk-surface hover:text-lk-black disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function SphereSelect({
  value,
  onChange,
  spheres,
  label,
}: {
  value: number | "";
  onChange: (value: number | "") => void;
  spheres: UniverseSphere[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
      className="lockin-input min-w-0 flex-1 rounded-xl py-2 text-sm"
    >
      <option value="">—</option>
      {spheres.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
