import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/providers/SessionProvider";

/**
 * Root layout — provides the Caprasimo + Figtree font variables,
 * navigation bar, footer, and toast notifications to every page.
 *
 * Caprasimo carries display headings only (never data — it has no
 * tabular figures); Figtree carries all interface and body text.
 */

const caprasimo = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caprasimo",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "EleFind — AI-Powered Elephant Detection",
  description:
    "Detect elephants in aerial and drone imagery using EleFind YOLO11 and YOLO26s, then visualise their locations on an interactive conservation map.",
  keywords: ["elephant detection", "conservation", "AI", "YOLO", "SAHI", "Sri Lanka", "wildlife"],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "EleFind — AI-Powered Elephant Detection",
    description:
      "Detect elephants in aerial and drone imagery using EleFind YOLO11 and YOLO26s, then visualise their locations on an interactive conservation map.",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        alt: "EleFind logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EleFind — AI-Powered Elephant Detection",
    description:
      "Detect elephants in aerial and drone imagery using EleFind YOLO11 and YOLO26s, then visualise their locations on an interactive conservation map.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${figtree.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "999px",
              background: "#191d16",
              color: "#f0e9d9",
              fontSize: "14px",
            },
          }}
        />
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
