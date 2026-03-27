import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer info sent to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Allow geolocation for user location feature; block camera/mic
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  // Enable browser XSS filter (older browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Force HTTPS (only sent over HTTPS so safe to include)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

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

  /** Security headers applied to all routes. */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
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
