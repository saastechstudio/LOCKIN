import Link from "next/link";

import { Logo } from "@/components/lockin/logo";
import { SLOGAN } from "@/components/lockin/primitives";

const LINKS = [
  { href: "/legal/cgu", label: "CGU" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/charte-moderation", label: "Charte" },
  // Les coordonnées de contact (générale, juridique, modération) vivent dans les mentions légales.
  { href: "/legal/mentions", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-camp-charcoal">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo size="lg" />
            <p className="mt-4 text-sm text-camp-charcoal/60">{SLOGAN}</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-camp-charcoal/60 transition-colors hover:text-camp-charcoal"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-camp-hairline pt-6 text-xs text-camp-charcoal/40">
          <span>© {new Date().getFullYear()} Lockin Social Club</span>
          <Link href="/legal/mentions" className="transition-colors hover:text-camp-charcoal">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
