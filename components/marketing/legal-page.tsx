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
        <h1 className="font-serif text-3xl text-foreground">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
