import Link from "next/link";

import { Footer } from "@/components/landing/footer";
import { Logo } from "@/components/lockin/logo";

/**
 * Entrer dans le club = créer son compte puis faire le rituel (/rejoindre),
 * comme la landing le promet ; sans ce redirect_url, l'inscription
 * enverrait vers l'audit coaching (/onboarding).
 */
export const JOIN_HREF = "/sign-up?redirect_url=%2Frejoindre";

/**
 * Coque de la landing Lockin Social Club — fond blanc imposé (camp-scope,
 * indépendant du thème clair/sombre du reste du site), en-tête minimal :
 * le cadenas Lockin et deux portes d'entrée, rien d'autre.
 */
export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="camp-scope flex min-h-screen flex-col">
      <header className="border-b border-camp-hairline">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="sm" wordmarkFrom="sm" />

          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link
              href="/sign-in"
              className="whitespace-nowrap text-camp-charcoal/60 transition-colors hover:text-camp-charcoal"
            >
              Connexion
            </Link>
            <Link
              href={JOIN_HREF}
              className="border border-camp-charcoal px-4 py-2 font-medium text-camp-charcoal transition-colors hover:bg-camp-charcoal hover:text-camp-white"
            >
              Entrer
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
