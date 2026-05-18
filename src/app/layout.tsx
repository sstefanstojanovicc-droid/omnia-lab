import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "OMNIA — Immersive Spatial Design",
  description:
    "OMNIA is a multidisciplinary practice by architect and interior designer Dina Rosic — immersive, experiential, spatial design. Est. 2026.",
  openGraph: {
    title: "OMNIA",
    description: "All things. Immersive / Experiential / Spatial.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${plexMono.variable} scroll-smooth`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
