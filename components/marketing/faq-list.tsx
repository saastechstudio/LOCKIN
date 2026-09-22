import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

export const SUBSCRIPTION_FAQ: FaqItem[] = [
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui. Ton abonnement est mensuel ou annuel, sans engagement au-delà de la période en cours. Tu gères tout depuis ton espace membre (Paramètres → Abonnement), en un clic.",
  },
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "14 jours d'accès complet dès l'inscription (carte requise, aucun prélèvement immédiat). Tu peux annuler à tout moment pendant l'essai sans être débité.",
  },
  {
    question: "Que se passe-t-il si j'annule pendant l'essai ?",
    answer:
      "Aucun prélèvement n'est effectué et tu perds l'accès à la fin de la période d'essai. Simple et sans surprise.",
  },
  {
    question: "Mes données et paiements sont-ils sécurisés ?",
    answer:
      "Les paiements sont traités par Stripe (leader mondial du paiement en ligne). Lock In ne stocke jamais tes coordonnées bancaires. Tes données membre restent privées et ne sont jamais revendues.",
  },
  {
    question: "Quelle est la différence entre mensuel et annuel ?",
    answer:
      "Même accès complet dans les deux cas. L'abonnement annuel est payé en une fois et te fait économiser sur le tarif mensuel équivalent.",
  },
];

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-8 space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-lg border border-brand-border bg-brand-card/50 px-4 py-3 open:pb-4"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
            {item.question}
            <ChevronDown className="size-4 shrink-0 text-brand-coral transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
