"use client";

import type { UniverseLink, UniverseSphere } from "./types";

/**
 * SphereLife sans WebGL : le même univers en vue de dessus. Le noyau garde
 * l'éclat du score, les planètes leur taille et leur couleur vivante.
 */
export function SphereFallback({
  spheres,
  links,
  score,
  onSelect,
}: {
  spheres: UniverseSphere[];
  links: UniverseLink[];
  score: number;
  onSelect: (id: number) => void;
}) {
  const ordered = [...spheres].sort((a, b) => a.position - b.position);
  const at = (index: number, angle: number) => {
    const r = 120 + index * 38;
    return { x: 400 + Math.cos(angle) * r, y: 300 + Math.sin(angle) * r * 0.55 };
  };
  const pos = new Map(ordered.map((s, i) => [s.id, at(i, s.orbitAngle)]));

  return (
    <svg viewBox="0 0 800 600" className="size-full" role="img" aria-label="SphereLife, vue simplifiée">
      <defs>
        <radialGradient id="core-glow">
          <stop offset="0%" stopColor="#FFE9EC" stopOpacity={0.35 + score / 200} />
          <stop offset="45%" stopColor="#E04B5F" stopOpacity={0.35 + score / 250} />
          <stop offset="100%" stopColor="#E04B5F" stopOpacity="0" />
        </radialGradient>
      </defs>
      {ordered.map((s, i) => (
        <ellipse
          key={`orbit-${s.id}`}
          cx="400"
          cy="300"
          rx={120 + i * 38}
          ry={(120 + i * 38) * 0.55}
          fill="none"
          stroke={s.color}
          strokeOpacity="0.15"
        />
      ))}
      {links.map((l) => {
        const a = pos.get(l.from);
        const b = pos.get(l.to);
        if (!a || !b) return null;
        return (
          <path
            key={l.id}
            d={`M${a.x},${a.y} Q400,${Math.min(a.y, b.y) - 80} ${b.x},${b.y}`}
            fill="none"
            stroke={spheres.find((s) => s.id === l.from)?.color}
            strokeOpacity="0.6"
            strokeDasharray="6 5"
          />
        );
      })}
      <circle cx="400" cy="300" r="110" fill="url(#core-glow)" />
      <circle cx="400" cy="300" r="46" fill="#2A0F16" stroke="#FFFFFF" strokeOpacity="0.25" />
      {ordered.map((s) => {
        const p = pos.get(s.id)!;
        const r = 9 + s.level * 3 + s.progress / 20;
        return (
          <g key={s.id} onClick={() => onSelect(s.id)} className="cursor-pointer">
            <circle cx={p.x} cy={p.y} r={r * 1.8} fill={s.color} opacity={0.06 + s.energy / 600} />
            <circle cx={p.x} cy={p.y} r={r} fill={s.color} opacity={0.25 + (s.energy / 100) * 0.75} />
            <text x={p.x} y={p.y + r + 16} textAnchor="middle" fill="#D9C9CB" fontSize="12">
              {s.name} · {s.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
