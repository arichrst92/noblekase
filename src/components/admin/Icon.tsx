/**
 * Icon — mark "K" Noblekase di navigator/header admin.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Memakai mark persegi (bukan logo wordmark), karena slot ikon Payload
 * berukuran kecil & persegi — wordmark 6:1 akan terpotong di sana.
 */

import React from "react";

export const Icon = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className="nk-admin-icon"
    src="/images/brand/favicon-noblekase.png"
    alt="Noblekase"
    width={28}
    height={28}
    style={{ width: 28, height: 28, objectFit: "contain" }}
  />
);

export default Icon;
