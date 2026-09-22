import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";

import { db } from "@/lib/db";
import { onboardingAudits } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { getModelCandidates, markProviderBroken } from "@/lib/ai/model";
import {
  auditInputSchema,
  auditResultSchema,
  buildAuditPrompt,
  AUDIT_SYSTEM_PROMPT,
  type AuditResult,
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

  const candidates = getModelCandidates();
  if (candidates.length === 0) {
    console.error("[audit/generate] No AI provider available");
    return NextResponse.json(
      { error: "La génération du programme a échoué. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  // Un fournisseur peut tomber en panne (crédit épuisé, quota, clé
  // invalide) sans que les autres le soient. On essaie chaque fournisseur
  // configuré dans l'ordre plutôt que d'échouer dès le premier problème.
  let result: AuditResult | undefined;
  for (const candidate of candidates) {
    try {
      ({ object: result } = await generateObject({
        model: candidate.model,
        schema: auditResultSchema,
        system: AUDIT_SYSTEM_PROMPT,
        prompt: buildAuditPrompt(input),
      }));
      break;
    } catch (error) {
      console.error(
        `[audit/generate] AI generation failed on ${candidate.id}`,
        error,
      );
      markProviderBroken(candidate.id);
    }
  }

  if (!result) {
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
