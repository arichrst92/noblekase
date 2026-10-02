/**
 * stock.ts — reservasi & pelepasan stok (Sprint 9, revisi audit).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * SERVER-ONLY.
 *
 * Model: stok di-RESERVE saat checkout (order dibuat), bukan saat pembayaran.
 * Ini mencegah oversell — dua pembeli tidak bisa sama-sama mengambil unit
 * terakhir, karena pengurangan dilakukan atomik dengan syarat `stock >= qty`
 * sebelum invoice dibuat.
 *
 * Siklus stok sebuah order:
 *   - checkout            → reserveStock() mengurangi stok
 *   - pembayaran lunas    → TIDAK ada aksi stok (stok memang sudah terjual)
 *   - expired/failed      → releaseStock() mengembalikan stok
 *   - refund/cancel       → releaseStock() mengembalikan stok
 *
 * `releaseStock` idempoten lewat flag `stockReleased` yang di-klaim atomik,
 * jadi callback/hook ganda tidak mengembalikan stok dua kali.
 */

import type { getPayloadClient } from "@/lib/payload";

type Payload = Awaited<ReturnType<typeof getPayloadClient>>;

interface OrderItemLike {
  product?: number | string | { id: number | string } | null;
  quantity?: number;
  nameSnapshot?: string;
}

function productIdOf(it: OrderItemLike): number | string | null {
  const p = it.product;
  if (p == null) return null;
  if (typeof p === "object") return (p as { id: number | string }).id ?? null;
  return p;
}

function getPool(payload: Payload) {
  return (
    payload.db as unknown as {
      pool?: {
        query: (q: string, v: unknown[]) => Promise<{ rowCount: number }>;
      };
    }
  ).pool;
}

export interface ReserveResult {
  ok: boolean;
  /** Nama item yang stoknya tidak cukup (bila ok=false). */
  insufficient?: string;
}

/**
 * Kurangi (reserve) stok untuk semua item secara atomik. Bila salah satu tidak
 * cukup, SEMUA pengurangan yang terlanjur dikembalikan lagi agar tidak ada stok
 * yang "tersangkut" tanpa order. Aman dari race: syarat `stock >= qty` membuat
 * hanya satu pembeli menang atas unit terakhir.
 */
export async function reserveStock(
  payload: Payload,
  items: OrderItemLike[],
): Promise<ReserveResult> {
  const pool = getPool(payload);
  const done: { id: number | string; qty: number }[] = [];

  const rollback = async () => {
    for (const d of done) {
      if (pool) {
        await pool
          .query("UPDATE products SET stock = stock + $1 WHERE id = $2", [
            d.qty,
            d.id,
          ])
          .catch(() => {});
      } else {
        await restoreOne(payload, d.id, d.qty).catch(() => {});
      }
    }
  };

  for (const it of items) {
    const id = productIdOf(it);
    const qty = it.quantity ?? 0;
    if (id == null || qty <= 0) continue;

    if (pool) {
      try {
        const r = await pool.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1",
          [qty, id],
        );
        if (r.rowCount === 1) {
          done.push({ id, qty });
          continue;
        }
        await rollback();
        return { ok: false, insufficient: it.nameSnapshot };
      } catch {
        await rollback();
        return { ok: false, insufficient: it.nameSnapshot };
      }
    }

    // Fallback tanpa pool (celah race kecil; hanya bila adapter tak expose pool).
    try {
      const p: any = await payload.findByID({
        collection: "products",
        id: id as any,
        depth: 0,
      });
      const current = typeof p?.stock === "number" ? p.stock : 0;
      if (current < qty) {
        await rollback();
        return { ok: false, insufficient: it.nameSnapshot };
      }
      await payload.update({
        collection: "products",
        id: id as any,
        overrideAccess: true,
        data: { stock: current - qty },
      });
      done.push({ id, qty });
    } catch {
      await rollback();
      return { ok: false, insufficient: it.nameSnapshot };
    }
  }

  return { ok: true };
}

/**
 * Kembalikan stok untuk sekumpulan item TANPA flag order — dipakai saat
 * reservasi sudah terjadi tapi order gagal dibuat (belum ada order untuk
 * memasang flag). Best-effort.
 */
export async function restoreItems(payload: Payload, items: OrderItemLike[]) {
  const pool = getPool(payload);
  for (const it of items) {
    const id = productIdOf(it);
    const qty = it.quantity ?? 0;
    if (id == null || qty <= 0) continue;
    if (pool) {
      await pool
        .query("UPDATE products SET stock = stock + $1 WHERE id = $2", [
          qty,
          id,
        ])
        .catch(() => {});
    } else {
      await restoreOne(payload, id, qty).catch(() => {});
    }
  }
}

async function restoreOne(payload: Payload, id: number | string, qty: number) {
  const p: any = await payload.findByID({
    collection: "products",
    id: id as any,
    depth: 0,
  });
  const current = typeof p?.stock === "number" ? p.stock : 0;
  await payload.update({
    collection: "products",
    id: id as any,
    overrideAccess: true,
    data: { stock: current + qty },
  });
}

/**
 * Kembalikan stok sebuah order, SATU KALI saja. Flag `stockReleased` di-klaim
 * atomik; bila sudah pernah dilepas, fungsi berhenti tanpa menambah stok lagi.
 * Mengembalikan true bila callback INI yang melakukan pelepasan.
 */
export async function releaseStock(
  payload: Payload,
  order: any,
): Promise<boolean> {
  if (!order?.id) return false;
  const pool = getPool(payload);

  // Klaim atomik: hanya pemenang yang melepas.
  let claimed = false;
  if (pool) {
    try {
      const r = await pool.query(
        "UPDATE orders SET stock_released = true WHERE id = $1 AND (stock_released IS NULL OR stock_released = false)",
        [order.id],
      );
      claimed = r.rowCount === 1;
    } catch {
      claimed = false;
    }
  }
  if (!pool) {
    // Fallback non-atomik.
    if (order.stockReleased) return false;
    await payload
      .update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        // cast: field stockReleased baru; tipe generated menyusul saat dev boot.
        data: { stockReleased: true } as unknown as Record<string, unknown>,
      })
      .catch(() => {});
    claimed = true;
  }
  if (!claimed) return false;

  const items: OrderItemLike[] = order.items ?? [];
  for (const it of items) {
    const id = productIdOf(it);
    const qty = it.quantity ?? 0;
    if (id == null || qty <= 0) continue;
    if (pool) {
      await pool
        .query("UPDATE products SET stock = stock + $1 WHERE id = $2", [
          qty,
          id,
        ])
        .catch(() => {});
    } else {
      await restoreOne(payload, id, qty).catch(() => {});
    }
  }
  return true;
}
