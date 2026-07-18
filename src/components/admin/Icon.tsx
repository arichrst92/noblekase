/**
 * Icon — logo kecil Noblekase di navbar/header admin.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import React from "react";

export const Icon = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className="nk-admin-icon"
    src="/images/noblekase-logo.png"
    alt="Noblekase"
    style={{ height: 30, width: "auto", maxWidth: "none", objectFit: "contain" }}
  />
);

export default Icon;
