/**
 * Access control helpers untuk Payload collections
 *
 * 3 roles: superAdmin, contentEditor, seoAnalyst
 *
 * Note: type User dari @/payload-types akan auto-generate setelah Payload
 * pertama kali jalan dengan database. Sebelum itu, kita pakai inline type.
 *
 * Dibuat oleh: PT Solusi Inovasi Bangsa
 */

import type { Access, FieldAccess } from "payload";

export type Role = "superAdmin" | "contentEditor" | "seoAnalyst";

/** Minimal User shape untuk type checking sebelum payload-types.ts ter-generate */
type UserWithRole = {
  id: string | number;
  email?: string;
  role?: Role;
};

/** Allow only authenticated users */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user);

/** Only Super Admin */
export const isSuperAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && (user as UserWithRole).role === "superAdmin");
};

/** Super Admin OR Content Editor */
export const isAdminOrEditor: Access = ({ req: { user } }) => {
  if (!user) return false;
  const role = (user as UserWithRole).role;
  return role === "superAdmin" || role === "contentEditor";
};

/** Super Admin OR SEO Analyst (can read SEO meta) */
export const isAdminOrSEO: Access = ({ req: { user } }) => {
  if (!user) return false;
  const role = (user as UserWithRole).role;
  return role === "superAdmin" || role === "seoAnalyst";
};

/** Public read for published items only, admin sees all */
export const isPublishedOrAdmin: Access = ({ req: { user } }) => {
  if (user) return true;
  return {
    status: { equals: "published" },
  };
};

/** Field-level access: only Super Admin can edit */
export const fieldSuperAdminOnly: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && (user as UserWithRole).role === "superAdmin");
};
