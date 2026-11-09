"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Les widgets Clerk (connexion, menu compte) dans le Life OS : vert nuit, texte blanc, émeraude d'action. */
const LOCKIN_VARIABLES = {
  colorPrimary: "#4f9a53",
  colorBackground: "#153617",
  colorForeground: "#FFFFFF",
  colorInput: "#0f2d12",
  colorInputForeground: "#FFFFFF",
  colorNeutral: "#FFFFFF",
  colorMuted: "#0f2d12",
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
