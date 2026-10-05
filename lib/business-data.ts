export const BUSINESS_KINDS = ["offre", "recherche", "partenariat"] as const;
export type BusinessKind = (typeof BUSINESS_KINDS)[number];

export const BUSINESS_KIND_LABELS: Record<BusinessKind, string> = {
  offre: "Offre",
  recherche: "Recherche",
  partenariat: "Partenariat",
};
