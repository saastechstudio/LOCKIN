/** Vrai seulement pour une URL https absolue — refuse javascript:, data:, http:, chemins relatifs. */
export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}
