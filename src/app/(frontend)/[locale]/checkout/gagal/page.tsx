/**
 * /checkout/gagal — halaman tujuan saat pembayaran gagal/dibatalkan di Xendit.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Keranjang SENGAJA tidak dikosongkan di sini — pembeli bisa mencoba bayar lagi.
 */

"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { localePath, stripLocale, translator } from "@/lib/i18n";

function FailInner() {
  const { locale } = stripLocale(usePathname() || "/");
  const tr = translator(locale);
  const order = useSearchParams().get("order") ?? "";

  return (
    <section className="min-h-[70vh] flex items-center py-24">
      <div className="container-prose max-w-lg text-center">
        <XCircle
          className="w-12 h-12 text-ink-tertiary mx-auto mb-5"
          aria-hidden
        />
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4 tracking-tight">
          {tr("checkout.failTitle")}
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">
          {tr("checkout.failBody", { order })}
        </p>
        <Link
          href={localePath(locale, "/checkout")}
          className="inline-block bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
        >
          {tr("checkout.pay")}
        </Link>
      </div>
    </section>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <FailInner />
    </Suspense>
  );
}
