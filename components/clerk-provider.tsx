"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { useMounted } from "@/lib/hooks/use-mounted";

const DARK_VARIABLES = {
  colorPrimary: "#D4AF37",
  colorBackground: "#12141D",
  colorForeground: "#f1f5f9",
  colorInput: "#17171b",
  colorInputForeground: "#f1f5f9",
  colorNeutral: "#f1f5f9",
};

const LIGHT_VARIABLES = {
  colorPrimary: "#D4AF37",
  colorBackground: "#ffffff",
  colorForeground: "#0f172a",
  colorInput: "#eef0f5",
  colorInputForeground: "#0f172a",
  colorNeutral: "#0f172a",
};

/** Keeps Clerk's own widgets (sign-in, sign-up, user menu) in sync with our
 * brand palette across light/dark, since Clerk needs literal colors rather
 * than CSS custom properties. */
export function BrandedClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Defaults to dark (this app's default theme) until the client has
  // resolved the actual preference, avoiding a light/dark flash.
  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <ClerkProvider
      appearance={{
        variables: isDark ? DARK_VARIABLES : LIGHT_VARIABLES,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
