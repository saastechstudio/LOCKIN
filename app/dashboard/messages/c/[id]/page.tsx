import { notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";

import { requireLockinOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, habits, lifeSpheres } from "@/lib/db/schema";
import { fetchMessages, getConversationFor } from "@/lib/channel/queries";
import { getPactView } from "@/lib/channel/pact-view";
import { Thread, type ThreadMeta } from "@/components/channel/thread";
import { PactInvite, PactPanel } from "@/components/channel/pact-panel";
import { SummaryButton } from "@/components/channel/summary-panel";
import { LinkButton } from "@/components/channel/link-picker";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireLockinOnboarded();
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) notFound();

  const data = await getConversationFor(user.id, conversationId);
  if (!data) notFound();
  const { conversation, people, title } = data;
  const pact = conversation.pact;

  const [messages, pactView, goalRows, habitRows, sphereRows] = await Promise.all([
    fetchMessages(user.id, conversationId, {}),
    pact?.status === "active" ? getPactView(user, conversationId) : Promise.resolve(null),
    db.query.goals.findMany({ columns: { id: true, title: true }, where: eq(goals.userId, user.id) }),
    db.query.habits.findMany({ columns: { id: true, label: true }, where: and(eq(habits.userId, user.id), isNull(habits.archivedAt)) }),
    db.query.lifeSpheres.findMany({ columns: { id: true, name: true }, where: eq(lifeSpheres.userId, user.id) }),
  ]);

  const links: ThreadMeta["links"] = [];
  const goal = goalRows.find((g) => g.id === conversation.goalId);
  const habit = habitRows.find((h) => h.id === conversation.habitId);
  const sphere = sphereRows.find((s) => s.id === conversation.sphereId);
  if (goal) links.push({ type: "goal", label: goal.title, href: "/dashboard/objectifs" });
  if (habit) links.push({ type: "habit", label: habit.label, href: "/dashboard/habitudes" });
  if (sphere) links.push({ type: "sphere", label: sphere.name, href: `/dashboard/sphere/${sphere.id}` });

  const meta: ThreadMeta = {
    id: conversation.id,
    kind: conversation.kind,
    title,
    topic: conversation.topic,
    people,
    meId: user.id,
    pactStatus: pact?.status ?? null,
    links,
  };
  const initiator = people.find((p) => p.id === pact?.initiatorId);

  return (
    <Thread
      meta={meta}
      initialMessages={messages}
      headerExtra={
        <>
          <LinkButton
            conversationId={conversation.id}
            options={{
              goals: goalRows.map((g) => ({ id: g.id, label: g.title })),
              habits: habitRows.map((h) => ({ id: h.id, label: h.label })),
              spheres: sphereRows.map((s) => ({ id: s.id, label: s.name })),
              current: { goalId: conversation.goalId, habitId: conversation.habitId, sphereId: conversation.sphereId },
            }}
          />
          <SummaryButton conversationId={conversation.id} initial={conversation.summary} />
        </>
      }
    >
      {pact?.status === "pending" && pact.partnerId === user.id ? <PactInvite pactId={pact.id} from={initiator?.name ?? "Un membre"} /> : null}
      {pactView ? <PactPanel view={pactView} /> : null}
    </Thread>
  );
}
