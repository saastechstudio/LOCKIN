import { z } from "zod";

import { CREATOR_VERIFICATION_LIMITS as L } from "@/lib/formations-data";
import { isHttpsUrl } from "@/lib/safe-url";

/** Demande de vérification : validée à l'identique par le formulaire et l'action serveur. */
export const submitVerificationSchema = z.object({
  legalName: z
    .string()
    .trim()
    .max(L.legalName)
    .refine((v) => /\S+\s+\S+/.test(v), "Indique ton prénom et ton nom, tels qu'ils figurent sur ta pièce d'identité."),
  presentation: z
    .string()
    .trim()
    .min(L.presentationMin, `Présente ton expertise en ${L.presentationMin} caractères minimum.`)
    .max(L.presentation),
  proofUrl: z
    .string()
    .trim()
    .max(L.proofUrl)
    .refine(isHttpsUrl, "Le lien de preuve doit être une adresse https:// (LinkedIn, site, portfolio…)."),
  certified: z.literal(true, { error: "Tu dois certifier l'exactitude de ces informations." }),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;

/**
 * Décision d'un administrateur. Refuser ou retirer exige un motif, montré
 * au membre : on ne sanctionne pas sans dire pourquoi.
 */
export const decisionSchema = z
  .object({
    verificationId: z.number().int(),
    decision: z.enum(["approve", "reject", "revoke"]),
    note: z.string().trim().max(L.decisionNote).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision !== "approve" && (value.note ?? "").length < 5) {
      ctx.addIssue({ code: "custom", path: ["note"], message: "Indique un motif (5 caractères minimum)." });
    }
  });

export type DecisionInput = z.infer<typeof decisionSchema>;

/** Transitions autorisées : on n'approuve que ce qui est en attente ou refusé, on ne retire que ce qui est approuvé. */
export function canTransition(status: string, decision: DecisionInput["decision"]): boolean {
  if (decision === "approve") return status === "pending" || status === "rejected";
  if (decision === "reject") return status === "pending";
  return status === "approved"; // revoke
}
