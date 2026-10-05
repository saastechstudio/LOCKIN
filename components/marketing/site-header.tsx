import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileSiteNav } from "@/components/marketing/mobile-site-nav";
import { Logo } from "@/components/lockin/logo";

const NAV_LINKS = [
  { href: "/#mouvement", label: "Le Club" },
  { href: "/camp", label: "Lock-In Camp" },
  { href: "/methode", label: "La Méthode" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo size="sm" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-brand-blue"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/sign-in">Connexion</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/sign-up">Rejoindre le Club</Link>
          </Button>
          <MobileSiteNav />
        </div>
      </div>
    </header>
  );
}
