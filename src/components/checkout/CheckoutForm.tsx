/**
 * CheckoutForm — form checkout + ringkasan pesanan (Fase 9.2).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Mengumpulkan data pembeli & alamat, lalu POST ke /api/checkout. Server yang
 * menghitung ulang harga/stok dan membuat invoice Xendit — form ini hanya
 * mengirim slug + kuantitas, bukan harga (harga dari klien tidak dipercaya).
 *
 * Ongkir belum muncul di fase ini (Biteship = Fase 9.3); baris ongkir tampil
 * sebagai "dihitung di langkah pengiriman".
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatRupiah } from "@/lib/format";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

export function CheckoutForm({ locale = defaultLocale }: { locale?: Locale }) {
  const tr = translator(locale);
  const { items, subtotal, hydrated } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    recipientName: "",
    recipientPhone: "",
    addressLine: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    notes: "",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Sebelum hidrasi, isi keranjang belum terbaca dari localStorage.
  if (!hydrated)
    return <div className="py-20 text-center text-ink-tertiary">…</div>;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-secondary mb-4">{tr("checkout.empty")}</p>
        <Link
          href={localePath(locale, "/produk")}
          className="text-sm font-medium text-accent hover:text-ink-primary"
        >
          {tr("checkout.backToShop")} →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          customer: { name: form.name, email: form.email, phone: form.phone },
          shippingAddress: {
            recipientName: form.recipientName,
            phone: form.recipientPhone,
            addressLine: form.addressLine,
            province: form.province,
            city: form.city,
            district: form.district,
            postalCode: form.postalCode,
            notes: form.notes,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          Array.isArray(data?.problems) && data.problems.length
            ? data.problems.join(" ")
            : data?.error || tr("checkout.errorGeneric"),
        );
        setSubmitting(false);
        return;
      }
      // Arahkan ke halaman bayar Xendit.
      window.location.href = data.invoiceUrl;
    } catch {
      setError(tr("checkout.errorGeneric"));
      setSubmitting(false);
    }
  }

  const field =
    "w-full border border-border-mid rounded-md px-3 py-2 text-sm bg-bg-base focus:border-ink-primary focus:outline-none";
  const labelCls = "block text-xs text-ink-secondary mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12"
    >
      {/* Kolom kiri: form */}
      <div className="space-y-8">
        <section>
          <h2 className="font-serif text-lg font-medium mb-4">
            {tr("checkout.contactHeading")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>{tr("checkout.name")}</label>
              <input
                className={field}
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>{tr("checkout.email")}</label>
              <input
                type="email"
                className={field}
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>{tr("checkout.phone")}</label>
              <input
                className={field}
                value={form.phone}
                onChange={set("phone")}
                required
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg font-medium mb-4">
            {tr("checkout.shippingHeading")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{tr("checkout.recipientName")}</label>
              <input
                className={field}
                value={form.recipientName}
                onChange={set("recipientName")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>
                {tr("checkout.recipientPhone")}
              </label>
              <input
                className={field}
                value={form.recipientPhone}
                onChange={set("recipientPhone")}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{tr("checkout.addressLine")}</label>
              <textarea
                className={field}
                rows={2}
                value={form.addressLine}
                onChange={set("addressLine")}
                required
              />
              <p className="text-[11px] text-ink-tertiary mt-1">
                {tr("checkout.addressLineHint")}
              </p>
            </div>
            <div>
              <label className={labelCls}>{tr("checkout.province")}</label>
              <input
                className={field}
                value={form.province}
                onChange={set("province")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>{tr("checkout.city")}</label>
              <input
                className={field}
                value={form.city}
                onChange={set("city")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>{tr("checkout.district")}</label>
              <input
                className={field}
                value={form.district}
                onChange={set("district")}
              />
            </div>
            <div>
              <label className={labelCls}>{tr("checkout.postalCode")}</label>
              <input
                className={field}
                value={form.postalCode}
                onChange={set("postalCode")}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{tr("checkout.notes")}</label>
              <textarea
                className={field}
                rows={2}
                value={form.notes}
                onChange={set("notes")}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Kolom kanan: ringkasan */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-border-light rounded-lg p-5 bg-bg-cream">
          <h2 className="font-serif text-lg font-medium mb-4">
            {tr("checkout.summaryHeading")}
          </h2>
          <ul className="space-y-2 mb-4">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-secondary">
                  {i.name}{" "}
                  <span className="text-ink-tertiary">× {i.quantity}</span>
                </span>
                <span className="whitespace-nowrap">
                  {formatRupiah(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border-mid pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-secondary">{tr("cart.subtotal")}</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">
                {tr("checkout.shipping")}
              </span>
              <span className="text-ink-tertiary text-xs">
                {tr("checkout.shippingTbd")}
              </span>
            </div>
            <div className="flex justify-between font-medium text-base pt-1.5 border-t border-border-mid mt-1.5">
              <span>{tr("checkout.total")}</span>
              <span className="font-serif">{formatRupiah(subtotal)}</span>
            </div>
          </div>

          {error && (
            <p
              className="mt-4 text-sm text-accent bg-accent-soft rounded-md px-3 py-2"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? tr("checkout.processing") : tr("checkout.pay")}
          </button>
        </div>
      </aside>
    </form>
  );
}
