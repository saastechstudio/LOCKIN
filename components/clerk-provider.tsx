"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Les widgets Clerk (connexion, menu compte) dans l'identité Focus : bleu focus partout, rayons doux. */
const LOCKIN_VARIABLES = {
  colorPrimary: "#3E5C8A",
  colorBackground: "#ffffff",
  colorForeground: "#3E5C8A",
  colorInput: "#ffffff",
  colorInputForeground: "#3E5C8A",
  colorNeutral: "#3E5C8A",
  colorMuted: "#F5F2EE",
  colorMutedForeground: "#6A6764",
  colorBorder: "#E7E3DF",
  borderRadius: "0.75rem",
  fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
};

export function BrandedClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      // Nos propres pages, même sans les variables NEXT_PUBLIC_CLERK_SIGN_*_URL
      // (absentes sur Railway) : sinon Clerk renvoie vers ses pages hébergées.
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{ variables: LOCKIN_VARIABLES }}
    >
      {children}
    </ClerkProvider>
  );
}
