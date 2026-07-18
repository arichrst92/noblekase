import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /*
   * Output standalone hanya untuk build Docker.
   *
   * Dockerfile menyalin `.next/standalone` lalu menjalankan `node server.js`,
   * jadi tanpa mode ini build image GAGAL di langkah COPY — direktorinya tidak
   * pernah dibuat. Sebelumnya baris ini dikomentari sehingga Dockerfile dan
   * konfigurasi Next saling bertentangan.
   *
   * Diaktifkan lewat env, bukan dinyalakan permanen, supaya `pnpm dev` dan
   * deploy native (PM2 + `next start`) tidak ikut berubah perilakunya.
   */
  ...(process.env.BUILD_STANDALONE === "true"
    ? { output: "standalone" as const }
    : {}),

  /*
   * Root penelusuran dependency untuk output standalone.
   *
   * pnpm menyimpan paket sebagai symlink ke .pnpm; tanpa root yang eksplisit
   * Next bisa gagal menelusuri binary native seperti sharp, dan image berhasil
   * ter-build tapi crash saat memproses gambar pertama.
   */
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
    // Sample images kita di /public/images/ sebagian besar SVG.
    // SVG dari source yang kita kontrol — aman untuk diserve via Next/Image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Production domain
      { protocol: "https", hostname: "**.noblekase.co.id" },
      { protocol: "https", hostname: "noblekase.co.id" },
      // IP-based deployment (initial deploy sebelum domain pointing)
      { protocol: "http", hostname: "72.60.74.202", port: "8080" },
      // Staging: noble.ide.asia (via nginx existing di 178.128.54.19)
      { protocol: "https", hostname: "noble.ide.asia" },
      // Localhost untuk development
      { protocol: "http", hostname: "localhost" },
    ],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    reactCompiler: false,
  },
  // Dua bahasa ditangani src/middleware.ts + segmen [locale] di App Router.
  // Bahasa default (ID) tanpa prefix, Inggris memakai /en.
  redirects: async () => [
    {
      // Footer ada link /kontak — redirect ke /dukungan (page yang sebenarnya)
      source: "/kontak",
      destination: "/dukungan",
      permanent: true,
    },
    {
      // Versi Inggris dari redirect di atas — tanpa ini /en/kontak jatuh ke 404.
      source: "/en/kontak",
      destination: "/en/dukungan",
      permanent: true,
    },
  ],
};

export default withPayload(nextConfig);
