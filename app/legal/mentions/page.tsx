import { LegalPage } from "@/components/marketing/legal-page";

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        Le site et le service Lock In sont édités par :
      </p>
      <ul>
        <li>
          <strong>Raison sociale :</strong> [Nom de la société]
        </li>
        <li>
          <strong>Forme juridique :</strong> [Forme juridique, par exemple SAS ou SARL]
        </li>
        <li>
          <strong>Capital social :</strong> [Montant]
        </li>
        <li>
          <strong>Siège social :</strong> [Adresse complète]
        </li>
        <li>
          <strong>RCS :</strong> [Ville d&apos;immatriculation et numéro SIRET]
        </li>
        <li>
          <strong>Directeur de la publication :</strong> [Nom]
        </li>
        <li>
          <strong>Contact :</strong> [Adresse e-mail de contact]
        </li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        L&apos;application est hébergée par Railway Corporation (251 Little
        Falls Drive, Wilmington, Delaware 19808, États-Unis) et sa base de
        données par Neon Inc., hébergeur de bases de données PostgreSQL
        serverless.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments composant le site Lock In (textes,
        logo, marque, structure, base de données, illustrations) est
        protégé par les dispositions du Code de la propriété
        intellectuelle. Toute reproduction, représentation ou exploitation,
        totale ou partielle, sans autorisation préalable est interdite et
        constitutive de contrefaçon.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles des utilisateurs est décrit
        dans notre{" "}
        <a href="/legal/confidentialite" className="text-brand-blue hover:underline">
          Politique de confidentialité
        </a>
        .
      </p>

      <h2>Crédits</h2>
      <p>
        Authentification assurée par Clerk. Paiements traités par Whop.
        Assistant IA propulsé par les API d&apos;Anthropic, OpenAI et
        Google, selon la configuration active.
      </p>
    </LegalPage>
  );
}
