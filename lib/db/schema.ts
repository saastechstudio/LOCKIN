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

export type AuditRoadmapStep = {
  title: string;
  durationWeeks: number;
  actions: string[];
};

export type AuditRoadmapPhase = {
  phase: string;
  objective: string;
  focus: string;
  steps: AuditRoadmapStep[];
  milestone: string;
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

export const moodEnum = pgEnum("mood", [
  "motive",
  "normal",
  "fatigue",
  "stresse",
]);

export const campRegistrationStatusEnum = pgEnum("camp_registration_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export type CampSportChoice = {
  day: number;
  activityId: string;
};

export const groupTypeEnum = pgEnum("group_type", [
  "city",
  "sport",
  "profession",
  "theme",
  "circle",
]);

export const goalCategoryEnum = pgEnum("goal_category", [
  "personal",
  "professional",
]);

export const routinePeriodEnum = pgEnum("routine_period", [
  "morning",
  "evening",
]);

// Modération Lockin — cf. lib/moderation/.
export const moderationSourceEnum = pgEnum("moderation_source", [
  "auto_filter",
  "report",
  "manual",
]);

export const moderationActionEnum = pgEnum("moderation_action", [
  "warning",
  "block_24h",
  "suspend_7d",
  "ban",
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "post",
  "comment",
  "message",
  "help_answer",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "insulte",
  "harcelement",
  "discrimination",
  "spam",
  "autre",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "dismissed",
]);

export type ProfileLink = {
  label: string;
  url: string;
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  sector: text("sector"),
  skills: text("skills"),
  // Lockin Social Club — profil public (Twitter x LinkedIn Lockin)
  country: text("country"),
  city: text("city"),
  mainSport: text("main_sport"),
  lockinLevel: integer("lockin_level").notNull().default(1),
  links: jsonb("links").$type<ProfileLink[]>().notNull().default([]),
  // Rituel d'inscription Lockin — "Pourquoi veux-tu devenir Lockin ?"
  // devient le premier post ; le timestamp sert de porte d'entrée vers le
  // Social Club (cf. requireLockinOnboarded dans lib/auth.ts).
  motivationInitiale: text("motivation_initiale"),
  lockinOnboardingCompletedAt: timestamp("lockin_onboarding_completed_at", {
    mode: "date",
  }),
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
  // Modération Lockin — score de respect (baisse sur contenu bloqué ou
  // signalement confirmé), strikes 1→4, sanctions, et accès au dashboard
  // de modération. Cf. lib/moderation/.
  respectScore: integer("respect_score").notNull().default(100),
  strikeCount: integer("strike_count").notNull().default(0),
  suspendedUntil: timestamp("suspended_until", { mode: "date" }),
  bannedAt: timestamp("banned_at", { mode: "date" }),
  isAdmin: boolean("is_admin").notNull().default(false),
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
    mood: moodEnum("mood"),
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

export const campSessions = pgTable("camp_sessions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  destination: text("destination").notNull().default("Phuket"),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  pricePerPerson: numeric("price_per_person", { precision: 10, scale: 2 }).notNull(),
  totalSpots: integer("total_spots").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const campRegistrations = pgTable(
  "camp_registrations",
  {
    id: serial("id").primaryKey(),
    // Nullable : le camp se réserve sans compte (page publique, pas de
    // Clerk). Quand le visiteur est quand même connecté, on rattache la
    // pré-inscription à son compte en plus — mais ça n'est jamais requis.
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: integer("session_id")
      .notNull()
      .references(() => campSessions.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    sportChoices: jsonb("sport_choices").$type<CampSportChoice[]>().notNull().default([]),
    excursionChoices: jsonb("excursion_choices").$type<string[]>().notNull().default([]),
    // Nullable : ajouté après coup (programme officiel), les anciennes
    // lignes n'en ont pas — jamais bloquant pour une pré-inscription déjà
    // en base.
    funActivityChoice: text("fun_activity_choice"),
    status: campRegistrationStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // Dédoublonne par email plutôt que par utilisateur — userId est souvent
    // absent (réservation anonyme), l'email est la seule identité fiable.
    uniqueIndex("camp_registrations_session_email_idx").on(table.sessionId, table.email),
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

// ---------------------------------------------------------------------------
// Lockin Social Club — réseau social interne (feed, groupes, messages,
// objectifs, entraide). Tables additives uniquement ; les modules se
// branchent dessus indépendamment (lib/actions/feed.ts, groups.ts, etc.).
// ---------------------------------------------------------------------------

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: groupTypeEnum("type").notNull(),
  description: text("description"),
  // Les "petits cercles Lockin" (messages privés groupés) sont des groupes
  // privés : même table, pas de système dédié.
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("group_members_group_user_idx").on(table.groupId, table.userId)],
);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  // Tag libre aligné sur le vocabulaire Lockin (Discipline, Sport, Business,
  // Mindset, Lifestyle — cf. lib/social/data.ts LOCKIN_TAGS).
  tag: text("tag"),
  sport: text("sport"),
  country: text("country"),
  // Null = feed global ; sinon post dans un groupe.
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const postLikes = pgTable(
  "post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("post_likes_post_user_idx").on(table.postId, table.userId)],
);

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: goalCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  // Horizon en jours (30/60/90) — libre, pas un enum, pour rester simple.
  horizonDays: integer("horizon_days"),
  // Domaine libre (Santé/Sport/Business/Discipline/Mindset/Lifestyle), posé
  // par le rituel d'inscription — cf. lib/social/data.ts LOCKIN_TAGS.
  domain: text("domain"),
  progress: integer("progress").notNull().default(0),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const routineItems = pgTable("routine_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  period: routinePeriodEnum("period").notNull(),
  label: text("label").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const routineCheckins = pgTable(
  "routine_checkins",
  {
    id: serial("id").primaryKey(),
    routineItemId: integer("routine_item_id")
      .notNull()
      .references(() => routineItems.id, { onDelete: "cascade" }),
    date: date("date", { mode: "date" }).notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("routine_checkins_item_date_idx").on(table.routineItemId, table.date),
  ],
);

export const helpQuestions = pgTable("help_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const helpAnswers = pgTable("help_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => helpQuestions.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const helpUpvotes = pgTable(
  "help_upvotes",
  {
    id: serial("id").primaryKey(),
    answerId: integer("answer_id")
      .notNull()
      .references(() => helpAnswers.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("help_upvotes_answer_user_idx").on(table.answerId, table.userId)],
);

/**
 * Journal de modération — chaque filtrage automatique bloqué et chaque
 * signalement confirmé par un modérateur y ajoute une ligne. `action` est
 * la sanction effectivement appliquée (ou null pour un simple log sans
 * sanction) ; cette ligne EST le "strike" demandé par le produit — pas de
 * table séparée, `users.strikeCount` compte combien de lignes ont une
 * action non nulle.
 */
export const moderationEvents = pgTable("moderation_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  source: moderationSourceEnum("source").notNull(),
  reason: text("reason").notNull(),
  contentSnapshot: text("content_snapshot"),
  action: moderationActionEnum("action"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const moderationReports = pgTable("moderation_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: integer("reported_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetTypeEnum("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  reason: reportReasonEnum("reason").notNull(),
  details: text("details"),
  status: reportStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  okrs: many(okrs),
  dailyCheckins: many(dailyCheckins),
  aiConversations: many(aiConversations),
  onboardingAudits: many(onboardingAudits),
  dailyFocusEntries: many(dailyFocus),
  planningTasks: many(planningTasks),
  notifications: many(notifications),
  campRegistrations: many(campRegistrations),
  posts: many(posts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  groupMemberships: many(groupMembers),
  goals: many(goals),
  routineItems: many(routineItems),
  helpQuestions: many(helpQuestions),
  helpAnswers: many(helpAnswers),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  moderationEvents: many(moderationEvents),
  reportsFiled: many(moderationReports, { relationName: "reporter" }),
  reportsAgainst: many(moderationReports, { relationName: "reportedUser" }),
}));

export const moderationEventsRelations = relations(moderationEvents, ({ one }) => ({
  user: one(users, { fields: [moderationEvents.userId], references: [users.id] }),
}));

export const moderationReportsRelations = relations(moderationReports, ({ one }) => ({
  reporter: one(users, {
    fields: [moderationReports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reportedUser: one(users, {
    fields: [moderationReports.reportedUserId],
    references: [users.id],
    relationName: "reportedUser",
  }),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  posts: many(posts),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  group: one(groups, { fields: [posts.groupId], references: [groups.id] }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  user: one(users, { fields: [postComments.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const routineItemsRelations = relations(routineItems, ({ one, many }) => ({
  user: one(users, { fields: [routineItems.userId], references: [users.id] }),
  checkins: many(routineCheckins),
}));

export const routineCheckinsRelations = relations(routineCheckins, ({ one }) => ({
  routineItem: one(routineItems, {
    fields: [routineCheckins.routineItemId],
    references: [routineItems.id],
  }),
}));

export const helpQuestionsRelations = relations(helpQuestions, ({ one, many }) => ({
  user: one(users, { fields: [helpQuestions.userId], references: [users.id] }),
  answers: many(helpAnswers),
}));

export const helpAnswersRelations = relations(helpAnswers, ({ one, many }) => ({
  question: one(helpQuestions, {
    fields: [helpAnswers.questionId],
    references: [helpQuestions.id],
  }),
  user: one(users, { fields: [helpAnswers.userId], references: [users.id] }),
  upvotes: many(helpUpvotes),
}));

export const helpUpvotesRelations = relations(helpUpvotes, ({ one }) => ({
  answer: one(helpAnswers, { fields: [helpUpvotes.answerId], references: [helpAnswers.id] }),
  user: one(users, { fields: [helpUpvotes.userId], references: [users.id] }),
}));

export const campSessionsRelations = relations(campSessions, ({ many }) => ({
  registrations: many(campRegistrations),
}));

export const campRegistrationsRelations = relations(campRegistrations, ({ one }) => ({
  user: one(users, { fields: [campRegistrations.userId], references: [users.id] }),
  session: one(campSessions, {
    fields: [campRegistrations.sessionId],
    references: [campSessions.id],
  }),
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
export type CampSession = typeof campSessions.$inferSelect;
export type NewCampSession = typeof campSessions.$inferInsert;
export type CampRegistration = typeof campRegistrations.$inferSelect;
export type NewCampRegistration = typeof campRegistrations.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type NewPostComment = typeof postComments.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type RoutineItem = typeof routineItems.$inferSelect;
export type NewRoutineItem = typeof routineItems.$inferInsert;
export type RoutineCheckin = typeof routineCheckins.$inferSelect;
export type HelpQuestion = typeof helpQuestions.$inferSelect;
export type NewHelpQuestion = typeof helpQuestions.$inferInsert;
export type HelpAnswer = typeof helpAnswers.$inferSelect;
export type NewHelpAnswer = typeof helpAnswers.$inferInsert;
export type HelpUpvote = typeof helpUpvotes.$inferSelect;
export type ModerationEvent = typeof moderationEvents.$inferSelect;
export type NewModerationEvent = typeof moderationEvents.$inferInsert;
export type ModerationReport = typeof moderationReports.$inferSelect;
export type NewModerationReport = typeof moderationReports.$inferInsert;
