/**
 * Chrome pour tout /camp/** — volontairement nu : pas le header/footer
 * générique du site (bleu/corail/or), chaque page porte sa propre identité
 * brutaliste (logo dans le Hero, Footer dédié). `.camp-scope` fixe le fond
 * crème par défaut pour les zones qui ne définissent pas leur propre
 * couleur de fond. Aucune dépendance à Clerk ici : ces pages doivent rester
 * accessibles sans compte.
 */
export default function CampLayout({ children }: { children: React.ReactNode }) {
  return <div className="camp-scope min-h-screen">{children}</div>;
}
