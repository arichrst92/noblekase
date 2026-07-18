/**
 * SearchOverlay — panel pencarian dari ikon di header.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Menampilkan saran langsung dari /api/search (debounce 250ms).
 * Enter / tombol "Cari" membuka halaman hasil lengkap di /cari.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface Suggestion {
  products: { slug: string; name: string; category: string }[];
  articles: { slug: string; title: string; category: string }[];
  total: number;
}

const EMPTY: Suggestion = { products: [], articles: [], total: 0 };

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [value, setValue] = useState("");
  const [data, setData] = useState<Suggestion>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fokus & tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Ambil saran (debounce)
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setData(EMPTY);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        setData(await res.json());
      } catch {
        /* dibatalkan / gagal — abaikan */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  if (!open) return null;

  const submit = () => {
    const q = value.trim();
    if (q.length < 2) return;
    router.push(`/cari?q=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Pencarian">
      <button
        className="absolute inset-0 bg-ink-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Tutup pencarian"
      />
      <div className="relative mx-auto mt-24 w-[92%] max-w-2xl bg-bg-base rounded-xl shadow-deep border border-border-light overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-border-light">
          <Search className="w-4 h-4 text-ink-tertiary ml-2 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Cari produk, kategori, atau artikel…"
            aria-label="Kata kunci pencarian"
            className="flex-1 py-2 text-sm bg-transparent focus:outline-none"
          />
          <button onClick={onClose} aria-label="Tutup" className="p-2 text-ink-tertiary hover:text-ink-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {value.trim().length < 2 && (
            <p className="px-5 py-6 text-sm text-ink-secondary">Ketik minimal 2 huruf…</p>
          )}

          {value.trim().length >= 2 && loading && (
            <p className="px-5 py-6 text-sm text-ink-secondary">Mencari…</p>
          )}

          {value.trim().length >= 2 && !loading && data.total === 0 && (
            <p className="px-5 py-6 text-sm text-ink-secondary">Tidak ada hasil.</p>
          )}

          {data.products.length > 0 && (
            <div className="py-2">
              <div className="px-5 py-2 text-[10px] uppercase tracking-widest text-ink-tertiary">
                Produk
              </div>
              {data.products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/produk/detail/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 hover:bg-bg-warm transition-colors"
                >
                  <span className="text-sm">{p.name}</span>
                  <span className="text-[11px] text-ink-tertiary">{p.category}</span>
                </Link>
              ))}
            </div>
          )}

          {data.articles.length > 0 && (
            <div className="py-2 border-t border-border-light">
              <div className="px-5 py-2 text-[10px] uppercase tracking-widest text-ink-tertiary">
                Journal
              </div>
              {data.articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/journal/${a.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 hover:bg-bg-warm transition-colors"
                >
                  <span className="text-sm">{a.title}</span>
                  <span className="text-[11px] text-ink-tertiary">{a.category}</span>
                </Link>
              ))}
            </div>
          )}

          {data.total > 0 && (
            <button
              onClick={submit}
              className="w-full px-5 py-3 text-sm font-medium text-accent hover:bg-bg-warm border-t border-border-light text-left"
            >
              Lihat semua hasil untuk &ldquo;{value.trim()}&rdquo; →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
