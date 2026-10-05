"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Les widgets Clerk (connexion, menu compte) dans l'identité Lockin : noir sur blanc, angles droits. */
const LOCKIN_VARIABLES = {
  colorPrimary: "#000000",
  colorBackground: "#ffffff",
  colorForeground: "#000000",
  colorInput: "#ffffff",
  colorInputForeground: "#000000",
  colorNeutral: "#111111",
  borderRadius: "0",
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
