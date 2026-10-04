import { LifeBuoy, MessageCircle, Rss, Target, UserRound, UsersRound } from "lucide-react";

const MODULES = [
  {
    icon: Rss,
    title: "Feed",
    description: "Posts courts, photos et vidéos, likes et commentaires — filtrés par discipline, sport ou pays.",
  },
  {
    icon: UserRound,
    title: "Profil",
    description: "Un profil type LinkedIn + lifestyle : objectifs, routines, niveau Lockin, liens externes.",
  },
  {
    icon: UsersRound,
    title: "Groupes",
    description: "Par ville, sport, métier ou thématique. Publie, discute, retrouve les tiens.",
  },
  {
    icon: Target,
    title: "Objectifs",
    description: "Objectifs personnels et professionnels sur 30 jours, routines matin et soir à cocher.",
  },
  {
    icon: LifeBuoy,
    title: "Entraide",
    description: "Pose une question, réponds, vote — les meilleures réponses remontent en tête.",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    description: "Messagerie privée pour échanger directement avec un membre du Club.",
  },
];

/** Grille brutaliste des modules du Social Club — zéro carte arrondie, zéro ombre. */
export function ModulesShowcase() {
  return (
    <section id="modules" className="camp-scope border-b border-camp-hairline px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs font-bold tracking-[0.3em] text-camp-gold uppercase">
          Dans le Club
        </p>
        <h2 className="font-display mt-4 max-w-xl text-3xl font-bold text-camp-charcoal sm:text-4xl">
          Tout ce qu&apos;il faut pour avancer, ensemble
        </h2>

        <div className="mt-16 grid gap-px overflow-hidden border border-camp-hairline bg-camp-hairline sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m.title} className="bg-camp-white p-8 lg:p-10">
              <m.icon className="size-5 text-camp-gold" strokeWidth={1.5} />
              <h3 className="font-display mt-6 text-sm font-bold tracking-[0.04em] text-camp-charcoal uppercase">
                {m.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-camp-charcoal/55">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
