/**
 * AccountDashboard — ringkasan akun + riwayat pesanan (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Mengambil data dari /api/account/orders (yang mengautentikasi pelanggan dari
 * cookie). Bila belum login, menampilkan ajakan masuk.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import {
  defaultLocale,
  localePath,
  t,
  translator,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

interface AccountOrder {
  orderNumber: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  courierName: string;
  waybillId: string;
  createdAt: string;
  items: { name: string; quantity: number; lineTotal: number }[];
}

export function AccountDashboard({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const tr = translator(locale);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState("");
  const [orders, setOrders] = useState<AccountOrder[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/orders");
        if (res.status === 401) {
          setAuthed(false);
        } else {
          const data = await res.json();
          setAuthed(true);
          setName(data.name ?? "");
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function logout() {
    await fetch("/api/customers/logout", { method: "POST" }).catch(() => {});
    router.refresh();
    router.push(localePath(locale, "/akun/masuk"));
  }

  if (loading)
    return <p className="text-ink-tertiary">{t(locale, "track.loading")}</p>;

  if (!authed) {
    return (
      <div>
        <p className="text-ink-secondary mb-4">{tr("account.mustLogin")}</p>
        <Link
          href={localePath(locale, "/akun/masuk")}
          className="inline-block bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
        >
          {tr("account.login")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-lg">{tr("account.greeting", { name })}</p>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-ink-secondary hover:text-accent"
        >
          {tr("account.logout")}
        </button>
      </div>

      <h2 className="font-serif text-xl font-medium mb-4">
        {tr("account.ordersHeading")}
      </h2>
      {orders.length === 0 ? (
        <p className="text-ink-secondary">{tr("account.noOrders")}</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.orderNumber}
              className="border border-border-light rounded-lg p-4 bg-bg-cream"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{o.orderNumber}</span>
                <span className="font-serif">{formatRupiah(o.total)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary mb-2">
                <span>
                  {t(locale, `track.pay.${o.paymentStatus}` as TranslationKey)}
                </span>
                <span>·</span>
                <span>
                  {t(
                    locale,
                    `track.ful.${o.fulfillmentStatus}` as TranslationKey,
                  )}
                </span>
                {o.courierName && (
                  <>
                    <span>·</span>
                    <span>{o.courierName}</span>
                  </>
                )}
                {o.waybillId && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{o.waybillId}</span>
                  </>
                )}
              </div>
              <ul className="text-sm text-ink-secondary">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
