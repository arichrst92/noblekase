/**
 * CartContext — keranjang belanja berbasis state browser + localStorage.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Checkout tamu: keranjang tidak butuh akun, cukup tersimpan di browser
 * pengunjung. localStorage dipakai agar isi keranjang bertahan saat halaman
 * di-refresh atau tab ditutup, tapi SELALU dibungkus try/catch — di mode
 * privat/incognito atau saat storage penuh, akses localStorage bisa melempar
 * error, dan keranjang tidak boleh sampai membuat situs error.
 *
 * Harga & berat ikut disimpan sebagai snapshot ringan supaya ringkasan
 * keranjang bisa dihitung tanpa query ulang. Kebenaran harga & stok tetap
 * diverifikasi ulang di server saat checkout (Fase 9.2) — snapshot di sini
 * hanya untuk tampilan.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  weightGrams: number;
  /** Stok saat item ditambahkan — batas atas kuantitas di UI. */
  maxStock?: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  totalWeightGrams: number;
  /** Tambah item; bila sudah ada, kuantitasnya dijumlahkan (dibatasi stok). */
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  /** Hidrasi selesai — mencegah mismatch SSR/klien saat render pertama. */
  hydrated: boolean;
}

const STORAGE_KEY = "nk-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Saring entri yang bentuknya tidak valid (mis. versi lama).
    return parsed.filter(
      (i): i is CartItem =>
        i &&
        typeof i.slug === "string" &&
        typeof i.price === "number" &&
        typeof i.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Muat dari storage SETELAH mount — bukan saat inisialisasi state — supaya
  // render pertama di server dan klien sama (menghindari hydration mismatch).
  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  // Simpan tiap perubahan, tapi hanya setelah hidrasi agar tidak menimpa
  // storage dengan array kosong di render pertama.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage penuh / mode privat — abaikan, keranjang tetap jalan di memori */
    }
  }, [items, hydrated]);

  const clampQty = (qty: number, maxStock?: number) => {
    const n = Math.max(1, Math.floor(qty));
    if (maxStock != null && maxStock > 0) return Math.min(n, maxStock);
    return n;
  };

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug
            ? {
                ...i,
                ...item,
                quantity: clampQty(i.quantity + qty, item.maxStock),
              }
            : i,
        );
      }
      return [...prev, { ...item, quantity: clampQty(qty, item.maxStock) }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.slug === slug ? { ...i, quantity: clampQty(qty, i.maxStock) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal, totalWeightGrams } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.quantity;
        acc.subtotal += i.price * i.quantity;
        acc.totalWeightGrams += (i.weightGrams || 0) * i.quantity;
        return acc;
      },
      { count: 0, subtotal: 0, totalWeightGrams: 0 },
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    totalWeightGrams,
    add,
    setQuantity,
    remove,
    clear,
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>.");
  return ctx;
}
