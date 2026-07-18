/**
 * PoweredBy — kredit pembuat di panel admin.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Dipakai di dua tempat lewat slot bawaan Payload:
 *   - `admin.components.afterNavLinks` → dasar sidebar, digeser ke bawah
 *     tombol logout lewat `order` di custom.css.
 *   - `admin.components.afterLogin`   → bawah form login.
 *
 * Markup-nya sama, hanya penataannya yang beda: di sidebar tampil sebagai
 * footer bergaris pemisah, di halaman login tampil rata tengah tanpa garis.
 * Perbedaan itu diatur lewat kelas modifier, bukan komponen terpisah, supaya
 * tautan dan logonya tidak perlu ditulis dua kali.
 */

import React from "react";

const Credit = ({ variant }: { variant?: "login" }) => (
  <a
    className={`nk-powered-by${variant ? ` nk-powered-by--${variant}` : ""}`}
    href="https://ide.asia"
    target="_blank"
    rel="noopener noreferrer"
    title="Dibuat oleh PT Solusi Inovasi Bangsa"
  >
    <span className="nk-powered-by__label">powered by</span>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/images/idea.webp" alt="IDEA" className="nk-powered-by__logo" />
  </a>
);

/** Varian sidebar — dipasang di `afterNavLinks`. */
export const PoweredBy = () => <Credit />;

/** Varian halaman login — dipasang di `afterLogin`. */
export const PoweredByLogin = () => <Credit variant="login" />;

export default PoweredBy;
