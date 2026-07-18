# Noblekase — Checklist UAT & Go-Live

**Disusun oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

Dijalankan di **staging** lebih dulu, lalu diulang sebagai smoke test setelah
produksi live. Beri tanda ✅ / ❌ dan catat temuannya.

Ganti `SITE` di bawah dengan domain yang sedang diuji.

---

## 0. Prasyarat sebelum UAT

- [ ] `pnpm build` selesai tanpa error di mesin build
- [ ] Semua variabel di `.env` terisi nilai produksi (bukan placeholder)
- [ ] `NEXT_PUBLIC_SITE_URL` sudah domain asli — bukan `localhost`
- [ ] `PAYLOAD_SECRET` dan `POSTGRES_PASSWORD` diganti dari nilai contoh
- [ ] `pnpm seed` → `pnpm seed:content` → `pnpm seed:translations` sudah jalan
- [ ] Akun admin pertama dibuat, lalu `ADMIN_PASSWORD` dikosongkan dari `.env`

---

## 1. Halaman publik — Bahasa Indonesia

| Halaman | URL | Cek |
|---|---|---|
| Beranda | `SITE/` | Carousel jalan, gambar tidak pecah, teks terbaca |
| Produk | `SITE/produk` | Banner full-bleed, filter, urutan, jumlah produk benar |
| Kategori | `SITE/produk/charger-power` | Produk terfilter benar |
| Detail produk | `SITE/produk/detail/<slug>` | Galeri, spesifikasi, tautan marketplace |
| Journal | `SITE/journal` | Daftar artikel + sorotan |
| Artikel | `SITE/journal/<slug>` | Isi, tanggal, tombol share, artikel terkait |
| Tentang | `SITE/tentang` | Hero full-bleed + blok konten |
| Dukungan | `SITE/dukungan` | Kanal kontak + FAQ bisa dibuka |
| Pencarian | `SITE/cari?q=charger` | Hasil relevan, minimal 2 huruf |
| 404 | `SITE/halaman-ngawur` | Tampil ber-brand, bukan 404 bawaan Next |

- [ ] Semua tautan navbar & footer menuju halaman yang benar
- [ ] Tidak ada teks berbahasa Inggris nyasar

## 2. Halaman publik — Bahasa Inggris

- [ ] `SITE/en` terbuka dan navbar berbahasa Inggris
- [ ] Ulangi seluruh tabel di atas dengan awalan `/en`
- [ ] `SITE/en/halaman-ngawur` → 404 **berbahasa Inggris**, tombolnya tetap di `/en`
- [ ] Tautan di dalam isi artikel tetap berada di `/en`
- [ ] Tidak ada teks Indonesia nyasar di halaman EN

## 3. Perpindahan bahasa

- [ ] Tombol ID/EN berpindah tanpa keluar dari halaman yang sedang dibuka
- [ ] Filter & kata kunci pencarian tidak ter-reset saat ganti bahasa
- [ ] `SITE/id/produk` teralihkan ke `SITE/produk`
- [ ] Tombol bahasa terlihat dan berfungsi di tampilan mobile

## 4. Mobile

- [ ] Bottom nav muncul, ikon tengah tampil benar (bukan kotak polos)
- [ ] Overlay hero rata & cukup gelap; semua teks terbaca
- [ ] Tidak ada elemen yang terpotong atau menyebabkan scroll horizontal
- [ ] Gelembung chatbot tidak menutupi bottom nav

## 5. Pencarian & chatbot

- [ ] Overlay pencarian di navbar memberi saran saat mengetik
- [ ] "Lihat semua hasil" menuju `/cari` dengan bahasa yang benar
- [ ] Chatbot membalas dan jawabannya mengalir bertahap (streaming)
- [ ] Chatbot menjawab dalam Bahasa Inggris saat dibuka dari `/en`
- [ ] Chatbot menolak mengarang harga dan mengarahkan ke marketplace
- [ ] Rate limit bekerja — kirim >20 pesan cepat, muncul pesan sopan

## 6. Panel admin

