/**
 * N'accepte qu'un chemin interne ("/..."), jamais "//domaine" ni une URL
 * absolue : `next` / `redirect_url` viennent de la query string, donc
 * d'une source non fiable (sinon : redirection ouverte vers un autre site).
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return null;
  }
  return next;
}

/**
 * Clerk transmet parfois `redirect_url` en URL absolue (ex. depuis
 * auth.protect) : on la ramène à un chemin interne si elle pointe vers ce
 * même site, sinon on l'ignore. Côté client uniquement (window).
 */
export function safeRedirectFromUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return safeNextPath(url.pathname + url.search);
  } catch {
    return null;
  }
}
