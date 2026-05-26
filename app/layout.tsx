import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthModalProvider } from "@/components/AuthModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.craftfolio.co"),
  title: {
    default: "Craftfolio — AI Resume Builder & ATS Optimizer",
    template: "%s | Craftfolio",
  },
  description: "Get your ATS score, fix keyword gaps, generate a tailored cover letter, and get a fully rewritten resume — in seconds. Free to start.",
  keywords: "AI resume builder, ATS resume checker, resume optimizer, ATS score, keyword gap analysis, cover letter generator, resume rewrite, career pivot tool",
  authors: [{ name: "Craftfolio" }],
  alternates: { canonical: "https://www.craftfolio.co" },
  openGraph: {
    type: "website",
    siteName: "Craftfolio",
    title: "Craftfolio — AI Resume Builder & ATS Optimizer",
    description: "Get your ATS score, fix keyword gaps, generate a tailored cover letter, and get a fully rewritten resume — in seconds. Free to start.",
    url: "https://www.craftfolio.co",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craftfolio — AI Resume Builder & ATS Optimizer",
    description: "Get your ATS score, fix keyword gaps, generate a cover letter, and get a fully rewritten resume — free to start.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}
