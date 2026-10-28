import { Reveal } from "./reveal";

const FOR = [
  "Tu construis quelque chose : une entreprise, un métier, un projet.",
  "Tu veux être entouré de personnes qui visent haut, sans les juger ni te comparer.",
  "Tu es prêt à donner autant que tu reçois.",
  "Tu as fait, ou tu vas faire, le Lockin Trip.",
];
const NOT_FOR = [
  "Tu cherches un carnet d'adresses à exploiter.",
  "Tu veux observer sans jamais participer.",
  "Tu n'as pas réservé de Lockin Trip : le club n'a pas d'entrée libre.",
  "Tu attends que les résultats arrivent sans rien changer.",
];
const ROWS: [string, string, string][] = [
  ["Les rencontres", "Au hasard des réseaux", "Des personnes qui ont fait le même voyage"],
  ["L'élan", "Il retombe après quelques semaines", "Un cadre qui le garde allumé"],
  ["Les questions", "Tu cherches seul la réponse", "Un membre qui connaît le sujet"],
  ["L'engagement", "Une résolution parmi d'autres", "Un cap, des routines, des défis"],
];

export function ClubFit() {
  return (
    <section className="club-section club-grain bg-club-sand">
      <div className="club-container">
        <Reveal>
          <p className="club-eyebrow text-club-bordeaux">Pour qui</p>
        </Reveal>
        <Reveal blur delay={0.1} as="h2">
          <span className="club-display club-h2 mt-6 block max-w-3xl text-balance">
            Un cercle, donc <em className="text-club-bordeaux">des critères</em>.
          </span>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[22px] border border-club-concrete/40 bg-club-ivory p-8 lg:p-10">
              <h3 className="club-display text-[1.5rem]">C&apos;est pour toi si</h3>
              <ul className="mt-6 space-y-4 text-[15px] text-club-ink-soft">
                {FOR.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-club-bordeaux" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-[22px] border border-club-concrete/40 p-8 lg:p-10">
              <h3 className="club-display text-[1.5rem]">Ce n&apos;est pas pour toi si</h3>
              <ul className="mt-6 space-y-4 text-[15px] text-club-ink-soft">
                {NOT_FOR.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-club-concrete-deep" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-[14px]">
            <caption className="sr-only">Seul ou avec le club</caption>
            <thead>
              <tr className="border-b border-club-ink/70 text-[11px] tracking-[0.22em] uppercase">
                <th scope="col" className="py-4 pr-4 font-medium" />
                <th scope="col" className="py-4 pr-4 font-medium text-club-concrete-deep">Seul</th>
                <th scope="col" className="py-4 font-medium text-club-bordeaux">Avec le club</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, alone, club]) => (
                <tr key={label} className="border-b border-club-concrete/40 align-top">
                  <th scope="row" className="club-display py-5 pr-4 text-[1.1rem] font-normal">{label}</th>
                  <td className="py-5 pr-6 text-club-muted">{alone}</td>
                  <td className="py-5 text-club-ink">{club}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
