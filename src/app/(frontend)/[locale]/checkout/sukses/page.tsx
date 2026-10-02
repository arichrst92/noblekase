/**
 * /checkout/sukses — halaman tujuan setelah pembayaran berhasil di Xendit.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Status "paid" yang sebenarnya ditetapkan oleh WEBHOOK, bukan halaman ini —
 * redirect sukses hanya sinyal dari sisi pembeli dan tidak boleh dipercaya
 * sebagai bukti pembayaran. Halaman ini hanya memberi konfirmasi visual dan
 * mengosongkan keranjang.
 */

"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { localePath, stripLocale, translator } from "@/lib/i18n";

function SuccessInner() {
  const { locale } = stripLocale(usePathname() || "/");
  const tr = translator(locale);
  const order = useSearchParams().get("order") ?? "";
  const { clear } = useCart();

  // Kosongkan keranjang HANYA bila halaman ini dibuka sebagai tujuan redirect
  // Xendit (ada ?order=…). Tanpa syarat ini, membuka /checkout/sukses langsung
  // tanpa menyelesaikan pembayaran akan menghapus keranjang yang masih valid.
  useEffect(() => {
    if (order) clear();
  }, [order, clear]);

  return (
    <section className="min-h-[70vh] flex items-center py-24">
      <div className="container-prose max-w-lg text-center">
        <CheckCircle2
          className="w-12 h-12 text-accent mx-auto mb-5"
          aria-hidden
        />
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4 tracking-tight">
          {tr("checkout.successTitle")}
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">
          {tr("checkout.successBody", { order })}
        </p>
        <Link
          href={localePath(locale, "/produk")}
          className="inline-block bg-ink-primary text-bg-base px-6 py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
        >
          {tr("checkout.backToShop")}
        </Link>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessInner />
    </Suspense>
  );
}
