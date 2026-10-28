import { randomInt } from "node:crypto";

/**
 * Numéro de membre du Lockin Social Club : « LT- » + 6 caractères tirés au
 * hasard, sans les signes qui se confondent (0/O, 1/I/L). C'est la clé
 * d'entrée du club : aléatoire, jamais séquentiel, pour ne pas se deviner.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 6;

export function generateMemberNumber(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `LT-${code}`;
}

/** Tolère minuscules, espaces et tirets saisis à la main : « lt a7k 2mq » → « LT-A7K2MQ ». */
export function normalizeMemberNumber(input: string): string | null {
  const compact = input.toUpperCase().replace(/[\s-]/g, "");
  const body = compact.startsWith("LT") ? compact.slice(2) : compact;
  if (body.length !== LENGTH || ![...body].every((c) => ALPHABET.includes(c))) return null;
  return `LT-${body}`;
}
