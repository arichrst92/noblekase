/**
 * /akun — dashboard akun pelanggan (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import type { Metadata } from "next";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  return {
    title: t(locale, "account.title"),
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  return (
    <>
      <RevealOnScroll />
      <section className="pt-28 md:pt-32 pb-24 md:pb-20">
        <div className="container-prose">
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-8 tracking-tight">
            {t(locale, "account.title")}
          </h1>
          <AccountDashboard locale={locale} />
        </div>
      </section>
    </>
  );
}
