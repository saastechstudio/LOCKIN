"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Les widgets Clerk (connexion, menu compte) dans le Life OS : encre bleu nuit, texte crème, bleu focus. */
const LOCKIN_VARIABLES = {
  colorPrimary: "#4A6FA5",
  colorBackground: "#1B2A3E",
  colorForeground: "#FAF9F7",
  colorInput: "#16223A",
  colorInputForeground: "#FAF9F7",
  colorNeutral: "#FAF9F7",
  colorMuted: "#16223A",
  colorMutedForeground: "#B8B3AE",
  colorBorder: "rgba(250, 249, 247, 0.12)",
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
