import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  pgEnum,
  date,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export type AuditRoadmapPhase = {
  phase: string;
  focus: string;
  durationWeeks: number;
};

export const okrStatusEnum = pgEnum("okr_status", [
  "in_progress",
  "completed",
]);

export const aiRoleEnum = pgEnum("ai_role", ["user", "assistant"]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "daily_motivation",
  "system",
]);

export const aiCoachToneEnum = pgEnum("ai_coach_tone", [
  "bienveillant",
  "exigeant",
  "scientifique",
  "creatif",
  "founder_mode",
]);

export const aiCoachAppearanceEnum = pgEnum("ai_coach_appearance", [
  "masculin",
  "feminin",
  "neutre",
  "minimaliste",
]);

export const aiCoachVisualStyleEnum = pgEnum("ai_coach_visual_style", [
  "friendly_silicon_valley",
  "premium_minimaliste",
  "dark_mode_founder",
  "gradient_mode",
  "ultra_minimal",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  sector: text("sector"),
  skills: text("skills"),
  whopMembershipId: text("whop_membership_id").unique(),
  whopPlanId: text("whop_plan_id"),
  whopMembershipStatus: text("whop_membership_status"),
  whopCurrentPeriodEnd: timestamp("whop_current_period_end", {
    mode: "date",
  }),
  aiCoachName: text("ai_coach_name"),
  aiCoachTone: aiCoachToneEnum("ai_coach_tone").notNull().default("bienveillant"),
  aiCoachAppearance: aiCoachAppearanceEnum("ai_coach_appearance")
    .notNull()
    .default("neutre"),
  aiCoachVisualStyle: aiCoachVisualStyleEnum("ai_coach_visual_style")
    .notNull()
    .default("friendly_silicon_valley"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const okrs = pgTable("okrs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  targetValue: numeric("target_value", { precision: 12, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  unit: text("unit").notNull(),
  status: okrStatusEnum("status").notNull().default("in_progress"),
  dueDate: date("due_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date", { mode: "date" }).notNull(),
  rating: integer("rating").notNull(),
  wins: text("wins"),
  bottlenecks: text("bottlenecks"),
  focusOfTomorrow: text("focus_of_tomorrow"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const onboardingAudits = pgTable("onboarding_audits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Étape 1 — Profil personnel
  motivations: text("motivations"),
  psychologicalBlockers: text("psychological_blockers").notNull(),
  currentRoutine: text("current_routine").notNull(),
  disciplineLevel: integer("discipline_level").notNull(),
  // Étape 2 — Profil professionnel
  sector: text("sector").notNull(),
  revenueLevel: text("revenue_level").notNull(),
  businessGoals: text("business_goals").notNull(),
  // Étape 3 — Projet & horizon temporel
  majorGoal: text("major_goal").notNull(),
  durationMonths: integer("duration_months").notNull(),
  // Généré par l'IA
  lockInBlocker: text("lock_in_blocker").notNull(),
  roadmap: jsonb("roadmap").$type<AuditRoadmapPhase[]>().notNull(),
  firstWeekActions: jsonb("first_week_actions").$type<string[]>().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const dailyFocus = pgTable(
  "daily_focus",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date", { mode: "date" }).notNull(),
    taskDescription: text("task_description").notNull(),
    taskCompleted: boolean("task_completed").notNull().default(false),
    disciplineRating: integer("discipline_rating"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("daily_focus_user_date_idx").on(table.userId, table.date)],
);

export const planningTasks = pgTable("planning_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes"),
  dueDate: date("due_date", { mode: "date" }),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull().default("daily_motivation"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    read: boolean("read").notNull().default(false),
    sendDate: date("send_date", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("notifications_user_type_date_idx").on(
      table.userId,
      table.type,
      table.sendDate,
    ),
  ],
);

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: aiRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  okrs: many(okrs),
  dailyCheckins: many(dailyCheckins),
  aiConversations: many(aiConversations),
  onboardingAudits: many(onboardingAudits),
  dailyFocusEntries: many(dailyFocus),
  planningTasks: many(planningTasks),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const planningTasksRelations = relations(planningTasks, ({ one }) => ({
  user: one(users, { fields: [planningTasks.userId], references: [users.id] }),
}));

export const onboardingAuditsRelations = relations(
  onboardingAudits,
  ({ one }) => ({
    user: one(users, {
      fields: [onboardingAudits.userId],
      references: [users.id],
    }),
  }),
);

export const dailyFocusRelations = relations(dailyFocus, ({ one }) => ({
  user: one(users, { fields: [dailyFocus.userId], references: [users.id] }),
}));

export const okrsRelations = relations(okrs, ({ one }) => ({
  user: one(users, { fields: [okrs.userId], references: [users.id] }),
}));

export const dailyCheckinsRelations = relations(dailyCheckins, ({ one }) => ({
  user: one(users, { fields: [dailyCheckins.userId], references: [users.id] }),
}));

export const aiConversationsRelations = relations(
  aiConversations,
  ({ one }) => ({
    user: one(users, {
      fields: [aiConversations.userId],
      references: [users.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Okr = typeof okrs.$inferSelect;
export type NewOkr = typeof okrs.$inferInsert;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type NewDailyCheckin = typeof dailyCheckins.$inferInsert;
export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;
export type OnboardingAudit = typeof onboardingAudits.$inferSelect;
export type NewOnboardingAudit = typeof onboardingAudits.$inferInsert;
export type DailyFocus = typeof dailyFocus.$inferSelect;
export type NewDailyFocus = typeof dailyFocus.$inferInsert;
export type PlanningTask = typeof planningTasks.$inferSelect;
export type NewPlanningTask = typeof planningTasks.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
