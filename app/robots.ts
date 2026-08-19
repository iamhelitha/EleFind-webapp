import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/login",
        "/signup",
        "/forgot-password",
        "/supabase",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
