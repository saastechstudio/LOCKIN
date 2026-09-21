import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { planningTasks, onboardingAudits } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanningBoard } from "@/components/dashboard/planning-board";
import { RoadmapTimeline } from "@/components/dashboard/roadmap-timeline";
import { NewTaskDialog } from "@/components/dashboard/new-task-dialog";

export default async function PlanningPage() {
  const user = await getOrCreateDbUser();

  const [tasks, latestAudit] = await Promise.all([
    db.query.planningTasks.findMany({
      where: eq(planningTasks.userId, user.id),
      orderBy: [desc(planningTasks.createdAt)],
    }),
    db.query.onboardingAudits.findFirst({
      where: eq(onboardingAudits.userId, user.id),
      orderBy: [desc(onboardingAudits.createdAt)],
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Planning & Organisation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ta feuille de route et tes tâches, au même endroit.
          </p>
        </div>
        <NewTaskDialog />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="surface order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="font-display text-lg">Tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanningBoard tasks={tasks} />
          </CardContent>
        </Card>

        <Card className="surface order-1 h-fit lg:order-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Ta feuille de route</CardTitle>
          </CardHeader>
          <CardContent>
            {latestAudit ? (
              <RoadmapTimeline audit={latestAudit} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Complète ton{" "}
                <a href="/onboarding/audit" className="text-brand-blue hover:underline">
                  audit d&apos;entrée
                </a>{" "}
                pour générer ta feuille de route personnalisée.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
