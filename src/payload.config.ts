/**
 * Payload CMS 3.0 Configuration
 * Noblekase — Website Catalog Phone Accessories
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { resendAdapter } from "@payloadcms/email-resend";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

// Collections
import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Categories } from "@/collections/Categories";
import { SubCategories } from "@/collections/SubCategories";
import { Products } from "@/collections/Products";
import { Marketplaces } from "@/collections/Marketplaces";
import { Articles } from "@/collections/Articles";
import { ArticleCategories } from "@/collections/ArticleCategories";
import { Pages } from "@/collections/Pages";
import { HeroEditions } from "@/collections/HeroEditions";
import { Slides } from "@/collections/Slides";
import { FeaturedCollections } from "@/collections/FeaturedCollections";
import { FAQItems } from "@/collections/FAQItems";
import { FAQCategories } from "@/collections/FAQCategories";

// Globals
import { SiteSettings } from "@/globals/SiteSettings";
import { Header } from "@/globals/Header";
import { Footer } from "@/globals/Footer";
import { Integrations } from "@/globals/Integrations";
// Globals — konten per halaman
import { PageHome } from "@/globals/pages/PageHome";
import { PageProducts } from "@/globals/pages/PageProducts";
import { PageJournal } from "@/globals/pages/PageJournal";
import { PageProductDetail } from "@/globals/pages/PageProductDetail";
import { PageArticleDetail } from "@/globals/pages/PageArticleDetail";
import { PageSupport } from "@/globals/pages/PageSupport";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Email adapter — Resend dipakai jika RESEND_API_KEY di-set,
// otherwise gunakan default Payload (no email - cukup untuk development).
const emailConfig = process.env.RESEND_API_KEY
  ? resendAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || "noreply@noblekase.com",
      defaultFromName: "Noblekase",
      apiKey: process.env.RESEND_API_KEY,
    })
  : undefined;

export default buildConfig({
  serverURL: process.env.SERVER_URL || "http://localhost:3000",
  admin: {
    user: Users.slug,
    // Kunci ke tema light agar konsisten dengan brand (putih + oranye + navy),
    // tidak mengikuti dark mode OS.
    theme: "light",
    meta: {
      title: "Noblekase CMS",
      titleSuffix: " · Noblekase",
      // Favicon panel admin (Payload mengelola <head>-nya sendiri, jadi
      // berkas ikon di src/app tidak otomatis terpakai di sini).
      icons: [
        { rel: "icon", type: "image/png", url: "/images/brand/favicon-noblekase.png" },
        { rel: "apple-touch-icon", url: "/images/brand/favicon-noblekase.png" },
      ],
    },
    components: {
      graphics: {
        Logo: "@/components/admin/Logo#Logo",
        Icon: "@/components/admin/Icon#Icon",
      },
    },
    livePreview: {
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },

  // Multi-language support (default ID, secondary EN)
  localization: {
    locales: [
      { label: "Bahasa Indonesia", code: "id" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "id",
    fallback: true,
  },

  collections: [
    Users,
    Media,
    Categories,
    SubCategories,
    Products,
    Marketplaces,
    Articles,
    ArticleCategories,
    Pages,
    HeroEditions,
    Slides,
    FeaturedCollections,
    FAQCategories,
    FAQItems,
  ],

  globals: [
    SiteSettings,
    Integrations,
    Header,
    Footer,
    PageHome,
    PageProducts,
    PageJournal,
    PageProductDetail,
    PageArticleDetail,
    PageSupport,
  ],

  editor: lexicalEditor({}),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),

  ...(emailConfig ? { email: emailConfig } : {}),

  secret: process.env.PAYLOAD_SECRET || "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  sharp,

  // CORS untuk development & production
  cors: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"].filter(Boolean),

  // Rate limiting: di Payload 3 tidak lagi di config—handle via Caddy
  // atau Next.js middleware (lihat src/middleware.ts jika ada).
});
