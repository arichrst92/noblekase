/**
 * CartButton — ikon keranjang di navbar + panel geser (drawer) isi keranjang.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Badge jumlah hanya muncul setelah hidrasi keranjang selesai, supaya angka
 * dari localStorage tidak berbeda antara render server dan klien (hydration
 * mismatch). Drawer mengunci scroll body saat terbuka dan bisa ditutup lewat
 * tombol, overlay, atau tombol Escape.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/CartContext";
import { formatRupiah } from "@/lib/format";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";
import { SmartImage as Image } from "@/components/media/SmartImage";

export function CartButton({ locale = defaultLocale }: { locale?: Locale }) {
  const tr = translator(locale);
  const { items, count, subtotal, setQuantity, remove, hydrated } = useCart();
  const [open, setOpen] = useState(false);

  // Kunci scroll body + tutup dengan Escape saat drawer terbuka.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tr("cart.open")}
        aria-haspopup="dialog"
        className="relative p-1.5 md:px-2.5 md:py-1 md:bg-bg-warm md:rounded-full text-ink-secondary hover:text-ink-primary transition-colors"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        {hydrated && count > 0 && (
          <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] font-medium flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label={tr("cart.title")}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-bg-base shadow-lift flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <h2 className="font-serif text-lg font-medium">
                {tr("cart.title")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={tr("cart.close")}
                className="p-1 text-ink-secondary hover:text-ink-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag
                  className="w-10 h-10 text-ink-tertiary"
                  aria-hidden
                />
                <p className="text-ink-secondary">{tr("cart.empty")}</p>
                <Link
                  href={localePath(locale, "/produk")}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-accent hover:text-ink-primary"
                >
                  {tr("cart.continueShopping")} →
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto divide-y divide-border-light">
                  {items.map((item) => (
                    <li key={item.slug} className="flex gap-3 p-4">
                      <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-bg-warm border border-border-light">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={localePath(
                            locale,
                            `/produk/detail/${item.slug}`,
                          )}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-ink-primary hover:text-accent line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <div className="text-xs text-ink-secondary mt-0.5">
                          {formatRupiah(item.price)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center border border-border-mid rounded-md">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(item.slug, item.quantity - 1)
                              }
                              aria-label="−"
                              className="p-1.5 text-ink-secondary hover:text-ink-primary"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="min-w-[24px] text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(item.slug, item.quantity + 1)
                              }
                              disabled={
                                item.maxStock != null &&
                                item.quantity >= item.maxStock
                              }
                              aria-label="+"
                              className="p-1.5 text-ink-secondary hover:text-ink-primary disabled:text-ink-tertiary disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.slug)}
                            aria-label={`${tr("cart.remove")} — ${item.name}`}
                            className="p-1.5 text-ink-tertiary hover:text-accent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-ink-primary whitespace-nowrap">
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="border-t border-border-light p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-secondary">
                      {tr("cart.subtotal")}
                    </span>
                    <span className="font-serif text-lg font-medium">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-tertiary">
                    {tr("cart.shippingNote")}
                  </p>
                  <Link
                    href={localePath(locale, "/checkout")}
                    onClick={() => setOpen(false)}
                    className="block w-full text-center bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
                  >
                    {tr("cart.checkout")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
