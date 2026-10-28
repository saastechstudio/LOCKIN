import { Reveal } from "./reveal";

/** Le constat : ce qui retient les gens ambitieux. */
export function ClubProblem() {
  return (
    <section id="club" className="club-section">
      <div className="club-container grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div>
          <Reveal>
            <p className="club-eyebrow text-club-bordeaux">Le constat</p>
          </Reveal>
          <Reveal blur delay={0.1} as="h2">
            <span className="club-display club-h2 mt-6 block text-balance">
              On n&apos;avance pas <em className="text-club-bordeaux">seul</em>.
            </span>
          </Reveal>
        </div>

        <div className="space-y-6 text-[17px] text-club-ink-soft">
          <Reveal delay={0.1}>
            <p>
              Quand tu veux plus, tu le sens vite : autour de toi, peu de gens veulent la même chose. Les
              conversations tournent en rond, les ambitions se tiennent à voix basse, et l&apos;élan
              retombe.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              Ce qui change une trajectoire, ce n&apos;est pas une méthode de plus. C&apos;est la pièce dans
              laquelle tu te trouves, et les personnes qui y sont avec toi.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="club-display text-[1.6rem] text-club-bordeaux">
              Le Lockin Social Club garde cette pièce ouverte.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
