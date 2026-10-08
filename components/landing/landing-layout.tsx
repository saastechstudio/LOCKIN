import Link from "next/link";

import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
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
      <header className="sticky top-0 z-40 border-b border-lk-line bg-lk-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="sm" wordmarkFrom="sm" />

          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link
              href="/sign-in"
              className="whitespace-nowrap text-lk-stone-3 transition-colors hover:text-lk-black"
            >
              Connexion
            </Link>
            <Button asChild size="sm">
              <Link href={JOIN_HREF}>Entrer</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
