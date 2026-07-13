/**
 * Header Global — navigation menu top + mobile bottom nav
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const Header: GlobalConfig = {
  slug: "header",
  admin: {
    group: "System",
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: "navItems",
      type: "array",
      maxRows: 6,
      fields: [
        { name: "label", type: "text", localized: true, required: true },
        { name: "url", type: "text", required: true },
      ],
      defaultValue: [
        { label: "Beranda", url: "/" },
        { label: "Produk", url: "/produk" },
        { label: "Tentang", url: "/tentang" },
        { label: "Journal", url: "/journal" },
        { label: "Dukungan", url: "/dukungan" },
      ],
    },
    {
      name: "mobileBottomNav",
      type: "array",
      maxRows: 5,
      fields: [
        { name: "label", type: "text", localized: true, required: true },
        { name: "url", type: "text", required: true },
        { name: "icon", type: "text", admin: { description: "Lucide icon name." } },
        { name: "isCenterLogo", type: "checkbox", defaultValue: false },
      ],
      defaultValue: [
        { label: "Beranda", url: "/", icon: "home" },
        { label: "Produk", url: "/produk", icon: "grid" },
        { label: "", url: "#", isCenterLogo: true },
        { label: "Journal", url: "/journal", icon: "book-open" },
        { label: "Lainnya", url: "#more", icon: "more-horizontal" },
      ],
    },
  ],
};
