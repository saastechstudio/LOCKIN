"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { useMounted } from "@/lib/hooks/use-mounted";

const DARK_VARIABLES = {
  colorPrimary: "#924A62",
  colorBackground: "#0d0509",
  colorForeground: "#fff8f2",
  colorInput: "#140a0e",
  colorInputForeground: "#fff8f2",
  colorNeutral: "#fff8f2",
};

const LIGHT_VARIABLES = {
  colorPrimary: "#924A62",
  colorBackground: "#ffffff",
  colorForeground: "#1a0810",
  colorInput: "#f3e6dd",
  colorInputForeground: "#1a0810",
  colorNeutral: "#1a0810",
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
