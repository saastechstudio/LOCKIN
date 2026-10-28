import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "I",
    title: "Tu réserves ton Lockin Trip",
    text: "Un compte suffit pour pré-inscrire ta place. Tu n'as pas besoin d'être déjà membre du club.",
  },
  {
    n: "II",
    title: "Tu reçois ton numéro de membre",
    text: "À la confirmation de ta place, tu reçois par email un numéro de membre personnel. Il est à toi seul.",
  },
  {
    n: "III",
    title: "Tu entres dans le club",
    text: "Le club s'ouvre au début de ton séjour. Tu saisis ton numéro, tu écris ta motivation, et tu es dans le cercle. Ta première année est offerte.",
  },
];

export function ClubJourney() {
  return (
    <section id="parcours" className="club-section">
      <div className="club-container">
        <Reveal>
          <p className="club-eyebrow text-club-bordeaux">Le parcours</p>
        </Reveal>
        <Reveal blur delay={0.1} as="h2">
          <span className="club-display club-h2 mt-6 block max-w-3xl text-balance">
            Une seule porte : <em className="text-club-bordeaux">le Lockin Trip</em>.
          </span>
        </Reveal>

        <ol className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-12">
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <Reveal delay={i * 0.12}>
                <div className="border-t border-club-ink/80 pt-6">
                  <span className="club-display text-[2.4rem] text-club-bordeaux">{s.n}</span>
                  <h3 className="club-display mt-4 text-[1.5rem] leading-tight">{s.title}</h3>
                  <p className="mt-4 text-[15px] text-club-ink-soft">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
