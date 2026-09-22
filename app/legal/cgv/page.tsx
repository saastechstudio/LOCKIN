import { LegalPage } from "@/components/marketing/legal-page";

export default function CgvPage() {
  return (
    <LegalPage title="Conditions Générales de Vente">
      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente (CGV) régissent l&apos;accès
        et l&apos;utilisation de l&apos;abonnement au service Lock In, club
        privé d&apos;entrepreneurs proposant un accompagnement au suivi
        d&apos;objectifs, un coach IA, un audit personnalisé, un outil
        de planification et un annuaire de membres. Toute souscription à
        l&apos;abonnement implique l&apos;acceptation pleine et entière des
        présentes CGV.
      </p>

      <h2>2. Description de l&apos;offre</h2>
      <p>
        Lock In est un service accessible par abonnement, sur inscription,
        donnant accès à l&apos;ensemble des fonctionnalités de la
        plateforme : tableau de bord d&apos;objectifs, bilan quotidien,
        coach IA, audit d&apos;entrée, module de planification et
        annuaire des membres.
      </p>

      <h2>3. Tarifs</h2>
      <p>
        L&apos;abonnement est proposé selon deux formules, au choix du
        membre :
      </p>
      <ul>
        <li>
          <strong>Mensuel</strong> : 9,90&nbsp;€ TTC par mois, prélevé
          automatiquement chaque mois à la date anniversaire de
          l&apos;inscription.
        </li>
        <li>
          <strong>Annuel</strong> : 89,90&nbsp;€ TTC par an, prélevé en une
          seule fois à la souscription puis chaque année à la date
          anniversaire.
        </li>
      </ul>
      <p>
        Les paiements sont traités par notre prestataire Stripe. Lock In ne
        collecte ni ne stocke aucune donnée bancaire.
      </p>

      <h2>4. Essai gratuit</h2>
      <p>
        Un essai gratuit de 14 jours est proposé à la souscription. Une carte
        bancaire est requise pour activer l&apos;essai, mais aucun montant
        n&apos;est prélevé avant son terme. Le membre peut résilier à tout
        moment pendant cette période, sans frais et sans justification,
        depuis son espace membre.
      </p>

      <h2>5. Durée et résiliation</h2>
      <p>
        L&apos;abonnement est conclu pour la durée de la formule choisie
        (mensuelle ou annuelle) et se renouvelle automatiquement par
        tacite reconduction pour une durée identique, sauf résiliation par
        le membre avant la date de renouvellement. La résiliation
        s&apos;effectue à tout moment, en un clic, depuis
        Paramètres → Abonnement. Elle prend effet à la fin de la période
        en cours ; aucun remboursement au prorata n&apos;est effectué pour
        la période déjà entamée.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28 du Code de la consommation, le
        droit de rétractation ne s&apos;applique pas aux contenus numériques
        fournis sur un support immatériel dont l&apos;exécution a commencé
        après accord préalable exprès du consommateur, qui a renoncé à son
        droit de rétractation. En souscrivant à l&apos;essai gratuit ou à
        l&apos;abonnement, le membre reconnaît demander l&apos;accès
        immédiat au service et renoncer à ce droit pour la période
        déjà consommée ; il conserve à tout moment la possibilité de
        résilier son abonnement dans les conditions de l&apos;article 5
        ci-dessus.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Lock In met en œuvre tous les moyens raisonnables pour assurer la
        disponibilité et la fiabilité du service, sans garantie de
        résultat. Les contenus générés par le coach IA sont fournis à
        titre indicatif et ne constituent ni un conseil professionnel,
        juridique, financier ou médical, ni un engagement de résultat sur
        les performances entrepreneuriales du membre.
      </p>

      <h2>8. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du service (marque, logo, interface,
        contenus éditoriaux) est protégé par le droit de la propriété
        intellectuelle et demeure la propriété exclusive de Lock In. Toute
        reproduction ou représentation, totale ou partielle, sans
        autorisation est interdite.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Le traitement des données personnelles dans le cadre de
        l&apos;abonnement est décrit dans notre{" "}
        <a href="/legal/confidentialite" className="text-brand-blue hover:underline">
          Politique de confidentialité
        </a>
        .
      </p>

      <h2>10. Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige,
        une solution amiable sera recherchée en priorité ; à défaut, les
        tribunaux français compétents seront seuls saisis, sous réserve des
        dispositions d&apos;ordre public applicables aux consommateurs.
      </p>
    </LegalPage>
  );
}
