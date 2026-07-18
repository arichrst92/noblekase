/**
 * ShareButtons — tombol bagikan artikel ke media sosial.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan penting soal Instagram: Instagram TIDAK punya URL berbagi tautan.
 * Tidak ada endpoint semacam instagram.com/share?url=… — platformnya memang
 * tidak mengizinkan posting dari web pihak ketiga. Karena itu Instagram
 * diganti tombol "Salin tautan": pengguna menyalin URL lalu menempelkannya
 * di story/bio Instagram. Ini satu-satunya jalur yang benar-benar bekerja.
 *
 * Twitter kini X, tapi endpoint intent lama (twitter.com/intent/tweet) masih
 * dilayani dan otomatis diarahkan ke x.com — jadi tetap dipakai.
 *
 * Ikon memakai lucide, konsisten dengan ikon sosial di Footer. Lucide tidak
 * menyediakan mark WhatsApp/Telegram resmi, jadi dipakai ikon generik yang
 * paling mendekati — sekaligus menghindari soal aset merek pihak ketiga.
 */

"use client";

import { useState } from "react";
import { Check, Facebook, Link2, MessageCircle, Send, Twitter } from "lucide-react";
import { defaultLocale, translator, type Locale } from "@/lib/i18n";

interface ShareButtonsProps {
  /** URL absolut artikel — dibangun di server agar benar saat SSR. */
  url: string;
  title: string;
  label?: string;
  locale?: Locale;
}

export function ShareButtons({
  url,
  title,
  label,
  locale = defaultLocale,
}: ShareButtonsProps) {
  const tr = translator(locale);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      key: "whatsapp",
      Icon: MessageCircle,
      label: tr("share.whatsapp"),
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      key: "x",
      Icon: Twitter,
      label: tr("share.x"),
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      key: "facebook",
      Icon: Facebook,
      label: tr("share.facebook"),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "telegram",
      Icon: Send,
      label: tr("share.telegram"),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard ditolak browser — abaikan, tautan tetap terlihat di address bar */
    }
  }

  const buttonClass =
    "w-9 h-9 rounded-full border border-border-mid text-ink-secondary flex items-center justify-center transition-colors hover:bg-ink-primary hover:text-bg-base hover:border-ink-primary";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-widest text-ink-tertiary mr-1">
        {label ?? tr("article.shareLabel")}
      </span>

      {targets.map(({ key, Icon, label: name, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className={buttonClass}
        >
          <Icon className="w-4 h-4" aria-hidden />
        </a>
      ))}

      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? tr("share.copied") : tr("share.copy")}
        title={copied ? tr("share.copied") : tr("share.copy")}
        className={buttonClass}
      >
        {copied ? (
          <Check className="w-4 h-4" aria-hidden />
        ) : (
          <Link2 className="w-4 h-4" aria-hidden />
        )}
      </button>

      {/* Umpan balik untuk pembaca screen reader saat tautan tersalin. */}
      <span aria-live="polite" className="sr-only">
        {copied ? tr("share.copied") : ""}
      </span>
    </div>
  );
}
