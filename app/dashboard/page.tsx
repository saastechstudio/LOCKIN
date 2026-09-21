import { desc, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";

import { db } from "@/lib/db";
import { okrs, dailyCheckins } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OkrCard } from "@/components/dashboard/okr-card";
import { NewOkrDialog } from "@/components/dashboard/new-okr-dialog";
import { CheckinForm } from "@/components/dashboard/checkin-form";
import { CheckinHistory } from "@/components/dashboard/checkin-history";
import { DailyCheckin } from "@/components/dashboard/daily-checkin";
import { getTodayFocus } from "@/lib/actions/daily-focus";

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();

  const [userOkrs, recentCheckins, todayFocus] = await Promise.all([
    db.query.okrs.findMany({
      where: eq(okrs.userId, user.id),
      orderBy: [desc(okrs.createdAt)],
    }),
    db.query.dailyCheckins.findMany({
      where: (fields, { and }) =>
        and(eq(fields.userId, user.id), gte(fields.date, subDays(new Date(), 7))),
      orderBy: [desc(dailyCheckins.date)],
    }),
    getTodayFocus(),
  ]);

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
        <Card className="glass">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-xl">
                Progression globale
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {userOkrs.length} objectif{userOkrs.length > 1 ? "s" : ""} en cours
              </p>
            </div>
            <span className="font-serif text-2xl text-brand-cyan">
              {globalProgress}%
            </span>
          </CardHeader>
          <CardContent>
            <Progress value={globalProgress} />
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">Mes OKRs</h2>
          <NewOkrDialog />
        </div>

        {userOkrs.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucun objectif pour l&apos;instant. Créez votre premier OKR pour
              commencer à verrouiller votre exécution.
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

        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              Historique de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckinHistory checkins={recentCheckins} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-xl">
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
