import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output dipakai saat deploy via Docker; native (PM2 + next start) tidak butuh ini.
  // output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    // Sample images kita di /public/images/ sebagian besar SVG.
    // SVG dari source yang kita kontrol — aman untuk diserve via Next/Image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Production domain
      { protocol: "https", hostname: "**.noblekase.com" },
      { protocol: "https", hostname: "noblekase.com" },
      // IP-based deployment (initial deploy sebelum domain pointing)
      { protocol: "http", hostname: "72.60.74.202", port: "8080" },
      // Localhost untuk development
      { protocol: "http", hostname: "localhost" },
    ],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    reactCompiler: false,
  },
  // Multi-language: i18n handled via next-intl middleware (App Router compatible)
  redirects: async () => [
    {
      source: "/admin",
      destination: "/admin/login",
      permanent: false,
    },
    {
      // Footer ada link /kontak — redirect ke /dukungan (page yang sebenarnya)
      source: "/kontak",
      destination: "/dukungan",
      permanent: true,
    },
  ],
};

export default withPayload(nextConfig);
