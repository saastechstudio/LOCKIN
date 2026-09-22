import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LOCK_IN_MODULES } from "@/lib/modules";

/**
 * Grille des 6 modules du Coach IA (LOCK IN OS). Chaque module renvoie vers
 * le Coach IA pour en parler directement — pas de configuration séparée par
 * module, ils font tous partie d'un seul coach qui les combine.
 */
export function ModulesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {LOCK_IN_MODULES.map((module) => (
        <Link key={module.id} href="/dashboard/coach">
          <Card className="surface card-interactive h-full hover:border-brand-blue/50">
            <CardHeader className="pb-2">
              <span className="text-2xl">{module.emoji}</span>
              <h3 className="font-display text-sm text-foreground">
                {module.name}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {module.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
