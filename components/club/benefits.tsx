import { Reveal } from "./reveal";

const BENEFITS = [
  {
    title: "Des rencontres choisies",
    text: "Chaque membre a fait le même voyage que toi. Tu ne croises pas des inconnus : tu retrouves des personnes qui avancent.",
    how: "Entrée avec un numéro de membre, jamais sur simple inscription.",
  },
  {
    title: "Des groupes qui te ressemblent",
    text: "Par ville, par sport, par métier ou par thème : tu trouves vite avec qui échanger.",
    how: "Groupes ouverts aux seuls membres, avec leur propre fil.",
  },
  {
    title: "De l'entraide, pas du bruit",
    text: "Une question, une réponse utile. Les membres s'aident entre eux sur ce qu'ils savent faire.",
    how: "Espace de questions et réponses, modéré selon une charte claire.",
  },
  {
    title: "Des objectifs qui tiennent",
    text: "Un cap à 30 jours, des routines matin et soir, une progression que tu vois avancer.",
    how: "Objectifs, routines et suivi personnel, dès ton entrée.",
  },
  {
    title: "Des mentors à portée de message",
    text: "Des membres plus avancés que toi sur un sujet, et prêts à en parler.",
    how: "Annuaire de mentors et messagerie privée entre membres.",
  },
  {
    title: "Des défis pour passer à l'action",
    text: "Se lancer seul est dur. À plusieurs, avec une échéance, c'est plus simple.",
    how: "Défis collectifs auxquels tu t'inscris quand tu veux.",
  },
];

export function ClubBenefits() {
  return (
    <section className="club-section club-grain bg-club-sand">
      <div className="club-container">
        <Reveal>
          <p className="club-eyebrow text-club-bordeaux">Ce qui change</p>
        </Reveal>
        <Reveal blur delay={0.1} as="h2">
          <span className="club-display club-h2 mt-6 block max-w-3xl text-balance">
            Un environnement qui <em className="text-club-bordeaux">tire vers le haut</em>.
          </span>
        </Reveal>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-club-concrete/40 bg-club-concrete/40 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className="bg-club-ivory p-8 lg:p-10">
              <Reveal delay={(i % 3) * 0.08}>
                <span className="text-[11px] tracking-[0.26em] text-club-concrete-deep">0{i + 1}</span>
                <h3 className="club-display mt-5 text-[1.55rem] leading-tight">{b.title}</h3>
                <p className="mt-4 text-[15px] text-club-ink-soft">{b.text}</p>
                <p className="mt-5 border-t border-club-concrete/40 pt-4 text-[13px] text-club-muted">{b.how}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
