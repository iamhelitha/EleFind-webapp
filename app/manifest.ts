import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EleFind — AI Elephant Detection",
    short_name: "EleFind",
    description:
      "Aerial elephant detection, verification, mapping, and conservation decision support.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0e9d9",
    theme_color: "#191d16",
    categories: ["education", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
