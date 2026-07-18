/**
 * PoweredBy — kredit pembuat di bagian bawah sidebar admin.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Dipasang lewat slot `admin.components.afterNavLinks` milik Payload,
 * lalu digeser ke bawah tombol logout lewat `order` di custom.css
 * (lihat blok .nk-powered-by / .nav__controls di sana).
 */

import React from "react";

export const PoweredBy = () => (
  <a
    className="nk-powered-by"
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

export default PoweredBy;
