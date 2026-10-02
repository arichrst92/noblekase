/**
 * LoginForm — masuk akun pelanggan (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Memakai endpoint auth bawaan Payload (/api/customers/login) yang memasang
 * cookie sesi. Setelah sukses, pindah ke halaman akun.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

export function LoginForm({ locale = defaultLocale }: { locale?: Locale }) {
  const tr = translator(locale);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        setError(tr("account.loginError"));
        setBusy(false);
        return;
      }
      router.push(localePath(locale, "/akun"));
      router.refresh();
    } catch {
      setError(tr("account.loginError"));
      setBusy(false);
    }
  }

  const field =
    "w-full border border-border-mid rounded-md px-3 py-2 text-sm bg-bg-base focus:border-ink-primary focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label className="block text-xs text-ink-secondary mb-1">
          {tr("account.email")}
        </label>
        <input
          type="email"
          className={field}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-xs text-ink-secondary mb-1">
          {tr("account.password")}
        </label>
        <input
          type="password"
          className={field}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-60"
      >
        {busy ? tr("account.processing") : tr("account.loginCta")}
      </button>
      <Link
        href={localePath(locale, "/akun/daftar")}
        className="block text-sm text-ink-secondary hover:text-ink-primary"
      >
        {tr("account.noAccount")}
      </Link>
    </form>
  );
}