- [ ] Login berhasil, tidak ada layar blank atau redirect berulang
- [ ] Logo Noblekase & favicon tampil benar
- [ ] Ikon menu sidebar tampil; kredit IDEA ada di bawah tombol logout
- [ ] Kredit IDEA juga tampil di halaman login
- [ ] Upload gambar baru berhasil, **Edit Image** & titik fokus jalan
- [ ] Menyimpan Header dan Footer TIDAK memunculkan error validasi
- [ ] Ganti bahasa field ke English, isi, simpan — versi Indonesia tetap utuh
- [ ] Perubahan konten langsung terlihat di situs (revalidate jalan)

## 7. SEO

- [ ] `SITE/sitemap.xml` terbuka dan memuat URL kedua bahasa
- [ ] `SITE/robots.txt` menunjuk ke sitemap yang benar
- [ ] Lihat source halaman: `<html lang>` sesuai bahasa
- [ ] Tag `hreflang` memuat `id`, `en`, dan `x-default`
- [ ] `canonical` menunjuk URL bahasa yang sedang dibuka
- [ ] Gambar OG muncul saat ditempel di WhatsApp / X
- [ ] Halaman `/cari` bertanda `noindex`
- [ ] Uji beberapa URL di Google Rich Results Test — structured data valid

## 8. Keamanan & operasional

- [ ] HTTPS aktif, HTTP teralihkan otomatis
- [ ] `SITE/api/health` mengembalikan status sehat termasuk koneksi database
- [ ] `/admin` tidak bisa diakses tanpa login
- [ ] Endpoint API tidak membocorkan daftar email pengguna
- [ ] Header keamanan terpasang (cek di securityheaders.com)
- [ ] `scripts/backup.sh` menghasilkan dump database **dan** arsip uploads
- [ ] Uji restore backup ke database kosong — datanya benar-benar kembali

## 9. Performa

- [ ] Lighthouse mobile: Performance ≥ 80, Accessibility ≥ 90, SEO ≥ 95
- [ ] Gambar hero tidak menyebabkan pergeseran layout (CLS)
- [ ] Halaman terbuka < 3 detik pada koneksi 4G

---

## Smoke test setelah go-live

Ulangi seperlunya, langsung di domain produksi:

1. [ ] Beranda ID & EN terbuka
2. [ ] Satu halaman detail produk & satu artikel terbuka
3. [ ] Pencarian mengembalikan hasil
4. [ ] Chatbot membalas
5. [ ] Login admin berhasil
6. [ ] Upload satu gambar uji, pastikan tampil di situs
7. [ ] `restart` container — pastikan gambar tadi **masih ada** (volume persisten)
8. [ ] Submit sitemap di Google Search Console

---

## Rollback

Bila ada temuan kritis setelah go-live:

```bash
# Kembali ke commit stabil sebelumnya
docker compose down
git checkout <commit-stabil-sebelumnya>
docker compose up -d --build
```

Bila database ikut bermasalah, restore manual dari dump terakhir.
`scripts/backup.sh` hanya membuat backup — tidak ada perintah restore di sana,
jadi langkahnya dijalankan langsung:

```bash
# 1. Dekripsi dulu bila backup dienkripsi GPG
gpg --decrypt db_YYYYMMDD_HHMMSS.dump.gpg > db.dump

# 2. Salin dump ke container Postgres
docker compose cp db.dump postgres:/tmp/db.dump

# 3. Restore. --clean menghapus objek lama lebih dulu; tanpa itu restore
#    gagal karena tabelnya sudah ada.
docker compose exec -T postgres pg_restore \
  -U noblekase -d noblekase --clean --if-exists /tmp/db.dump

# 4. Berkas gambar (hanya bila folder uploads ikut hilang)
tar -xzf uploads_YYYYMMDD_HHMMSS.tar.gz -C /opt/noblekase/
```

> Uji prosedur ini **sebelum** go-live, bukan saat sedang panik. Backup yang
> belum pernah dicoba di-restore belum bisa disebut backup.

Folder `uploads/` berupa bind mount ke host, jadi berkas gambar **tidak** ikut
hilang saat container dibangun ulang.

---

*Dokumen ini disusun oleh PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia)).*
