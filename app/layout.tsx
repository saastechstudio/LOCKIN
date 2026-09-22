import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BrandedClerkProvider } from "@/components/clerk-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lock In, Le Club d'Entrepreneurs d'Excellence",
  description:
    "L'excellence n'est pas une destination, c'est une quête. Rejoignez le club d'entrepreneurs qui suivent leurs objectifs, s'entraident et progressent chaque jour avec un coach IA d'excellence.",
  icons: {
    icon: "/logo-mark.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground bg-noise">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <BrandedClerkProvider>{children}</BrandedClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
