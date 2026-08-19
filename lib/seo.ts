import type { Metadata } from "next";

const LOCAL_URL = "http://localhost:3000";

function normaliseUrl(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const isProductionLocalhost =
    process.env.NODE_ENV === "production" &&
    configuredUrl != null &&
    /localhost|127\.0\.0\.1/.test(configuredUrl);

  if (configuredUrl && !isProductionLocalhost) {
    return new URL(normaliseUrl(configuredUrl));
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (vercelUrl) {
    return new URL(normaliseUrl(vercelUrl));
  }

  return new URL(LOCAL_URL);
}

export const SITE_NAME = "EleFind";
export const SITE_TITLE = "EleFind — AI Elephant Detection for Aerial Surveys";
export const SITE_DESCRIPTION =
  "Detect elephants in high-resolution aerial and drone imagery, review confidence-scored results, and map verified sightings for conservation workflows.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  index?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  image = "/opengraph-image",
  imageAlt = "EleFind aerial elephant detection platform",
  index = true,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
        },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_NAME,
      locale: "en_LK",
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
