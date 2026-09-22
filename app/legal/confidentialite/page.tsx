import { LegalPage } from "@/components/marketing/legal-page";

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données Lock In collecte, pourquoi,
        et comment les membres peuvent exercer leurs droits, conformément au
        Règlement Général sur la Protection des Données (RGPD).
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est [Nom de la société],
        éditeur du service Lock In. Pour toute question relative à vos
        données, contactez-nous à [adresse e-mail de contact].
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>
          <strong>Identité et profil :</strong> nom, adresse e-mail, photo de
          profil, secteur d&apos;activité, compétences, bio (fournis à
          l&apos;inscription ou modifiés dans les paramètres).
        </li>
        <li>
          <strong>Données de suivi :</strong> objectifs, bilans quotidiens,
          tâches de planning, réponses à l&apos;audit d&apos;entrée.
        </li>
        <li>
          <strong>Échanges avec le coach IA :</strong> historique des
          conversations, utilisé pour maintenir le contexte de vos échanges.
        </li>
        <li>
          <strong>Données de facturation :</strong> statut d&apos;abonnement
          et identifiant de membre, gérés par Whop (Lock In ne stocke aucune
          donnée bancaire).
        </li>
        <li>
          <strong>Données techniques :</strong> journaux de connexion et
          d&apos;usage, nécessaires à la sécurité et au bon fonctionnement
          du service.
        </li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>
        Ces données sont utilisées pour fournir et améliorer le service
        (suivi d&apos;objectifs, coach IA, mise en relation entre membres),
        gérer l&apos;abonnement et la facturation, assurer la sécurité du
        compte, et, lorsque vous y consentez, vous adresser des
        communications relatives au service.
      </p>

      <h2>4. Base légale</h2>
      <p>
        Le traitement repose sur l&apos;exécution du contrat d&apos;abonnement
        (accès au service), l&apos;intérêt légitime de Lock In (sécurité,
        amélioration du produit) et, le cas échéant, votre consentement
        (communications optionnelles).
      </p>

      <h2>5. Destinataires et sous-traitants</h2>
      <p>
        Vos données sont traitées par Lock In et par les prestataires
        strictement nécessaires au fonctionnement du service : Clerk
        (authentification), Whop (paiement), Neon (hébergement de la base
        de données), Railway (hébergement de l&apos;application), ainsi que
        le ou les fournisseurs d&apos;intelligence artificielle utilisés par
        le coach IA (Anthropic, OpenAI ou Google selon la configuration).
        Ces prestataires n&apos;utilisent vos données que pour le compte de
        Lock In et dans le cadre de leurs propres engagements de
        confidentialité.
      </p>
      <p>
        L&apos;annuaire des membres n&apos;affiche que les informations que
        vous choisissez de rendre visibles (nom, secteur, compétences, bio) ;
        votre adresse e-mail n&apos;est jamais partagée avec les autres
        membres.
      </p>

      <h2>6. Durée de conservation</h2>
      <p>
        Vos données sont conservées pendant toute la durée de votre compte,
        puis supprimées ou anonymisées dans un délai raisonnable après sa
        clôture, sauf obligation légale de conservation plus longue
        (notamment comptable).
      </p>

      <h2>7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d&apos;un droit :</p>
      <ul>
        <li>d&apos;accès à vos données ;</li>
        <li>de rectification des données inexactes ;</li>
        <li>d&apos;effacement de vos données (« droit à l&apos;oubli ») ;</li>
        <li>de portabilité de vos données ;</li>
        <li>d&apos;opposition et de limitation du traitement.</li>
      </ul>
      <p>
        Vous pouvez exercer ces droits directement depuis votre espace
        membre (Paramètres) ou en nous contactant à [adresse e-mail de
        contact]. Vous disposez également du droit d&apos;introduire une
        réclamation auprès de la CNIL (www.cnil.fr).
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Lock In met en œuvre des mesures techniques et organisationnelles
        raisonnables (chiffrement des données en transit, authentification
        sécurisée, hébergement chez des prestataires certifiés) pour
        protéger vos données contre l&apos;accès non autorisé, la perte ou
        l&apos;altération.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Le site utilise des cookies strictement nécessaires au
        fonctionnement du service (authentification, préférence de thème
        clair/sombre). Aucun cookie publicitaire ou de traçage tiers
        n&apos;est utilisé.
      </p>
    </LegalPage>
  );
}
