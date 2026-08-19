import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{
    path: string;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
    priority: number;
    lastModified: string;
  }> = [
    {
      path: "/",
      changeFrequency: "monthly",
      priority: 1,
      lastModified: "2026-08-19",
    },
    {
      path: "/detect",
      changeFrequency: "monthly",
      priority: 0.9,
      lastModified: "2026-08-19",
    },
    {
      path: "/models/yolo26",
      changeFrequency: "monthly",
      priority: 0.9,
      lastModified: "2026-08-16",
    },
    {
      path: "/models/yolo11",
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: "2026-08-16",
    },
    {
      path: "/map",
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: "2026-08-19",
    },
    {
      path: "/alerts",
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: "2026-08-19",
    },
  ];

  return pages.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: absoluteUrl(path),
    lastModified: new Date(lastModified),
    changeFrequency,
    priority,
  }));
}
