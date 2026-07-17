/**
 * Users Collection — CMS admin users
 *
 * 3 roles: superAdmin, contentEditor, seoAnalyst
 */

import type { CollectionConfig } from "payload";
import { isSuperAdmin, isAuthenticated } from "@/lib/access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 30, // 30 minutes lock after 5 failed attempts
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role", "lastLogin"],
    group: "System",
  },
  access: {
    read: isAuthenticated,
    create: isSuperAdmin,
    update: ({ req: { user }, id }) => {
      if (!user) return false;
      // Super admin can edit anyone
      if ((user as any).role === "superAdmin") return true;
      // Other users can only edit themselves
      return user.id === id;
    },
    delete: isSuperAdmin,
    // Admin panel access — inline karena signature lebih ketat (boolean only, no Where)
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "contentEditor",
      options: [
        { label: "Super Admin", value: "superAdmin" },
        { label: "Content Editor", value: "contentEditor" },
        { label: "SEO Analyst", value: "seoAnalyst" },
      ],
      access: {
        update: ({ req: { user } }) => {
          // Only Super Admin can change roles
          return Boolean(user && (user as any).role === "superAdmin");
        },
      },
      admin: {
        description: "Super Admin: full access. Content Editor: konten + produk. SEO Analyst: laporan SEO + edit meta.",
      },
    },
    {
      name: "lastLogin",
      type: "date",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
  hooks: {
    afterLogin: [
      async ({ user, req }) => {
        // Penting: teruskan `req` agar update ikut transaksi login yang sama.
        // Tanpa `req`, update memakai transaksi baru dan deadlock dengan
        // transaksi login (login stuck / menggantung).
        await req.payload.update({
          collection: "users",
          id: user.id,
          data: { lastLogin: new Date().toISOString() },
          req,
        });
      },
    ],
  },
};
