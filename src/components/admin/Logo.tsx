/**
 * Logo — logo besar Noblekase di halaman login admin.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import React from "react";

export const Logo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className="nk-admin-logo"
    src="/images/noblekase-logo.png"
    alt="Noblekase"
    style={{ height: 56, width: "auto", maxWidth: "none", objectFit: "contain" }}
  />
);

export default Logo;
