import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2.5">
          <span className="shadow-soft block size-6 overflow-hidden rounded-md">
            <Image
              src="/logo-mark.jpg"
              alt="Lock In"
              width={24}
              height={24}
              className="size-full object-cover object-top"
            />
          </span>
          <span className="font-display text-sm tracking-tight text-foreground lowercase">
            lock in
          </span>
        </div>

        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          L&apos;excellence n&apos;est pas une destination, c&apos;est une quête.
        </p>

        <div className="flex gap-6 text-xs text-muted-foreground">
          <Link href="/legal/mentions" className="hover:text-brand-blue">
            Mentions légales
          </Link>
          <Link href="/legal/cgv" className="hover:text-brand-blue">
            CGV
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-brand-blue">
            Confidentialité
          </Link>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} Lock In. Tous droits réservés.
      </p>
    </footer>
  );
}
