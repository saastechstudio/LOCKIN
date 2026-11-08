"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Les widgets Clerk (connexion, menu compte) dans le Life OS : vert nuit, texte blanc, émeraude d'action. */
const LOCKIN_VARIABLES = {
  colorPrimary: "#10b981",
  colorBackground: "#064e3b",
  colorForeground: "#FFFFFF",
  colorInput: "#053d30",
  colorInputForeground: "#FFFFFF",
  colorNeutral: "#FFFFFF",
  colorMuted: "#053d30",
  colorMutedForeground: "#CFE3DA",
  colorBorder: "rgba(255, 255, 255, 0.12)",
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
