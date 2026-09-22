import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";

import { db } from "@/lib/db";
import { onboardingAudits } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { resolveModel } from "@/lib/ai/model";
import {
  auditInputSchema,
  auditResultSchema,
  buildAuditPrompt,
  AUDIT_SYSTEM_PROMPT,
} from "@/lib/ai/audit";

export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();

  const body = await req.json();
  const parsed = auditInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Réponses invalides", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const input = parsed.data;

  let result;
  try {
    ({ object: result } = await generateObject({
      model: resolveModel(),
      schema: auditResultSchema,
      system: AUDIT_SYSTEM_PROMPT,
      prompt: buildAuditPrompt(input),
    }));
  } catch (error) {
    console.error("[audit/generate] AI generation failed", error);
    return NextResponse.json(
      { error: "La génération du programme a échoué. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  const [audit] = await db
    .insert(onboardingAudits)
    .values({
      userId: user.id,
      motivations: input.motivations,
      psychologicalBlockers: input.psychologicalBlockers,
      currentRoutine: input.currentRoutine,
      disciplineLevel: input.disciplineLevel,
      sector: input.sector,
      revenueLevel: input.revenueLevel,
      businessGoals: input.businessGoals,
      majorGoal: input.majorGoal,
      durationMonths: input.durationMonths,
      lockInBlocker: result.lockInBlocker,
      roadmap: result.roadmap,
      firstWeekActions: result.firstWeekActions,
    })
    .returning();

  return NextResponse.json({ auditId: audit.id, ...result });
}
