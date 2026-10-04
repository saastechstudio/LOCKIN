import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Chrome public pour tout /camp/** — même header/footer que la landing
 * (donc le retour "Accueil" est juste le logo), mais le contenu lui-même
 * vit dans sa propre identité visuelle (.camp-scope, marron + beige crème).
 * Aucune dépendance à Clerk ici : ces pages doivent rester accessibles sans
 * compte.
 */
export default function CampLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="camp-scope flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
