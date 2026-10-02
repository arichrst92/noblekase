/**
 * RegisterForm — daftar akun pelanggan (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Membuat akun lewat /api/account/register, lalu login otomatis dan pindah ke
 * halaman akun. Email yang sama dengan pesanan tamu sebelumnya otomatis
 * memunculkan riwayatnya (dicocokkan per email).
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

export function RegisterForm({ locale = defaultLocale }: { locale?: Locale }) {
  const tr = translator(locale);
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const email = form.email.trim().toLowerCase();
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email,
          phone: form.phone,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.error === "exists"
            ? tr("account.emailExists")
            : tr("account.registerError"),
        );
        setBusy(false);
        return;
      }
      // Login otomatis setelah daftar.
      await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.password }),
      });
      router.push(localePath(locale, "/akun"));
      router.refresh();
    } catch {
      setError(tr("account.registerError"));
      setBusy(false);
    }
  }

  const field =
    "w-full border border-border-mid rounded-md px-3 py-2 text-sm bg-bg-base focus:border-ink-primary focus:outline-none";
  const labelCls = "block text-xs text-ink-secondary mb-1";

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label className={labelCls}>{tr("account.name")}</label>
        <input
          className={field}
          value={form.name}
          onChange={set("name")}
          required
        />
      </div>
      <div>
        <label className={labelCls}>{tr("account.email")}</label>
        <input
          type="email"
          className={field}
          value={form.email}
          onChange={set("email")}
          required
        />
      </div>
      <div>
        <label className={labelCls}>{tr("account.phone")}</label>
        <input className={field} value={form.phone} onChange={set("phone")} />
      </div>
      <div>
        <label className={labelCls}>{tr("account.password")}</label>
        <input
          type="password"
          minLength={8}
          className={field}
          value={form.password}
          onChange={set("password")}
          required
        />
        <p className="text-[11px] text-ink-tertiary mt-1">
          {tr("account.passwordHint")}
        </p>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-60"
      >
        {busy ? tr("account.processing") : tr("account.registerCta")}
      </button>
      <Link
        href={localePath(locale, "/akun/masuk")}
        className="block text-sm text-ink-secondary hover:text-ink-primary"
      >
        {tr("account.haveAccount")}
      </Link>
    </form>
  );
}
