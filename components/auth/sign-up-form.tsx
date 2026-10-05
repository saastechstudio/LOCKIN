"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";

import { frenchCountryNames } from "@/lib/countries";
import { safeRedirectFromUrl } from "@/lib/safe-path";

type ClerkLikeError = { code?: string; message?: string; longMessage?: string } | null | undefined;

const ERROR_MESSAGES: Record<string, string> = {
  form_identifier_exists: "Un compte existe déjà avec cet email. Connecte-toi plutôt.",
  form_password_pwned:
    "Ce mot de passe est apparu dans une fuite de données connue. Choisis-en un autre.",
  form_password_length_too_short: "Mot de passe trop court : 8 caractères minimum.",
  form_password_validation_failed: "Ce mot de passe ne respecte pas les règles de sécurité.",
  form_param_format_invalid: "Un des champs n'est pas au bon format.",
  form_code_incorrect: "Code incorrect.",
  verification_expired: "Ce code a expiré. Demande-en un nouveau.",
  strategy_for_user_invalid: "L'inscription par mot de passe n'est pas activée pour le moment.",
};

function frenchError(error: ClerkLikeError): string {
  if (!error) return "";
  return (
    (error.code && ERROR_MESSAGES[error.code]) ||
    error.longMessage ||
    error.message ||
    "Une erreur est survenue. Réessaie."
  );
}

const inputClass =
  "w-full border border-camp-hairline bg-camp-white px-4 py-3 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/35 focus:border-camp-charcoal";
const labelClass = "text-[11px] font-semibold tracking-[0.2em] text-camp-charcoal/50 uppercase";

/**
 * Inscription Lockin : prénom, nom, pays de résidence, email, mot de passe.
 * Prénom/nom/pays partent dans unsafeMetadata (accepté quelle que soit la
 * configuration de l'instance Clerk) et sont repris dans notre base à la
 * création du membre (getOrCreateDbUser). Le mot de passe exige que la
 * stratégie "Password" soit activée côté Clerk.
 */
export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const { signUp, fetchStatus } = useSignUp();

  // Entrer dans le club = faire le rituel ; sauf si l'on venait d'ailleurs (réservation de camp…).
  const destination = useMemo(
    () => safeRedirectFromUrl(searchParams.get("redirect_url")) ?? "/rejoindre",
    [searchParams],
  );
  const countries = useMemo(() => frenchCountryNames(), []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const busy = fetchStatus === "fetching";

  useEffect(() => {
    if (isSignedIn) router.replace(destination);
  }, [isSignedIn, destination, router]);

  async function finish() {
    await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl(destination);
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(ERROR_MESSAGES.form_password_length_too_short);
      return;
    }

    const { error: signUpError } = await signUp.password({
      emailAddress: email.trim(),
      password,
      unsafeMetadata: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country,
      },
    });
    if (signUpError) {
      setError(frenchError(signUpError));
      return;
    }

    if (signUp.status === "complete") {
      await finish();
      return;
    }
    if (signUp.unverifiedFields.includes("email_address")) {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(frenchError(sendError));
        return;
      }
      setStep("verify");
      return;
    }
    // L'instance exige autre chose (téléphone, identifiant…) que ce formulaire ne collecte pas.
    setError(
      `Inscription incomplète : champ requis manquant (${signUp.missingFields.join(", ")}).`,
    );
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (verifyError) {
      setError(frenchError(verifyError));
      return;
    }
    if (signUp.status === "complete") {
      await finish();
    } else {
      setError("Ton email est vérifié, mais l'inscription n'est pas complète. Réessaie.");
    }
  }

  async function resendCode() {
    setError("");
    setNotice("");
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) setError(frenchError(sendError));
    else setNotice("Nouveau code envoyé.");
  }

  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(destination)}`;

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-camp-charcoal">
            Vérifie ton email.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-camp-charcoal/60">
            Un code à 6 chiffres vient d&apos;être envoyé à{" "}
            <span className="font-medium text-camp-charcoal">{email}</span>.
          </p>
        </div>

        <label className="block space-y-2">
          <span className={labelClass}>Code de vérification</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            className={`${inputClass} tracking-[0.4em]`}
          />
        </label>

        {error ? <p className="border-l-2 border-camp-charcoal pl-3 text-sm text-camp-charcoal">{error}</p> : null}
        {notice ? <p className="text-sm text-camp-charcoal/60">{notice}</p> : null}

        <button
          type="submit"
          disabled={busy || code.trim().length < 6}
          className="w-full bg-camp-charcoal px-6 py-4 text-sm font-medium text-camp-white transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {busy ? "Vérification…" : "Valider et entrer dans le club"}
        </button>
        <button
          type="button"
          onClick={resendCode}
          disabled={busy}
          className="text-sm text-camp-charcoal/60 underline decoration-camp-hairline underline-offset-4 hover:text-camp-charcoal"
        >
          Renvoyer le code
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-camp-charcoal">
          Crée ton compte.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-camp-charcoal/60">
          Gratuit. Ensuite, ton rituel d&apos;entrée dans le club.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={labelClass}>Prénom</span>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            maxLength={60}
            required
            className={inputClass}
          />
        </label>
        <label className="block space-y-2">
          <span className={labelClass}>Nom</span>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            maxLength={60}
            required
            className={inputClass}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className={labelClass}>Pays de résidence</span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          className={`${inputClass} appearance-none`}
        >
          <option value="" disabled>
            Choisis ton pays
          </option>
          {countries.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>

      <label className="block space-y-2">
        <span className={labelClass}>Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
        <span className="block text-xs text-camp-charcoal/45">8 caractères minimum.</span>
      </label>

      {error ? <p className="border-l-2 border-camp-charcoal pl-3 text-sm text-camp-charcoal">{error}</p> : null}

      {/* Requis par la protection anti-bot de Clerk dans un formulaire personnalisé. */}
      <div id="clerk-captcha" />

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-camp-charcoal px-6 py-4 text-sm font-medium text-camp-white transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {busy ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="text-xs leading-relaxed text-camp-charcoal/50">
        En créant ton compte, tu acceptes les{" "}
        <Link href="/legal/cgu" className="underline underline-offset-2">
          CGU
        </Link>
        , la{" "}
        <Link href="/legal/confidentialite" className="underline underline-offset-2">
          politique de confidentialité
        </Link>{" "}
        et la{" "}
        <Link href="/legal/charte-moderation" className="underline underline-offset-2">
          charte Lockin
        </Link>
        .
      </p>

      <p className="border-t border-camp-hairline pt-6 text-sm text-camp-charcoal/60">
        Déjà membre ?{" "}
        <Link href={signInHref} className="font-medium text-camp-charcoal underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
