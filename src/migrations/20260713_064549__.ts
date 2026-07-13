import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "page_home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_cta_url" varchar DEFAULT '/tentang',
  	"brand_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_home_locales" (
  	"category_eyebrow" varchar DEFAULT 'Pilih Kategori',
  	"category_headline" varchar DEFAULT 'Mulai dari yang Anda butuhkan',
  	"journal_eyebrow" varchar DEFAULT 'Dari Journal',
  	"journal_headline" varchar DEFAULT 'Cerita & panduan terbaru',
  	"brand_eyebrow" varchar DEFAULT 'Tentang Noblekase',
  	"brand_headline" varchar DEFAULT 'Bukan sekadar aksesoris',
  	"brand_body" varchar DEFAULT 'Kami percaya bahwa setiap orang berhak atas aksesoris yang berkualitas dan terdesain baik—tanpa harus mengeluarkan biaya berlebihan.',
  	"brand_cta_label" varchar DEFAULT 'Selengkapnya',
  	"see_all_label" varchar DEFAULT 'Lihat semua →',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_products_locales" (
  	"eyebrow" varchar DEFAULT 'Koleksi',
  	"headline" varchar DEFAULT 'Semua produk Noblekase',
  	"intro" varchar DEFAULT 'Empat kategori yang menemani hari-hari Anda. Harga ada di marketplace pilihan — kami menjaga koleksi & konsistensi kualitas.',
  	"count_template" varchar DEFAULT 'Menampilkan {count} produk',
  	"sort_label" varchar DEFAULT 'Urutkan: Default',
  	"see_all_label" varchar DEFAULT 'Lihat semua →',
  	"filter_category_title" varchar DEFAULT 'Kategori',
  	"filter_all_label" varchar DEFAULT 'Semua produk',
  	"filter_marketplace_title" varchar DEFAULT 'Marketplace',
  	"filter_disclaimer" varchar DEFAULT 'Harga ditampilkan di setiap marketplace. Kami menyatukan koleksi — marketplace yang memutuskan promo & ongkos kirim.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_journal" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_journal_locales" (
  	"eyebrow" varchar DEFAULT 'Journal',
  	"headline" varchar DEFAULT 'Cerita & panduan dari Noblekase',
  	"intro" varchar DEFAULT 'Mengupas pelan-pelan: cara memilih charger yang pas, alasan kami memilih kertas FSC, dan cerita di balik setiap edisi.',
  	"highlight_label" varchar DEFAULT 'Sorotan',
  	"read_more_label" varchar DEFAULT 'Baca selengkapnya →',
  	"all_articles_eyebrow" varchar DEFAULT 'Semua Artikel',
  	"count_template" varchar DEFAULT '{count} cerita',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_product_detail" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_product_detail_locales" (
  	"breadcrumb_home" varchar DEFAULT 'Beranda',
  	"breadcrumb_products" varchar DEFAULT 'Produk',
  	"marketplace_section_label" varchar DEFAULT 'Beli di marketplace pilihan',
  	"badge_best_price" varchar DEFAULT 'Harga terbaik',
  	"badge_fast_ship" varchar DEFAULT 'Pengiriman cepat',
  	"badge_new" varchar DEFAULT 'Baru rilis',
  	"whatsapp_cta_label" varchar DEFAULT 'Tanya via WhatsApp →',
  	"story_label" varchar DEFAULT 'Cerita Produk',
  	"specs_label" varchar DEFAULT 'Spesifikasi',
  	"lifestyle_eyebrow" varchar DEFAULT 'Dalam Keseharian',
  	"lifestyle_heading_suffix" varchar DEFAULT ' di hari-hari biasa',
  	"related_eyebrow" varchar DEFAULT 'Mungkin juga cocok',
  	"related_headline" varchar DEFAULT 'Produk lain yang sering dipasangkan',
  	"sticky_cta_template" varchar DEFAULT 'Beli {product}',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_article_detail" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_article_detail_locales" (
  	"breadcrumb_home" varchar DEFAULT 'Beranda',
  	"breadcrumb_journal" varchar DEFAULT 'Journal',
  	"share_label" varchar DEFAULT 'Bagikan:',
  	"back_label" varchar DEFAULT '← Kembali ke Journal',
  	"related_eyebrow" varchar DEFAULT 'Artikel terkait',
  	"related_headline_template" varchar DEFAULT 'Cerita lain dari {category}',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_support_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "page_support_channels_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_support" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_support_locales" (
  	"hero_eyebrow" varchar DEFAULT 'Dukungan',
  	"hero_headline" varchar DEFAULT 'Bantu kami menjawab Anda',
  	"hero_intro" varchar DEFAULT 'Tim kecil yang membaca semua pesan. Cara tercepat lewat WhatsApp di jam kerja, atau DM Instagram kapan saja.',
  	"channels_eyebrow" varchar DEFAULT 'Kanal',
  	"channels_headline" varchar DEFAULT 'Pilih cara yang paling nyaman',
  	"operating_hours" varchar DEFAULT 'Jam operasional: Senin–Jumat 09.00–17.00 WIB · Sabtu 10.00–14.00',
  	"faq_eyebrow" varchar DEFAULT 'FAQ',
  	"faq_headline" varchar DEFAULT 'Pertanyaan yang sering ditanyakan',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "media_sizes_featured_sizes_featured_filename_idx";
  DROP INDEX "media_sizes_hero_sizes_hero_filename_idx";
  ALTER TABLE "media" ADD COLUMN "sizes_square_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_landscape_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_landscape_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_landscape_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_landscape_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_landscape_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_landscape_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_portrait_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_portrait_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_portrait_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_portrait_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_portrait_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_portrait_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_wide_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_wide_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_wide_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_wide_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_wide_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_wide_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filename" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "chatbot_title" varchar DEFAULT 'AI Assistant Noblekase';
  ALTER TABLE "site_settings_locales" ADD COLUMN "chatbot_status_text" varchar DEFAULT 'Online · 24/7';
  ALTER TABLE "site_settings_locales" ADD COLUMN "chatbot_input_placeholder" varchar DEFAULT 'Ketik pertanyaan...';
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_home" ADD CONSTRAINT "page_home_brand_image_id_media_id_fk" FOREIGN KEY ("brand_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_home_locales" ADD CONSTRAINT "page_home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_products" ADD CONSTRAINT "page_products_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_products_locales" ADD CONSTRAINT "page_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_journal_locales" ADD CONSTRAINT "page_journal_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_product_detail_locales" ADD CONSTRAINT "page_product_detail_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_product_detail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_article_detail_locales" ADD CONSTRAINT "page_article_detail_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_article_detail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_support_channels" ADD CONSTRAINT "page_support_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_support"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_support_channels_locales" ADD CONSTRAINT "page_support_channels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_support_channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_support" ADD CONSTRAINT "page_support_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_support_locales" ADD CONSTRAINT "page_support_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_support"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "page_home_brand_image_idx" ON "page_home" USING btree ("brand_image_id");
  CREATE UNIQUE INDEX "page_home_locales_locale_parent_id_unique" ON "page_home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_products_banner_image_idx" ON "page_products" USING btree ("banner_image_id");
  CREATE UNIQUE INDEX "page_products_locales_locale_parent_id_unique" ON "page_products_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_journal_locales_locale_parent_id_unique" ON "page_journal_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_product_detail_locales_locale_parent_id_unique" ON "page_product_detail_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_article_detail_locales_locale_parent_id_unique" ON "page_article_detail_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_support_channels_order_idx" ON "page_support_channels" USING btree ("_order");
  CREATE INDEX "page_support_channels_parent_id_idx" ON "page_support_channels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "page_support_channels_locales_locale_parent_id_unique" ON "page_support_channels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_support_hero_image_idx" ON "page_support" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "page_support_locales_locale_parent_id_unique" ON "page_support_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_landscape_sizes_landscape_filename_idx" ON "media" USING btree ("sizes_landscape_filename");
  CREATE INDEX "media_sizes_portrait_sizes_portrait_filename_idx" ON "media" USING btree ("sizes_portrait_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_banner_sizes_banner_filename_idx" ON "media" USING btree ("sizes_banner_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  ALTER TABLE "media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_url";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_width";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_height";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_home_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_products_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_journal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_journal_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_product_detail" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_product_detail_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_article_detail" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_article_detail_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_support_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_support_channels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_support" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_support_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "page_home" CASCADE;
  DROP TABLE "page_home_locales" CASCADE;
  DROP TABLE "page_products" CASCADE;
  DROP TABLE "page_products_locales" CASCADE;
  DROP TABLE "page_journal" CASCADE;
  DROP TABLE "page_journal_locales" CASCADE;
  DROP TABLE "page_product_detail" CASCADE;
  DROP TABLE "page_product_detail_locales" CASCADE;
  DROP TABLE "page_article_detail" CASCADE;
  DROP TABLE "page_article_detail_locales" CASCADE;
  DROP TABLE "page_support_channels" CASCADE;
  DROP TABLE "page_support_channels_locales" CASCADE;
  DROP TABLE "page_support" CASCADE;
  DROP TABLE "page_support_locales" CASCADE;
  DROP INDEX "media_sizes_square_sizes_square_filename_idx";
  DROP INDEX "media_sizes_landscape_sizes_landscape_filename_idx";
  DROP INDEX "media_sizes_portrait_sizes_portrait_filename_idx";
  DROP INDEX "media_sizes_wide_sizes_wide_filename_idx";
  DROP INDEX "media_sizes_banner_sizes_banner_filename_idx";
  DROP INDEX "media_sizes_og_sizes_og_filename_idx";
  ALTER TABLE "media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_featured_sizes_featured_filename_idx" ON "media" USING btree ("sizes_featured_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  ALTER TABLE "media" DROP COLUMN "sizes_square_url";
  ALTER TABLE "media" DROP COLUMN "sizes_square_width";
  ALTER TABLE "media" DROP COLUMN "sizes_square_height";
  ALTER TABLE "media" DROP COLUMN "sizes_square_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_landscape_url";
  ALTER TABLE "media" DROP COLUMN "sizes_landscape_width";
  ALTER TABLE "media" DROP COLUMN "sizes_landscape_height";
  ALTER TABLE "media" DROP COLUMN "sizes_landscape_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_landscape_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_landscape_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_portrait_url";
  ALTER TABLE "media" DROP COLUMN "sizes_portrait_width";
  ALTER TABLE "media" DROP COLUMN "sizes_portrait_height";
  ALTER TABLE "media" DROP COLUMN "sizes_portrait_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_portrait_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_portrait_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_wide_url";
  ALTER TABLE "media" DROP COLUMN "sizes_wide_width";
  ALTER TABLE "media" DROP COLUMN "sizes_wide_height";
  ALTER TABLE "media" DROP COLUMN "sizes_wide_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_wide_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_wide_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_url";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_width";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_height";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_og_url";
  ALTER TABLE "media" DROP COLUMN "sizes_og_width";
  ALTER TABLE "media" DROP COLUMN "sizes_og_height";
  ALTER TABLE "media" DROP COLUMN "sizes_og_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filename";
  ALTER TABLE "site_settings_locales" DROP COLUMN "chatbot_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "chatbot_status_text";
  ALTER TABLE "site_settings_locales" DROP COLUMN "chatbot_input_placeholder";`)
}
