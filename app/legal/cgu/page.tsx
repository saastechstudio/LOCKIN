import { LegalPage } from "@/components/marketing/legal-page";

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation — Lockin Social Club">
      <p>
        Les présentes CGU encadrent l&apos;utilisation du Lockin Social Club,
        le réseau social gratuit intégré à Lock In. Elles s&apos;appliquent en
        complément des{" "}
        <a href="/legal/cgv" className="text-brand-blue hover:underline">
          CGV
        </a>{" "}
        pour les membres qui souscrivent également à l&apos;abonnement
        coaching ; en cas de contradiction sur le volet social, les présentes
        CGU prévalent.
      </p>

      <h2>1. Objet du service</h2>
      <p>
        Le Lockin Social Club est un réseau social gratuit orienté discipline,
        sport, mindset et entraide entre membres. Il propose un feed de
        publications, des profils, des groupes, une messagerie privée, un
        module d&apos;objectifs personnels et professionnels, et un espace
        d&apos;entraide par questions/réponses. Il est accessible à toute
        personne disposant d&apos;un compte Lock In.
      </p>

      <h2>2. Inscription et rituel Lockin</h2>
      <p>
        L&apos;accès au Lockin Social Club est conditionné à la création
        d&apos;un compte et à la réalisation du rituel d&apos;inscription : une
        motivation (« Pourquoi veux-tu devenir Lockin ? », publiée comme votre
        premier post), un objectif à 30 jours, un sport principal et une
        routine quotidienne. Ces informations nourrissent votre profil et
        sont, pour la motivation, visibles publiquement dans le feed.
      </p>
      <p>
        Le service est réservé aux personnes âgées de 16 ans ou plus. Lock In
        ne procède pas à une vérification d&apos;identité poussée ; en vous
        inscrivant, vous déclarez remplir cette condition d&apos;âge. Tout
        compte dont l&apos;âge déclaré est manifestement inexact pourra être
        suspendu.
      </p>

      <h2>3. Obligations des utilisateurs</h2>
      <p>Chaque membre s&apos;engage à :</p>
      <ul>
        <li>fournir des informations exactes sur son profil ;</li>
        <li>
          respecter les autres membres, dans les posts, commentaires,
          messages privés et réponses d&apos;entraide ;
        </li>
        <li>ne pas usurper l&apos;identité d&apos;un tiers ;</li>
        <li>
          ne pas utiliser le service à des fins commerciales non autorisées
          (spam, démarchage non sollicité, promotion déguisée) ;
        </li>
        <li>
          se conformer à la{" "}
          <a href="/legal/charte-moderation" className="text-brand-blue hover:underline">
            Charte de modération Lockin
          </a>
          .
        </li>
      </ul>

      <h2>4. Contenus autorisés et interdits</h2>
      <p>
        Sont autorisés les contenus en lien avec la discipline personnelle,
        le sport, les objectifs, le mindset et l&apos;entraide entre membres.
      </p>
      <p>Sont strictement interdits les contenus relevant de :</p>
      <ul>
        <li>l&apos;insulte, la vulgarité ou la moquerie envers un membre ;</li>
        <li>le harcèlement, la menace ou l&apos;intimidation ;</li>
        <li>la discrimination, la haine ou l&apos;incitation à la violence ;</li>
        <li>la manipulation, l&apos;arnaque ou le spam ;</li>
        <li>
          tout contenu illicite au regard du droit français (contrefaçon,
          diffamation, atteinte à la vie privée, etc.).
        </li>
      </ul>
      <p>
        Les posts, commentaires, messages et réponses sont filtrés
        automatiquement au moment de la publication (cf. Charte de
        modération) ; un contenu bloqué par ce filtre n&apos;est jamais
        publié et déclenche un strike sur le compte.
      </p>

      <h2>5. Modération et sanctions</h2>
      <p>
        Tout manquement aux présentes CGU ou à la Charte de modération
        expose le compte au système de sanctions progressives (strikes 1 à
        4 : avertissement, blocage 24h, suspension 7 jours, bannissement),
        détaillé dans la{" "}
        <a href="/legal/charte-moderation" className="text-brand-blue hover:underline">
          Charte de modération
        </a>
        . Tout membre peut signaler un contenu ou un comportement via le
        bouton « Signaler » prévu à cet effet ; les signalements sont traités
        par un modérateur humain.
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        Chaque membre reste propriétaire des contenus qu&apos;il publie
        (posts, commentaires, réponses). En les publiant, il accorde à Lock
        In une licence non exclusive d&apos;hébergement et d&apos;affichage de
        ces contenus aux autres membres, dans la limite nécessaire au
        fonctionnement du service. La marque, le logo et l&apos;identité
        visuelle Lockin restent la propriété exclusive de Lock In.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Le Lockin Social Club est un espace d&apos;échange entre membres ;
        Lock In n&apos;est pas éditeur des contenus publiés par ses membres
        et n&apos;exerce qu&apos;un contrôle a posteriori (filtrage automatique
        et modération humaine sur signalement). Lock In décline toute
        responsabilité quant à l&apos;exactitude des informations partagées
        par les membres (objectifs, conseils d&apos;entraide, etc.), qui ne
        constituent en aucun cas un avis médical, juridique ou financier.
      </p>

      <h2>8. Résiliation</h2>
      <p>
        Chaque membre peut demander la suppression de son compte à tout
        moment depuis les Paramètres ou en contactant Lock In ; ses contenus
        publics sont alors supprimés ou anonymisés selon notre{" "}
        <a href="/legal/confidentialite" className="text-brand-blue hover:underline">
          Politique de confidentialité
        </a>
        . Lock In peut résilier l&apos;accès d&apos;un membre en cas de
        bannissement (strike 4) ou de manquement grave aux présentes CGU.
      </p>

      <h2>9. Modification des CGU</h2>
      <p>
        Lock In peut modifier les présentes CGU pour les faire évoluer avec
        le service ou la réglementation. Les membres en seront informés par
        une notification dans l&apos;application ; la poursuite de
        l&apos;utilisation du service après modification vaut acceptation des
        nouvelles CGU.
      </p>
    </LegalPage>
  );
}
