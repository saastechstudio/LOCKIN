import { desc, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";

import { db } from "@/lib/db";
import { okrs, dailyCheckins, dailyFocus, onboardingAudits } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OkrCard } from "@/components/dashboard/okr-card";
import { NewOkrDialog } from "@/components/dashboard/new-okr-dialog";
import { CheckinForm } from "@/components/dashboard/checkin-form";
import { CheckinHistory } from "@/components/dashboard/checkin-history";
import { DailyCheckin } from "@/components/dashboard/daily-checkin";
import { EnergyWidget } from "@/components/dashboard/energy-widget";
import { CoachRecommendations } from "@/components/dashboard/coach-recommendations";
import { ModulesGrid } from "@/components/dashboard/modules-grid";
import { getTodayFocus } from "@/lib/actions/daily-focus";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();

  const [userOkrs, recentCheckins, recentFocus, latestAudit, todayFocus] =
    await Promise.all([
      db.query.okrs.findMany({
        where: eq(okrs.userId, user.id),
        orderBy: [desc(okrs.createdAt)],
      }),
      db.query.dailyCheckins.findMany({
        where: (fields, { and }) =>
          and(eq(fields.userId, user.id), gte(fields.date, subDays(new Date(), 7))),
        orderBy: [desc(dailyCheckins.date)],
      }),
      db.query.dailyFocus.findMany({
        where: (fields, { and }) =>
          and(eq(fields.userId, user.id), gte(fields.date, subDays(new Date(), 7))),
        orderBy: [desc(dailyFocus.date)],
      }),
      db.query.onboardingAudits.findFirst({
        where: eq(onboardingAudits.userId, user.id),
        orderBy: [desc(onboardingAudits.createdAt)],
      }),
      getTodayFocus(),
    ]);

  const energy = Math.round(
    average(recentCheckins.map((c) => c.rating)) * 20, // 1–5 stars -> %
  );
  const disciplineRatings = recentFocus
    .map((f) => f.disciplineRating)
    .filter((v): v is number => v !== null);
  const discipline = Math.round(average(disciplineRatings) * 10); // 1–10 -> %
  const motivation =
    recentFocus.length === 0
      ? 0
      : Math.round(
          (recentFocus.filter((f) => f.taskCompleted).length / recentFocus.length) *
            100,
        );

  const globalProgress =
    userOkrs.length === 0
      ? 0
      : Math.round(
          userOkrs.reduce((sum, okr) => {
            const target = Number(okr.targetValue);
            const current = Number(okr.currentValue);
            const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
            return sum + percent;
          }, 0) / userOkrs.length,
        );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <Card className="surface">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-xl">
                Progression globale
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {userOkrs.length} objectif{userOkrs.length > 1 ? "s" : ""} en cours
              </p>
            </div>
            <span className="font-display text-2xl text-brand-coral">
              {globalProgress}%
            </span>
          </CardHeader>
          <CardContent>
            <Progress value={globalProgress} />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl text-foreground">Mes modules</h2>
        <ModulesGrid />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Mes objectifs</h2>
          <NewOkrDialog />
        </div>

        {userOkrs.length === 0 ? (
          <Card className="surface">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucun objectif pour l&apos;instant. Créez votre premier objectif
              pour commencer à verrouiller votre exécution.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userOkrs.map((okr) => (
              <OkrCard key={okr.id} okr={okr} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DailyCheckin focus={todayFocus} />

        <Card className="surface">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Historique de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckinHistory checkins={recentCheckins} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <EnergyWidget energy={energy} discipline={discipline} motivation={motivation} />
        <CoachRecommendations actions={latestAudit?.firstWeekActions ?? []} />
      </section>

      <section>
        <Card className="surface">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Réflexion du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckinForm />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
