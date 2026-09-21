import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications, onboardingAudits } from "@/lib/db/schema";
import {
  buildDailyMotivationContent,
  isResendConfigured,
  sendDailyMotivationEmail,
} from "@/lib/notifications";

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Fired once a day at 10h (Europe/Paris) by the `.github/workflows/
 * daily-motivation-cron.yml` GitHub Action. Idempotent — the unique
 * (userId, type, sendDate) index means re-running it for the same day
 * only ever inserts each member's notification once.
 */
export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfToday();

  const [allUsers, latestAudits] = await Promise.all([
    db.query.users.findMany(),
    db.query.onboardingAudits.findMany({
      orderBy: [desc(onboardingAudits.createdAt)],
    }),
  ]);

  const latestAuditByUserId = new Map<number, (typeof latestAudits)[number]>();
  for (const audit of latestAudits) {
    if (!latestAuditByUserId.has(audit.userId)) {
      latestAuditByUserId.set(audit.userId, audit);
    }
  }

  let created = 0;
  let emailed = 0;

  for (const user of allUsers) {
    const audit = latestAuditByUserId.get(user.id);
    const firstName = user.name?.split(" ")[0] ?? "Membre";

    const content = buildDailyMotivationContent({
      firstName,
      majorGoal: audit?.majorGoal,
      roadmap: audit?.roadmap,
      date: today,
    });

    const [inserted] = await db
      .insert(notifications)
      .values({
        userId: user.id,
        type: "daily_motivation",
        title: content.title,
        body: content.body,
        sendDate: today,
      })
      .onConflictDoNothing({
        target: [notifications.userId, notifications.type, notifications.sendDate],
      })
      .returning();

    if (!inserted) continue;
    created += 1;

    if (isResendConfigured && user.email) {
      const sent = await sendDailyMotivationEmail({
        to: user.email,
        title: content.title,
        body: content.body,
      });
      if (sent) emailed += 1;
    }
  }

  return NextResponse.json({
    totalUsers: allUsers.length,
    notificationsCreated: created,
    emailsSent: emailed,
    resendConfigured: isResendConfigured,
  });
}
