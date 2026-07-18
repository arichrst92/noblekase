/**
 * Error boundary halaman frontend.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Menampilkan pesan yang tenang, menawarkan coba-ulang, dan mencatat error
 * ke konsol server/browser. Digest disertakan agar mudah dicocokkan dengan
 * log saat pelanggan melapor.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, stripLocale, translator } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Next tidak mengoper `params` ke error boundary, jadi bahasa dibaca dari
  // pathname yang sedang dibuka (prefix "/en" dilepas oleh stripLocale).
  const { locale } = stripLocale(usePathname() ?? "/");
  const tr = translator(locale);

  useEffect(() => {
    console.error("[frontend error]", error);
  }, [error]);

  return (
    <section className="min-h-[70vh] flex items-center py-24">
      <div className="container-prose max-w-xl text-center">
        <div className="eyebrow mb-3">{tr("error.eyebrow")}</div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-4 tracking-tight">
          {tr("error.heading")}
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">{tr("error.body")}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
          >
            {tr("error.retry")}
          </button>
          <Link
            href={localePath(locale, "/dukungan")}
            className="border border-ink-primary text-ink-primary px-6 py-3 rounded-md text-sm font-medium hover:bg-bg-warm transition-colors"
          >
            {tr("error.contactSupport")}
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[11px] text-ink-tertiary">
            {tr("error.referenceCode")} <code>{error.digest}</code>
          </p>
        )}
      </div>
    </section>
  );
}
