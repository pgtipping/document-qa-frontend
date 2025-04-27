import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
// SessionProvider import removed as it's handled in Providers.tsx
import "./globals.css";
import "./compiled.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InQDoc - AI-Powered Document Analysis",
  description:
    "Upload documents and get instant, intelligent answers to your questions using advanced AI technology. Supports PDF, TXT, and more file formats.",
  keywords:
    "document analysis, AI document search, document Q&A, PDF analysis, text analysis, AI assistant, document intelligence",
  authors: [{ name: "InQDoc Team" }],
  creator: "InQDoc",
  publisher: "InQDoc",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://doc-chat-qa.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "InQDoc - AI-Powered Document Analysis",
    description:
      "Upload documents and get instant, intelligent answers to your questions using advanced AI technology.",
    url: "https://doc-chat-qa.vercel.app",
    siteName: "InQDoc",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InQDoc - AI-Powered Document Analysis",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InQDoc - AI-Powered Document Analysis",
    description:
      "Upload documents and get instant, intelligent answers to your questions using advanced AI technology.",
    images: ["/twitter-image.jpg"],
    creator: "@inqdoc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.className} ${inter.variable} min-h-screen bg-background text-foreground [&.dark]:bg-background [&.dark]:text-foreground [&.light]:bg-background [&.light]:text-foreground`}
        data-theme="light"
      >
        {/* SessionProvider wrapper removed as it's handled in Providers.tsx */}
        <Providers>
          <Navigation />
          <main
            className="min-h-screen bg-background text-foreground [&.dark]:bg-background [&.dark]:text-foreground [&.light]:bg-background [&.light]:text-foreground"
            data-theme="light"
          >
            {children}
          </main>
          <Toaster />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </Providers>
        {/* SessionProvider wrapper removed */}
      </body>
    </html>
  );
}
