import "server-only";

import { UserFacingError } from "@/lib/action-result";
import type { User } from "@/lib/db/schema";
import { applyStrike, assertClubMember, assertNotSuspended, ModerationBlockedError } from "./enforce";

const ENDPOINT = "https://api.openai.com/v1/moderations";
const MODEL = "omni-moderation-latest";

type ModerationResponse = {
  results?: { flagged?: boolean; categories?: Record<string, boolean> }[];
};

/** Catégories signalées par le service, ou null si la réponse est inexploitable. */
export function flaggedCategories(json: ModerationResponse): string[] | null {
  const result = json.results?.[0];
  if (!result || typeof result.flagged !== "boolean") return null;
  if (!result.flagged) return [];
  const names = Object.entries(result.categories ?? {})
    .filter(([, on]) => on)
    .map(([name]) => name);
  return names.length > 0 ? names : ["flagged"];
}

/**
 * Modération d'une image avant publication (photo de profil). Service :
 * OpenAI omni-moderation (gratuit, lit les images), via OPENAI_API_KEY déjà
 * configurée pour l'IA du site.
 * - image refusée : même échelle de sanctions que le texte (strike) ;
 * - service indisponible : on refuse sans sanction (on ne publie jamais une
 *   image non vérifiée), le membre réessaie plus tard.
 */
export async function moderateImageOrThrow(user: User, bytes: Uint8Array, mime: string): Promise<void> {
  assertClubMember(user);
  assertNotSuspended(user);

  const apiKey = process.env.OPENAI_API_KEY;
  const unavailable = new UserFacingError(
    "La vérification de l'image est momentanément indisponible. Réessaie dans quelques minutes.",
  );
  if (!apiKey) {
    console.error("[moderation image] OPENAI_API_KEY manquante");
    throw unavailable;
  }

  let json: ModerationResponse;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        input: [
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}` },
          },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    json = (await response.json()) as ModerationResponse;
  } catch (error) {
    console.error("[moderation image]", error);
    throw unavailable;
  }

  const categories = flaggedCategories(json);
  if (categories === null) {
    console.error("[moderation image] réponse inattendue");
    throw unavailable;
  }
  if (categories.length === 0) return;

  await applyStrike(user.id, "auto_filter", `photo de profil : ${categories.join(", ")}`);
  throw new ModerationBlockedError(
    "Cette photo ne respecte pas la charte Lockin. Choisis une autre image.",
  );
}
