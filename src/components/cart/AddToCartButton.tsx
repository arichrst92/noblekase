/**
 * AddToCartButton — tombol tambah ke keranjang.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Dipakai di kartu produk (variant "compact") dan halaman detail
 * (variant "full"). Dinonaktifkan bila produk tanpa harga atau stok habis —
 * jadi produk yang belum diisi harga/stok tidak bisa dibeli tanpa menyembunyikan
 * tombolnya diam-diam.
 */

"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/CartContext";
import { defaultLocale, translator, type Locale } from "@/lib/i18n";

interface AddToCartButtonProps {
  slug: string;
  name: string;
  price?: number;
  imageUrl?: string;
  weightGrams?: number;
  stock?: number;
  locale?: Locale;
  variant?: "compact" | "full";
  className?: string;
}

export function AddToCartButton({
  slug,
  name,
  price,
  imageUrl,
  weightGrams,
  stock,
  locale = defaultLocale,
  variant = "full",
  className,
}: AddToCartButtonProps) {
  const tr = translator(locale);
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const hasPrice = typeof price === "number" && price > 0;
  const outOfStock = typeof stock === "number" && stock <= 0;
  const disabled = !hasPrice || outOfStock;

  const label = !hasPrice
    ? tr("cart.priceUnavailable")
    : outOfStock
      ? tr("cart.outOfStock")
      : justAdded
        ? tr("cart.added")
        : tr("cart.add");

  function handleAdd() {
    if (disabled) return;
    add({
      slug,
      name,
      price: price!,
      imageUrl,
      weightGrams: weightGrams ?? 0,
      maxStock: stock,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  const base =
    variant === "compact"
      ? "inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-md text-xs font-medium"
      : "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium";

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      aria-label={`${tr("cart.add")} — ${name}`}
      className={cn(
        base,
        "transition-colors",
        disabled
          ? "bg-bg-warm text-ink-tertiary cursor-not-allowed"
          : justAdded
            ? "bg-ink-primary text-bg-base"
            : "bg-accent text-white hover:bg-ink-primary",
        className,
      )}
    >
      {justAdded ? (
        <Check
          className={variant === "compact" ? "w-3.5 h-3.5" : "w-4 h-4"}
          aria-hidden
        />
      ) : (
        <ShoppingBag
          className={variant === "compact" ? "w-3.5 h-3.5" : "w-4 h-4"}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}
