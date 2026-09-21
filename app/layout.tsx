import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lock In — Le Club d'Entrepreneurs d'Excellence",
  description:
    "L'excellence n'est pas une destination, c'est une quête. Rejoignez le club d'entrepreneurs qui trackent leurs OKRs, s'entraident et progressent chaque jour avec un coach IA d'excellence.",
  icons: {
    icon: "/logo-mark.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#D4AF37",
          colorBackground: "#0f0f12",
          colorForeground: "#f5f4f1",
          colorInput: "#17171b",
          colorInputForeground: "#f5f4f1",
        },
      }}
    >
      <html
        lang="fr"
        className={`dark ${inter.variable} ${cormorant.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground bg-noise">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
