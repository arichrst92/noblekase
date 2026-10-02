/**
 * TrackOrder — form & hasil pelacakan pesanan (Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import {
  defaultLocale,
  t,
  translator,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

interface TrackedOrder {
  orderNumber: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  courierName: string;
  waybillId: string;
  trackingStatus: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: { name: string; quantity: number; lineTotal: number }[];
  createdAt: string;
}

export function TrackOrder({ locale = defaultLocale }: { locale?: Locale }) {
  const tr = translator(locale);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (data?.found && data.order) setOrder(data.order);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full border border-border-mid rounded-md px-3 py-2 text-sm bg-bg-base focus:border-ink-primary focus:outline-none";
  const payKey = `track.pay.${order?.paymentStatus}` as TranslationKey;
  const fulKey = `track.ful.${order?.fulfillmentStatus}` as TranslationKey;

  return (
    <div className="max-w-xl">
      <p className="text-ink-secondary mb-6">{tr("track.intro")}</p>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="block text-xs text-ink-secondary mb-1">
            {tr("track.orderNumber")}
          </label>
          <input
            className={field}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="NBK-…"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-ink-secondary mb-1">
            {tr("track.email")}
          </label>
          <input
            type="email"
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-60"
        >
          {loading ? tr("track.loading") : tr("track.submit")}
        </button>
      </form>

      {notFound && (
        <p className="mt-6 text-sm text-accent">{tr("track.notFound")}</p>
      )}

      {order && (
        <div className="mt-8 border border-border-light rounded-lg p-5 bg-bg-cream">
          <div className="font-serif text-lg font-medium mb-4">
            {order.orderNumber}
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-secondary">
                {tr("track.paymentStatus")}
              </dt>
              <dd className="font-medium">{t(locale, payKey)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-secondary">
                {tr("track.fulfillmentStatus")}
              </dt>
              <dd className="font-medium">{t(locale, fulKey)}</dd>
            </div>
            {order.courierName && (
              <div className="flex justify-between">
                <dt className="text-ink-secondary">{tr("track.courier")}</dt>
                <dd>{order.courierName}</dd>
              </div>
            )}
            {order.waybillId && (
              <div className="flex justify-between">
                <dt className="text-ink-secondary">{tr("track.waybill")}</dt>
                <dd className="font-mono">{order.waybillId}</dd>
              </div>
            )}
          </dl>

          <ul className="mt-4 pt-4 border-t border-border-mid space-y-1.5 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3">
                <span className="text-ink-secondary">
                  {i.name}{" "}
                  <span className="text-ink-tertiary">× {i.quantity}</span>
                </span>
                <span className="whitespace-nowrap">
                  {formatRupiah(i.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border-mid flex justify-between text-sm font-medium">
            <span>{tr("checkout.total")}</span>
            <span className="font-serif">{formatRupiah(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
