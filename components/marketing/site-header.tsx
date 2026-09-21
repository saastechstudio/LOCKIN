import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "#pillars", label: "Le Club" },
  { href: "#pricing", label: "Tarifs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-mark.svg" alt="Lock In" width={28} height={28} />
          <span className="font-display text-lg tracking-[0.18em] text-foreground">
            LOCK IN
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-brand-prune"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/sign-in">Connexion</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Rejoindre le Club</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
