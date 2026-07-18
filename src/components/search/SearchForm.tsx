/**
 * SearchForm — input pencarian yang mengarah ke /cari?q=…
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface SearchFormProps {
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onSubmitted?: () => void;
}

export function SearchForm({
  defaultValue = "",
  autoFocus = false,
  placeholder = "Cari produk, kategori, atau artikel…",
  onSubmitted,
}: SearchFormProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q.length < 2) return;
        router.push(`/cari?q=${encodeURIComponent(q)}`);
        onSubmitted?.();
      }}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-ink-tertiary absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          name="q"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Kata kunci pencarian"
          className="w-full pl-11 pr-4 py-3 rounded-full border border-border-mid bg-bg-base text-sm focus:outline-none focus:border-ink-primary transition-colors"
        />
      </div>
      <button
        type="submit"
        className="bg-accent text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-ink-primary transition-colors shrink-0"
      >
        Cari
      </button>
    </form>
  );
}
