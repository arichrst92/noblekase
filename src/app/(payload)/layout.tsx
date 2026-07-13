/**
 * Payload Layout — root layout untuk Payload admin panel
 *
 * Tidak boleh include frontend styling—Payload akan inject styling sendiri.
 */

import { CSSProperties } from "react";

export const metadata = {
  description: "Noblekase CMS Admin Panel",
  title: "Noblekase CMS",
};

const layoutStyle: CSSProperties = {
  height: "100%",
  margin: 0,
  padding: 0,
};

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" style={layoutStyle}>
      <body style={layoutStyle}>{children}</body>
    </html>
  );
}
