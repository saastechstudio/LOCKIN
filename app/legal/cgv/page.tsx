import { LegalPage } from "@/components/marketing/legal-page";
import { CAMP_EDITION, CAMP_PRICE_PER_PERSON } from "@/lib/camp/data";

export default function CgvPage() {
  return (
    <LegalPage title="Conditions Générales de Vente — Lock-In Camp">
      <h2>1. Objet</h2>
      <p>
        Le Lockin Social Club et l&apos;ensemble de ses fonctionnalités sont
        gratuits ; leur utilisation relève des{" "}
        <a href="/legal/cgu" className="text-brand-blue hover:underline">
          CGU
        </a>
        . Les présentes Conditions Générales de Vente (CGV) s&apos;appliquent
        uniquement à la réservation des Lock-In Camp, seuls services payants
        proposés par Lock In. Toute réservation implique l&apos;acceptation
        pleine et entière des présentes CGV.
      </p>

      <h2>2. Accès à la réservation</h2>
      <p>
        La réservation d&apos;un Lock-In Camp est réservée aux membres du
        Lockin Social Club, c&apos;est-à-dire aux personnes disposant
        d&apos;un compte et ayant complété le rituel d&apos;inscription au
        club. L&apos;inscription au club est gratuite et peut être faite au
        moment de la réservation.
      </p>

      <h2>3. Prix</h2>
      <p>
        Le prix de l&apos;{CAMP_EDITION} est de{" "}
        {CAMP_PRICE_PER_PERSON.toLocaleString("fr-FR")}&nbsp;€ TTC par
        personne. Le détail des prestations incluses (vol, hébergement,
        programme, activités, excursion) figure sur la{" "}
        <a href="/camp" className="text-brand-blue hover:underline">
          page du Lock-In Camp
        </a>{" "}
        à la date de la réservation.
      </p>

      <h2>4. Réservation et paiement</h2>
      <p>
        Le membre effectue une pré-inscription en ligne pour la session de
        son choix, dans la limite des places disponibles. Les modalités de
        paiement lui sont ensuite communiquées par email. La place
        n&apos;est définitivement acquise qu&apos;à réception du paiement.
      </p>

      <h2>5. Annulation et remboursement</h2>
      <p>
        [Conditions d&apos;annulation et de remboursement à définir. Un séjour
        incluant transport et hébergement constitue un voyage à forfait au
        sens du Code du tourisme : ces conditions, ainsi que le droit de
        résolution du voyageur, doivent être validées juridiquement avant
        l&apos;ouverture des paiements.]
      </p>

      <h2>6. Responsabilité et aptitude</h2>
      <p>
        Le programme comprend des activités sportives quotidiennes. Chaque
        participant est responsable de s&apos;assurer de son aptitude
        physique à les pratiquer et est invité à souscrire une assurance
        voyage couvrant l&apos;annulation, l&apos;assistance et le
        rapatriement.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement des données liées à une réservation est décrit dans
        notre{" "}
        <a href="/legal/confidentialite" className="text-brand-blue hover:underline">
          Politique de confidentialité
        </a>
        .
      </p>

      <h2>8. Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige,
        une solution amiable sera recherchée en priorité ; à défaut, les
        tribunaux français compétents seront seuls saisis, sous réserve des
        dispositions d&apos;ordre public applicables aux consommateurs.
      </p>
    </LegalPage>
  );
}
