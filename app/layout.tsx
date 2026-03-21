import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/providers/SessionProvider";

/**
 * Root layout — provides the Syne + DM Sans font variables,
 * navigation bar, footer, and toast notifications to every page.
 */

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "EleFind — AI-Powered Elephant Detection",
  description:
    "Detect elephants in aerial and drone imagery using YOLOv11 + SAHI, and visualise their locations on an interactive map for conservation.",
  keywords: ["elephant detection", "conservation", "AI", "YOLO", "SAHI", "Sri Lanka", "wildlife"],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "EleFind — AI-Powered Elephant Detection",
    description:
      "Detect elephants in aerial and drone imagery using YOLOv11 + SAHI, and visualise their locations on an interactive map for conservation.",
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
      "Detect elephants in aerial and drone imagery using YOLOv11 + SAHI, and visualise their locations on an interactive map for conservation.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1a3d2b",
              color: "#d8f3dc",
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
