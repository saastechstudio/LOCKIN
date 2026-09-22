"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { useMounted } from "@/lib/hooks/use-mounted";

const DARK_VARIABLES = {
  colorPrimary: "#A480EC",
  colorBackground: "#161616",
  colorForeground: "#f8f8f6",
  colorInput: "#1a1a1a",
  colorInputForeground: "#f8f8f6",
  colorNeutral: "#f8f8f6",
};

const LIGHT_VARIABLES = {
  colorPrimary: "#7B3FE4",
  colorBackground: "#ffffff",
  colorForeground: "#111827",
  colorInput: "#f0f0ec",
  colorInputForeground: "#111827",
  colorNeutral: "#111827",
};

/** Keeps Clerk's own widgets (sign-in, sign-up, user menu) in sync with our
 * brand palette across light/dark, since Clerk needs literal colors rather
 * than CSS custom properties. */
export function BrandedClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Defaults to light (this app's default theme) until the client has
  // resolved the actual preference, avoiding a light/dark flash.
  const isDark = mounted && resolvedTheme === "dark";

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
