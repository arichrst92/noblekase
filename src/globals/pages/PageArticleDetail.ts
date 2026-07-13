/**
 * PageArticleDetail — label & eyebrow di halaman detail artikel Journal.
 * Template pakai {category} untuk nama kategori artikel.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const PageArticleDetail: GlobalConfig = {
  slug: "page-article-detail",
  label: "Journal — Detail (Label)",
  admin: { group: "Halaman (Konten)" },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    { name: "breadcrumbHome", type: "text", localized: true, defaultValue: "Beranda" },
    { name: "breadcrumbJournal", type: "text", localized: true, defaultValue: "Journal" },
    { name: "shareLabel", type: "text", localized: true, defaultValue: "Bagikan:" },
    { name: "backLabel", type: "text", localized: true, defaultValue: "← Kembali ke Journal" },
    { name: "relatedEyebrow", type: "text", localized: true, defaultValue: "Artikel terkait" },
    {
      name: "relatedHeadlineTemplate",
      type: "text",
      localized: true,
      defaultValue: "Cerita lain dari {category}",
      admin: { description: "Gunakan {category} untuk nama kategori artikel." },
    },
  ],
};
