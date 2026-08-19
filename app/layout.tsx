import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import JsonLd from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo";

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
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Helitha Guruge", url: "https://github.com/iamhelitha" }],
  creator: "Helitha Guruge",
  publisher: "Helitha Guruge",
  category: "Wildlife conservation technology",
  keywords: [
    "elephant detection",
    "aerial wildlife survey",
    "drone image analysis",
    "wildlife conservation AI",
    "elephant monitoring",
    "YOLO elephant detector",
    "SAHI tiled inference",
    "Sri Lanka conservation",
    "computer vision",
  ],
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_LK",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "EleFind aerial elephant detection and conservation mapping platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  other: {
    "geo.region": "LK",
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      alternateName: "EleFind AI",
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      creator: { "@id": `${absoluteUrl("/")}#creator` },
    },
    {
      "@type": "WebApplication",
      "@id": `${absoluteUrl("/")}#application`,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      description: SITE_DESCRIPTION,
      applicationCategory: "ScienceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser with JavaScript enabled",
      isAccessibleForFree: true,
      image: absoluteUrl("/opengraph-image"),
      featureList: [
        "Aerial elephant detection",
        "Confidence-scored visual review",
        "Geotagged sighting maps",
        "Elephant crossing-zone records",
      ],
      author: { "@id": `${absoluteUrl("/")}#creator` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Person",
      "@id": `${absoluteUrl("/")}#creator`,
      name: "Helitha Guruge",
      url: "https://github.com/iamhelitha",
      sameAs: [
        "https://github.com/iamhelitha",
        "https://linkedin.com/in/iamhelitha",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${figtree.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <JsonLd data={siteJsonLd} />
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
