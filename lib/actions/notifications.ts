"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

export async function getRecentNotifications(limit = 10) {
  const user = await getOrCreateDbUser();
  return db.query.notifications.findMany({
    where: eq(notifications.userId, user.id),
    orderBy: [desc(notifications.createdAt)],
    limit,
  });
}

export async function getUnreadNotificationsCount() {
  const user = await getOrCreateDbUser();
  return db.$count(
    notifications,
    and(eq(notifications.userId, user.id), eq(notifications.read, false)),
  );
}

export async function markNotificationRead(notificationId: number) {
  const user = await getOrCreateDbUser();
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, user.id),
      ),
    );
  revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
  const user = await getOrCreateDbUser();
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, false)),
    );
  revalidatePath("/dashboard");
}
