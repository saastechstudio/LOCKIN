import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-noise">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-24">
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:text-foreground [&_h2]:first:mt-0 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_strong]:text-foreground [&_strong]:font-medium">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
