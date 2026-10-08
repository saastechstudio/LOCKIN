import Link from "next/link";

import { Icon } from "@/components/lockin/icon";
import { LOCK_IN_MODULES } from "@/lib/modules";

/**
 * Grille des 6 modules du Coach IA (LOCK IN OS). Chaque module renvoie vers
 * le Coach IA pour en parler directement — pas de configuration séparée par
 * module, ils font tous partie d'un seul coach qui les combine.
 */
export function ModulesGrid() {
  return (
    <div className="grid grid-cols-2 border-t border-l border-lk-line sm:grid-cols-3">
      {LOCK_IN_MODULES.map((module) => (
        <Link
          key={module.id}
          href="/dashboard/coach"
          className="group border-r border-b border-lk-line p-5 transition-colors hover:bg-lk-mist"
        >
          <Icon icon={module.icon} framed className="group-hover:bg-lk-black group-hover:text-lk-white" />
          <h3 className="font-display mt-4 text-sm text-lk-black">{module.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-lk-stone-3">{module.description}</p>
        </Link>
      ))}
    </div>
  );
}
