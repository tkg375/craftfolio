import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthModalProvider } from "@/components/AuthModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Craftfolio — AI Resume Tools",
  description: "Score, rewrite, and tailor your resume with AI. Get matched to jobs, generate cover letters, and explore career options.",
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
