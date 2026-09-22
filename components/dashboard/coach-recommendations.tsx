import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoachRecommendations({ actions }: { actions: string[] }) {
  const topActions = actions.slice(0, 3);

  return (
    <Card className="surface card-interactive">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="font-display text-xl">
          Recommandations du Coach IA
        </CardTitle>
        <Link
          href="/dashboard/coach"
          className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
        >
          Ouvrir le chat <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {topActions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Termine ton audit d&apos;entrée pour recevoir tes premières
            recommandations personnalisées.
          </p>
        ) : (
          <ul className="space-y-3">
            {topActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-yellow" />
                <span className="text-foreground">{action}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
