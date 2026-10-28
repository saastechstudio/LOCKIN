import { ClubHero } from "@/components/club/hero";
import { ClubNav } from "@/components/club/nav";
import { Reveal } from "@/components/club/reveal";

export default function ClubPage() {
  return (
    <>
      <ClubNav />
      <main>
        <ClubHero />

        {/* Étape suivante : « Le constat ». Bloc temporaire pour juger l'alternance clair / sombre. */}
        <section id="club" className="club-section">
          <div className="club-container">
            <Reveal>
              <p className="club-eyebrow text-club-bordeaux">Chapitre II · Le constat</p>
            </Reveal>
            <Reveal blur delay={0.1}>
              <h2 className="club-display club-h2 mt-6 max-w-3xl text-balance">
                Le cercle commence par un choix : <em className="text-club-bordeaux">le tien</em>.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-club-muted">
                La suite de la page arrive à l&apos;étape suivante : constat, manifeste, bénéfices, lieux,
                carte de membre et adhésion.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
