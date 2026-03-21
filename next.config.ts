import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allow images from Hugging Face Spaces (annotated result images)
   * and OpenStreetMap tile servers.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iamhelitha-elefind.hf.space",
      },
      {
        protocol: "https",
        hostname: "**.huggingface.co",
      },
      {
        protocol: "https",
        hostname: "**.tile.openstreetmap.org",
      },
    ],
  },

  /** Pin workspace root to project directory to avoid lockfile detection ambiguity. */
  turbopack: {
    root: __dirname,
  },

  /** Suppress Leaflet's window-access warnings during build. */
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
