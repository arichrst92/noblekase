/**
 * Analytics — Google Analytics 4 (gtag). Measurement ID dari CMS (Integrations)
 * atau env. Hanya dirender bila ID tersedia.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import Script from "next/script";

export function Analytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
