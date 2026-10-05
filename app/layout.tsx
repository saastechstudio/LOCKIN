import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BrandedClerkProvider } from "@/components/clerk-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** Titres Lockin : géométrique, structuré. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Lockin Social Club",
  description:
    "La vie est un combat. Le vrai, c'est contre toi. Lockin Social Club : discipline, objectifs, routines, progression. Un club mondial, gratuit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Identité Lockin : un seul thème, fond blanc pur. */}
        <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
          <BrandedClerkProvider>{children}</BrandedClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
