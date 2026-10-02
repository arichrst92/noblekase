/**
 * CheckoutForm — form checkout + ongkir + ringkasan (Fase 9.2 + 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Alur:
 *   1. Pembeli mengetik area tujuan → autocomplete Biteship (/api/shipping/areas).
 *   2. Setelah area dipilih, ongkir dihitung (/api/shipping/rates) dan daftar
 *      kurir muncul untuk dipilih.
 *   3. Submit ke /api/checkout — server MENGHITUNG ULANG harga & ongkir, jadi
 *      angka dari form ini hanya untuk tampilan.
 *
 * Provinsi/kota/kecamatan/kode pos diturunkan dari area terpilih, bukan diisi
 * manual — supaya cocok persis dengan area id yang dipakai Biteship.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatRupiah } from "@/lib/format";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

interface Area {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
}
interface Rate {
  courierCompany: string;
  courierType: string;
  courierName: string;
  serviceName: string;
  price: number;
  etaText: string;
}

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
    notes: "",
  });
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // --- Area tujuan ---
  const [areaQuery, setAreaQuery] = useState("");
  const [areaResults, setAreaResults] = useState<Area[]>([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [area, setArea] = useState<Area | null>(null);

  // --- Ongkir ---
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [courier, setCourier] = useState<Rate | null>(null);

  const itemsKey = JSON.stringify(items.map((i) => [i.slug, i.quantity]));

  // Autocomplete area (debounce).
  useEffect(() => {
    if (area) return; // sudah terpilih, jangan cari lagi
    const q = areaQuery.trim();
    if (q.length < 3) {
      setAreaResults([]);
      return;
    }
    setAreaLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/shipping/areas?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        setAreaResults(Array.isArray(data.areas) ? data.areas : []);
      } catch {
        setAreaResults([]);
      } finally {
        setAreaLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [areaQuery, area]);

  // Hitung ongkir setiap kali area atau isi keranjang berubah.
  useEffect(() => {
    if (!area) {
      setRates([]);
      setCourier(null);
      return;
    }
    let cancelled = false;
    setRatesLoading(true);
    setRatesError(null);
    setCourier(null);
    (async () => {
      try {
        const res = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            destinationAreaId: area.id,
            items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !Array.isArray(data.rates)) {
          setRates([]);
          setRatesError(tr("checkout.ratesError"));
        } else {
          setRates(data.rates);
        }
      } catch {
        if (!cancelled) setRatesError(tr("checkout.ratesError"));
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, itemsKey, locale]);

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
    if (!area) {
      setError(tr("checkout.chooseAreaFirst"));
      return;
    }
    if (!courier) {
      setError(tr("checkout.chooseCourier"));
      return;
    }
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
            // Beberapa area Biteship mengembalikan level provinsi/kota kosong;
            // isi dari field yang tersedia agar validasi order (yang mewajibkan
            // keduanya) tidak buntu — buyer tak bisa mengetiknya manual.
            province: area.province || area.city || area.district || area.name,
            city: area.city || area.district || area.name,
            district: area.district,
            postalCode: area.postalCode,
            biteshipAreaId: area.id,
            notes: form.notes,
          },
          courier: {
            company: courier.courierCompany,
            type: courier.courierType,
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
      window.location.href = data.invoiceUrl;
    } catch {
      setError(tr("checkout.errorGeneric"));
      setSubmitting(false);
    }
  }

  const field =
    "w-full border border-border-mid rounded-md px-3 py-2 text-sm bg-bg-base focus:border-ink-primary focus:outline-none";
  const labelCls = "block text-xs text-ink-secondary mb-1";
  const shippingCost = courier?.price ?? 0;
  const total = subtotal + shippingCost;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12"
    >
      <div className="space-y-8">
        {/* Data pembeli */}
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

        {/* Alamat */}
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

            {/* Area tujuan — autocomplete Biteship */}
            <div className="sm:col-span-2">
              <label className={labelCls}>{tr("checkout.area")}</label>
              {area ? (
                <div className="flex items-center justify-between gap-3 border border-border-mid rounded-md px-3 py-2 text-sm bg-bg-warm">
                  <span>
                    {[area.district, area.city, area.province, area.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setArea(null);
                      setAreaQuery("");
                    }}
                    className="text-xs text-accent hover:text-ink-primary shrink-0"
                  >
                    {tr("checkout.change")}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    className={field}
                    value={areaQuery}
                    onChange={(e) => setAreaQuery(e.target.value)}
                    placeholder={tr("checkout.areaHint")}
                    autoComplete="off"
                  />
                  {(areaLoading ||
                    areaResults.length > 0 ||
                    areaQuery.trim().length >= 3) && (
                    <div className="absolute z-10 mt-1 w-full bg-bg-base border border-border-mid rounded-md shadow-lift max-h-60 overflow-y-auto">
                      {areaLoading && (
                        <div className="px-3 py-2 text-sm text-ink-tertiary">
                          {tr("checkout.areaSearching")}
                        </div>
                      )}
                      {!areaLoading && areaResults.length === 0 && (
                        <div className="px-3 py-2 text-sm text-ink-tertiary">
                          {tr("checkout.areaNoResult")}
                        </div>
                      )}
                      {areaResults.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => {
                            setArea(r);
                            setAreaResults([]);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-warm"
                        >
                          {[r.district, r.city, r.province, r.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

        {/* Kurir */}
        <section>
          <h2 className="font-serif text-lg font-medium mb-4">
            {tr("checkout.courierHeading")}
          </h2>
          {!area && (
            <p className="text-sm text-ink-tertiary">
              {tr("checkout.chooseAreaFirst")}
            </p>
          )}
          {area && ratesLoading && (
            <p className="text-sm text-ink-tertiary">
              {tr("checkout.loadingRates")}
            </p>
          )}
          {area && !ratesLoading && ratesError && (
            <p className="text-sm text-accent">{ratesError}</p>
          )}
          {area && !ratesLoading && !ratesError && rates.length === 0 && (
            <p className="text-sm text-ink-tertiary">
              {tr("checkout.noRates")}
            </p>
          )}
          {area && !ratesLoading && rates.length > 0 && (
            <div className="space-y-2">
              {rates.map((r) => {
                const id = `${r.courierCompany}-${r.courierType}`;
                const active =
                  courier &&
                  `${courier.courierCompany}-${courier.courierType}` === id;
                return (
                  <label
                    key={id}
                    className={`flex items-center justify-between gap-3 border rounded-md px-3 py-2.5 cursor-pointer transition-colors ${
                      active
                        ? "border-ink-primary bg-bg-warm"
                        : "border-border-mid hover:border-ink-primary"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="courier"
                        checked={!!active}
                        onChange={() => setCourier(r)}
                        className="accent-[#F15A24]"
                      />
                      <span className="text-sm">
                        <span className="font-medium">{r.courierName}</span>{" "}
                        <span className="text-ink-secondary">
                          {r.serviceName}
                        </span>
                        {r.etaText && (
                          <span className="block text-[11px] text-ink-tertiary">
                            {r.etaText}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {formatRupiah(r.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Ringkasan */}
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
              <span>
                {courier ? (
                  formatRupiah(shippingCost)
                ) : (
                  <span className="text-ink-tertiary text-xs">
                    {tr("checkout.shippingTbd")}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between font-medium text-base pt-1.5 border-t border-border-mid mt-1.5">
              <span>{tr("checkout.total")}</span>
              <span className="font-serif">{formatRupiah(total)}</span>
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
            disabled={submitting || !courier}
            className="mt-5 w-full bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? tr("checkout.processing") : tr("checkout.pay")}
          </button>
        </div>
      </aside>
    </form>
  );
}
