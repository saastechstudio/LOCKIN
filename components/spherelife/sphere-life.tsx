"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Move3d, Orbit, SlidersHorizontal } from "lucide-react";

import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";
import { moveSphere } from "@/lib/actions/life-os";
import { SphereEditor } from "./sphere-editor";
import { SphereFallback } from "./fallback";
import type { UniverseLink, UniverseSphere } from "./types";

/** La scène 3D ne se rend que dans le navigateur : WebGL n'existe pas côté serveur. */
const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => <CoreLoading />,
});

function CoreLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="size-40 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.45),transparent_70%)]" />
    </div>
  );
}

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export type SphereLifeProps = {
  spheres: UniverseSphere[];
  links: UniverseLink[];
  score: number;
  tierLabel: string;
  balance: number | null;
  signals: { id: string; tone: string; message: string }[];
  /** Hauteur du globe : plein cadre sur le cockpit, réduit ailleurs. */
  className?: string;
};

/**
 * SphereLife™ : la vie du membre en un univers. Le noyau s'illumine avec le
 * LockIn Score, chaque domaine de vie est une planète. Deux modes :
 * explorer (pivoter, zoomer, plonger dans une sphère d'un clic) et déplacer
 * (glisser une planète sur son orbite). Le panneau « Univers » crée,
 * colore, ordonne et relie les sphères.
 */
export function SphereLife({ spheres, links, score, tierLabel, balance, signals, className }: SphereLifeProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"explore" | "move">("explore");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [signalIndex, setSignalIndex] = useState(0);
  const [, startTransition] = useTransition();
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    // Détection unique au montage : le serveur ne peut pas savoir si le navigateur a WebGL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    if (signals.length < 2 || reducedMotion) return;
    const timer = window.setInterval(() => setSignalIndex((i) => (i + 1) % signals.length), 5200);
    return () => window.clearInterval(timer);
  }, [signals.length, reducedMotion]);

  const selected = spheres.find((s) => s.id === selectedId);
  const signal = signals[signalIndex % Math.max(1, signals.length)];

  function enter(id: number) {
    router.prefetch(`/dashboard/sphere/${id}`);
    setSelectedId(id);
  }

  return (
    <section
      aria-label="SphereLife, ton univers de vie"
      className={cn(
        "lk-glass relative isolate overflow-hidden rounded-[28px] lk-grid-bg",
        "h-[62vh] min-h-[440px] sm:h-[70vh] sm:min-h-[560px]",
        className,
      )}
    >
      {/* Lumière d'ambiance derrière le globe. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.22),transparent_60%)]"
      />

      <div className="absolute inset-0">
        {webgl === false ? (
          <SphereFallback spheres={spheres} links={links} score={score} onSelect={(id) => router.push(`/dashboard/sphere/${id}`)} />
        ) : webgl ? (
          <Scene
            spheres={spheres}
            links={links}
            coreScore={score}
            mode={mode}
            reducedMotion={reducedMotion}
            selectedId={selectedId}
            onSelect={enter}
            onArrive={(id) => router.push(`/dashboard/sphere/${id}`)}
            onMove={(id, angle) => startTransition(async () => void (await moveSphere(id, angle)))}
          />
        ) : (
          <CoreLoading />
        )}
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">SphereLife™</p>
          <p className="font-display mt-2 text-2xl text-lk-black sm:text-3xl">Ton univers</p>
          <p className="mt-1 text-xs text-lk-stone-3">
            {spheres.length} sphère{spheres.length > 1 ? "s" : ""}
            {balance !== null ? ` · équilibre ${balance}/100` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">LockIn Score</p>
          <p className="font-display lk-text-glow mt-1 text-5xl text-lk-black tabular-nums sm:text-6xl">
            <CountUp value={score} duration={1.8} />
          </p>
          <p className="text-xs font-medium text-lk-gold">{tierLabel}</p>
        </div>
      </div>

      {selected ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-display animate-fade-in rounded-full border border-lk-line bg-lk-white/60 px-5 py-2 text-lg text-lk-black backdrop-blur-xl">
            Entrée dans {selected.name}…
          </p>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        {signal ? (
          <p
            key={signal.id}
            className="lk-rise flex max-w-md items-center gap-2.5 rounded-2xl border border-lk-line bg-lk-white/55 px-4 py-2.5 text-sm text-lk-black backdrop-blur-xl"
          >
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                signal.tone === "critical" || signal.tone === "warning"
                  ? "bg-lk-coral shadow-[0_0_10px_rgba(255,138,101,0.9)]"
                  : signal.tone === "positive"
                    ? "bg-lk-gold shadow-[0_0_10px_rgba(209,250,229,0.9)]"
                    : "bg-lk-blue-soft shadow-[0_0_10px_rgba(16,185,129,0.9)]",
              )}
            />
            <span>
              <span className="text-lk-stone-3">Copilote · </span>
              {signal.message}
            </span>
          </p>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2 self-end">
          <div className="flex rounded-xl border border-lk-line bg-lk-white/55 p-1 backdrop-blur-xl" role="group" aria-label="Mode">
            <ModeButton active={mode === "explore"} onClick={() => setMode("explore")} label="Explorer">
              <Orbit className="size-4" />
            </ModeButton>
            <ModeButton active={mode === "move"} onClick={() => setMode("move")} label="Déplacer">
              <Move3d className="size-4" />
            </ModeButton>
          </div>
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-lk-line bg-lk-white/55 px-3.5 text-sm text-lk-black backdrop-blur-xl transition-colors hover:border-lk-blue-soft"
          >
            <SlidersHorizontal className="size-4" /> Univers
          </button>
        </div>
      </div>

      {mode === "move" ? (
        <p className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[38%] rounded-full bg-lk-white/60 px-3 py-1 text-xs text-lk-stone-3 backdrop-blur">
          Glisse une sphère sur son orbite
        </p>
      ) : null}

      <SphereEditor open={editorOpen} onOpenChange={setEditorOpen} spheres={spheres} links={links} />
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all",
        active ? "bg-lk-blue text-white shadow-focus" : "text-lk-stone-3 hover:text-lk-black",
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
