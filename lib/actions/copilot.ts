"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { action, UserFacingError } from "@/lib/action-result";
import { getOrCreateDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiMemories, copilotBriefings, type BriefingContent } from "@/lib/db/schema";
import { generateStructured } from "@/lib/ai/structured";
import { startOfDay } from "@/lib/challenges-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { loadLifeOs } from "@/lib/life-os/snapshot";
import {
  COPILOT_SYSTEM,
  buildContext,
  eveningSchema,
  morningSchema,
  type ExtractedMemory,
} from "@/lib/copilot/briefing";

const MEMORY_CAP = 60;

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();

/** Ajoute les faits appris s'ils sont nouveaux ; au-delà du plafond, les plus anciens déduits s'effacent. */
async function rememberFacts(userId: number, facts: ExtractedMemory[]) {
  if (facts.length === 0) return;
  const existing = await db.query.aiMemories.findMany({
    where: eq(aiMemories.userId, userId),
    orderBy: [asc(aiMemories.updatedAt)],
  });
  const known = new Set(existing.map((m) => normalize(m.content)));
  const fresh = facts.filter((f) => f.content.trim() && !known.has(normalize(f.content)));
  if (fresh.length === 0) return;
  await db.insert(aiMemories).values(fresh.map((f) => ({ userId, kind: f.kind, content: f.content.trim() })));

  const overflow = existing.length + fresh.length - MEMORY_CAP;
  const removable = existing.filter((m) => m.source === "copilot").slice(0, Math.max(0, overflow));
  for (const m of removable) {
    await db.delete(aiMemories).where(and(eq(aiMemories.id, m.id), eq(aiMemories.userId, userId)));
  }
}

/**
 * Briefing du matin ou bilan du soir rédigé par l'IA, une fois par jour et
 * par moment, puis relu depuis la base. null quand aucun fournisseur IA ne
 * répond : le cockpit garde alors sa version calculée.
 */
export const requestBriefing = action(
  async (period: "morning" | "evening"): Promise<{ content: BriefingContent; author: string } | null> => {
    const parsed = z.enum(["morning", "evening"]).parse(period);
    const user = await getOrCreateDbUser();
    const today = startOfDay();

    const existing = await db.query.copilotBriefings.findFirst({
      where: and(
        eq(copilotBriefings.userId, user.id),
        eq(copilotBriefings.date, today),
        eq(copilotBriefings.period, parsed),
      ),
    });
    if (existing) return { content: existing.content, author: existing.author };

    enforceRateLimit("aiBriefing", user.id);
    const snapshot = await loadLifeOs(user);
    const context = buildContext(snapshot, snapshot.memories);

    const result =
      parsed === "morning"
        ? await generateStructured({
            schema: morningSchema,
            system: COPILOT_SYSTEM,
            prompt: `${context}\n\nRédige le briefing du matin : résumé de la journée, 1 à 3 priorités, habitudes à réaliser, prochain pas des objectifs, alertes importantes.`,
            label: "copilot/morning",
          })
        : await generateStructured({
            schema: eveningSchema,
            system: COPILOT_SYSTEM,
            prompt: `${context}\n\nRédige le bilan du soir : analyse des progrès du jour, évaluation de la discipline sur 100, réussites, manques, suggestions pour demain.`,
            label: "copilot/evening",
          });
    if (!result) return null;

    const { memories, ...rest } = result.object;
    const content = { period: parsed, ...rest } as BriefingContent;
    await db
      .insert(copilotBriefings)
      .values({ userId: user.id, date: today, period: parsed, content, author: result.provider })
      .onConflictDoNothing();
    await rememberFacts(user.id, memories);
    revalidatePath("/dashboard");
    return { content, author: result.provider };
  },
);

const memoryInput = z.object({
  kind: z.enum(["objectif", "projet", "habitude", "preference", "difficulte"]),
  content: z.string().trim().min(2, "Écris quelques mots.").max(200),
});

/** Le membre écrit lui-même ce que le copilote doit retenir. */
export const addMemory = action(async (input: z.infer<typeof memoryInput>) => {
  const user = await getOrCreateDbUser();
  enforceRateLimit("lifeOs", user.id);
  const parsed = memoryInput.parse(input);
  await db.insert(aiMemories).values({ userId: user.id, kind: parsed.kind, content: parsed.content, source: "member" });
  revalidatePath("/dashboard/coach");
});

export const deleteMemory = action(async (memoryId: number) => {
  const user = await getOrCreateDbUser();
  const id = z.number().int().positive().parse(memoryId);
  const deleted = await db
    .delete(aiMemories)
    .where(and(eq(aiMemories.id, id), eq(aiMemories.userId, user.id)))
    .returning({ id: aiMemories.id });
  if (deleted.length === 0) throw new UserFacingError("Souvenir introuvable.");
  revalidatePath("/dashboard/coach");
  revalidatePath("/dashboard");
});
