/**
 * Error boundary halaman frontend.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Menampilkan pesan yang tenang, menawarkan coba-ulang, dan mencatat error
 * ke konsol server/browser. Digest disertakan agar mudah dicocokkan dengan
 * log saat pelanggan melapor.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[frontend error]", error);
  }, [error]);

  return (
    <section className="min-h-[70vh] flex items-center py-24">
      <div className="container-prose max-w-xl text-center">
        <div className="eyebrow mb-3">Ada gangguan</div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-4 tracking-tight">
          Maaf, halaman ini gagal dimuat
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">
          Gangguan sementara di sisi kami. Coba muat ulang — kalau masih bermasalah, hubungi
          kami lewat halaman Dukungan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
          >
            Coba lagi
          </button>
          <Link
            href="/dukungan"
            className="border border-ink-primary text-ink-primary px-6 py-3 rounded-md text-sm font-medium hover:bg-bg-warm transition-colors"
          >
            Hubungi Dukungan
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[11px] text-ink-tertiary">
            Kode rujukan: <code>{error.digest}</code>
          </p>
        )}
      </div>
    </section>
  );
}
