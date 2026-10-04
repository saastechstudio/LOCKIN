import { LegalPage } from "@/components/marketing/legal-page";

export default function CharteModerationPage() {
  return (
    <LegalPage title="Charte de modération Lockin">
      <p>
        Le Lockin Social Club existe pour aider ses membres à progresser —
        pas pour les exposer à l&apos;agressivité ou à la toxicité qu&apos;on
        trouve ailleurs. Cette charte fixe les règles communes et la façon
        dont elles sont appliquées.
      </p>

      <h2>1. Nos principes</h2>
      <ul>
        <li>
          <strong>Respect :</strong> on s&apos;adresse aux autres membres
          comme on aimerait qu&apos;on s&apos;adresse à nous.
        </li>
        <li>
          <strong>Discipline :</strong> on vient ici pour progresser, pas
          pour polémiquer.
        </li>
        <li>
          <strong>Entraide :</strong> on répond pour aider, pas pour se
          mettre en valeur.
        </li>
        <li>
          <strong>Éthique :</strong> on ne manipule pas, on n&apos;arnaque
          pas, on ne ment pas sur qui on est.
        </li>
        <li>
          <strong>Focus :</strong> le feed, les groupes et l&apos;entraide
          restent centrés sur la discipline, le sport, le mindset et les
          objectifs.
        </li>
      </ul>

      <h2>2. Comportements interdits</h2>
      <p>
        Sont interdits, dans les posts, commentaires, messages privés et
        réponses d&apos;entraide :
      </p>
      <ul>
        <li>les insultes, la vulgarité et les moqueries ;</li>
        <li>l&apos;agressivité et les propos menaçants ;</li>
        <li>le harcèlement, répété ou non ;</li>
        <li>la discrimination, sous quelque forme que ce soit ;</li>
        <li>les menaces, explicites ou voilées ;</li>
        <li>la manipulation et l&apos;humiliation d&apos;un autre membre ;</li>
        <li>le spam et les arnaques (financières, promotionnelles ou autres).</li>
      </ul>

      <h2>3. Comment c&apos;est appliqué</h2>
      <p>
        <strong>Filtrage automatique.</strong> Chaque publication est
        vérifiée avant d&apos;être enregistrée. Un contenu détecté comme
        contraire à cette charte n&apos;est jamais publié : l&apos;auteur voit
        le message « Ce contenu ne correspond pas à l&apos;éthique Lockin.
        Merci de rester respectueux. » et reçoit un strike.
      </p>
      <p>
        <strong>Mode Respect Lockin.</strong> Avant l&apos;envoi d&apos;un
        post ou d&apos;un message qui semble agressif (ton, majuscules,
        ponctuation), une invitation à reformuler s&apos;affiche. Elle ne
        bloque pas l&apos;envoi — c&apos;est un rappel, pas une sanction.
      </p>
      <p>
        <strong>Signalement communautaire.</strong> Tout membre peut signaler
        un post, un commentaire, un message ou une réponse via le bouton «
        Signaler », en précisant un motif (insulte, harcèlement,
        discrimination, spam, autre). Chaque signalement est examiné par un
        modérateur humain, qui confirme (strike + suppression du contenu) ou
        rejette le signalement.
      </p>
      <p>
        <strong>Score de respect.</strong> Chaque compte dispose d&apos;un
        score interne, qui démarre à 100 et baisse à chaque contenu bloqué ou
        signalement confirmé. Ce score influence la visibilité du compte sur
        le Social Club.
      </p>

      <h2>4. Les strikes</h2>
      <ul>
        <li><strong>Strike 1 :</strong> avertissement.</li>
        <li><strong>Strike 2 :</strong> blocage de publication pendant 24 heures.</li>
        <li><strong>Strike 3 :</strong> suspension du compte pendant 7 jours.</li>
        <li><strong>Strike 4 :</strong> bannissement définitif du Lockin Social Club.</li>
      </ul>
      <p>
        Les strikes s&apos;accumulent sur la durée de vie du compte ; ils ne
        sont pas réinitialisés automatiquement.
      </p>

      <h2>5. Contester une sanction</h2>
      <p>
        Un membre qui estime qu&apos;un strike ou une sanction a été appliqué
        par erreur peut contacter Lock In à l&apos;adresse de contact
        modération indiquée dans les{" "}
        <a href="/legal/mentions" className="text-brand-blue hover:underline">
          Mentions légales
        </a>
        , en précisant le contenu concerné. La contestation est examinée par
        un modérateur distinct de celui ayant pris la décision initiale.
      </p>
    </LegalPage>
  );
}
