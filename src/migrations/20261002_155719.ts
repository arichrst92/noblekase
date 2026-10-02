import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_slot" AS ENUM('product-main', 'product-gallery', 'lifestyle', 'category', 'hero', 'article', 'banner', 'og', 'brand');
  CREATE TYPE "public"."enum_slides_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_slides_text_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_slides_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'expired', 'failed', 'refunded');
  CREATE TYPE "public"."enum_orders_fulfillment_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_footer_columns_links_icon" AS ENUM('', 'instagram', 'facebook', 'tiktok', 'youtube', 'twitter', 'whatsapp', 'store', 'external');
  CREATE TABLE "slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"image_mobile_id" integer,
  	"text_align" "enum_slides_text_align" DEFAULT 'center',
  	"text_theme" "enum_slides_text_theme" DEFAULT 'light',
  	"scrim" boolean DEFAULT true,
  	"cta_url" varchar DEFAULT '/produk',
  	"order" numeric DEFAULT 0,
  	"status" "enum_slides_status" DEFAULT 'published' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "slides_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"name_snapshot" varchar NOT NULL,
  	"sku_snapshot" varchar,
  	"unit_price" numeric NOT NULL,
  	"quantity" numeric NOT NULL,
  	"weight_grams" numeric NOT NULL,
  	"line_total" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL,
  	"fulfillment_status" "enum_orders_fulfillment_status" DEFAULT 'pending' NOT NULL,
  	"customer_id" integer,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"shipping_address_recipient_name" varchar NOT NULL,
  	"shipping_address_phone" varchar NOT NULL,
  	"shipping_address_address_line" varchar NOT NULL,
  	"shipping_address_province" varchar NOT NULL,
  	"shipping_address_city" varchar NOT NULL,
  	"shipping_address_district" varchar,
  	"shipping_address_postal_code" varchar NOT NULL,
  	"shipping_address_biteship_area_id" varchar,
  	"shipping_address_notes" varchar,
  	"subtotal" numeric NOT NULL,
  	"shipping_courier_company" varchar,
  	"shipping_courier_type" varchar,
  	"shipping_courier_name" varchar,
  	"shipping_cost" numeric DEFAULT 0,
  	"shipping_eta_text" varchar,
  	"shipping_total_weight_grams" numeric,
  	"shipping_biteship_order_id" varchar,
  	"shipping_waybill_id" varchar,
  	"shipping_tracking_status" varchar,
  	"total" numeric NOT NULL,
  	"payment_method" varchar,
  	"payment_xendit_invoice_id" varchar,
  	"payment_xendit_invoice_url" varchar,
  	"payment_paid_at" timestamp(3) with time zone,
  	"admin_notes" varchar,
  	"stock_released" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"recipient_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"address_line" varchar NOT NULL,
  	"province" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"district" varchar,
  	"postal_code" varchar NOT NULL,
  	"biteship_area_id" varchar,
  	"is_default" boolean DEFAULT false
  );
  
  CREATE TABLE "customers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "shipping_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"origin_contact_name" varchar,
  	"origin_contact_phone" varchar,
  	"origin_address" varchar,
  	"origin_postal_code" varchar,
  	"origin_area_id" varchar,
  	"couriers" varchar DEFAULT 'jne,jnt,sicepat,anteraja,pos,ninja',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "sub_categories" ALTER COLUMN "filter_config" SET DATA TYPE varchar;
  ALTER TABLE "site_settings" ALTER COLUMN "email" SET DEFAULT 'halo@noblekase.co.id';
  ALTER TABLE "integrations" ALTER COLUMN "email_from" SET DEFAULT 'noreply@noblekase.co.id';
  ALTER TABLE "integrations" ALTER COLUMN "email_reply_to" SET DEFAULT 'halo@noblekase.co.id';
  ALTER TABLE "header_mobile_bottom_nav_locales" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "slot" "enum_media_slot";
  ALTER TABLE "media" ADD COLUMN "ai_prompt" varchar;
  ALTER TABLE "products" ADD COLUMN "price" numeric;
  ALTER TABLE "products" ADD COLUMN "compare_at_price" numeric;
  ALTER TABLE "products" ADD COLUMN "stock" numeric DEFAULT 0;
  ALTER TABLE "products" ADD COLUMN "weight_grams" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "slides_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "integrations" ADD COLUMN "xendit_secret_key" varchar;
  ALTER TABLE "integrations" ADD COLUMN "xendit_webhook_token" varchar;
  ALTER TABLE "integrations" ADD COLUMN "biteship_api_key" varchar;
  ALTER TABLE "integrations" ADD COLUMN "biteship_webhook_secret" varchar;
  ALTER TABLE "footer_columns_links" ADD COLUMN "icon" "enum_footer_columns_links_icon";
  ALTER TABLE "page_home" ADD COLUMN "promo_cta_url" varchar DEFAULT '/produk';
  ALTER TABLE "page_home" ADD COLUMN "promo_image_id" integer;
  ALTER TABLE "page_home_locales" ADD COLUMN "products_eyebrow" varchar DEFAULT 'Koleksi';
  ALTER TABLE "page_home_locales" ADD COLUMN "products_headline" varchar DEFAULT 'Pilihan untuk hari-hari Anda';
  ALTER TABLE "page_home_locales" ADD COLUMN "tab_new_label" varchar DEFAULT 'Terbaru';
  ALTER TABLE "page_home_locales" ADD COLUMN "tab_best_label" varchar DEFAULT 'Terlaris';
  ALTER TABLE "page_home_locales" ADD COLUMN "tab_all_label" varchar DEFAULT 'Semua';
  ALTER TABLE "page_home_locales" ADD COLUMN "promo_eyebrow" varchar DEFAULT 'Edisi Berjalan';
  ALTER TABLE "page_home_locales" ADD COLUMN "promo_headline" varchar DEFAULT 'Perlengkapan harian, satu paket';
  ALTER TABLE "page_home_locales" ADD COLUMN "promo_cta_label" varchar DEFAULT 'Jelajahi koleksi';
  ALTER TABLE "slides" ADD CONSTRAINT "slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "slides" ADD CONSTRAINT "slides_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "slides_locales" ADD CONSTRAINT "slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customers_addresses" ADD CONSTRAINT "customers_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_sessions" ADD CONSTRAINT "customers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "slides_image_idx" ON "slides" USING btree ("image_id");
  CREATE INDEX "slides_image_mobile_idx" ON "slides" USING btree ("image_mobile_id");
  CREATE INDEX "slides_updated_at_idx" ON "slides" USING btree ("updated_at");
  CREATE INDEX "slides_created_at_idx" ON "slides" USING btree ("created_at");
  CREATE UNIQUE INDEX "slides_locales_locale_parent_id_unique" ON "slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "customers_addresses_order_idx" ON "customers_addresses" USING btree ("_order");
  CREATE INDEX "customers_addresses_parent_id_idx" ON "customers_addresses" USING btree ("_parent_id");
  CREATE INDEX "customers_sessions_order_idx" ON "customers_sessions" USING btree ("_order");
  CREATE INDEX "customers_sessions_parent_id_idx" ON "customers_sessions" USING btree ("_parent_id");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_slides_fk" FOREIGN KEY ("slides_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_home" ADD CONSTRAINT "page_home_promo_image_id_media_id_fk" FOREIGN KEY ("promo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("slides_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_preferences_rels_customers_id_idx" ON "payload_preferences_rels" USING btree ("customers_id");
  CREATE INDEX "page_home_promo_image_idx" ON "page_home" USING btree ("promo_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "slides_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers_addresses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shipping_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "slides" CASCADE;
  DROP TABLE "slides_locales" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "customers_addresses" CASCADE;
  DROP TABLE "customers_sessions" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "shipping_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_slides_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customers_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_customers_fk";
  
  ALTER TABLE "page_home" DROP CONSTRAINT "page_home_promo_image_id_media_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_slides_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_customers_id_idx";
  DROP INDEX "payload_preferences_rels_customers_id_idx";
  DROP INDEX "page_home_promo_image_idx";
  ALTER TABLE "sub_categories" ALTER COLUMN "filter_config" SET DATA TYPE jsonb;
  ALTER TABLE "site_settings" ALTER COLUMN "email" SET DEFAULT 'halo@noblekase.com';
  ALTER TABLE "integrations" ALTER COLUMN "email_from" SET DEFAULT 'noreply@noblekase.com';
  ALTER TABLE "integrations" ALTER COLUMN "email_reply_to" SET DEFAULT 'halo@noblekase.com';
  ALTER TABLE "header_mobile_bottom_nav_locales" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "media" DROP COLUMN "slot";
  ALTER TABLE "media" DROP COLUMN "ai_prompt";
  ALTER TABLE "products" DROP COLUMN "price";
  ALTER TABLE "products" DROP COLUMN "compare_at_price";
  ALTER TABLE "products" DROP COLUMN "stock";
  ALTER TABLE "products" DROP COLUMN "weight_grams";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "slides_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customers_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "customers_id";
  ALTER TABLE "integrations" DROP COLUMN "xendit_secret_key";
  ALTER TABLE "integrations" DROP COLUMN "xendit_webhook_token";
  ALTER TABLE "integrations" DROP COLUMN "biteship_api_key";
  ALTER TABLE "integrations" DROP COLUMN "biteship_webhook_secret";
  ALTER TABLE "footer_columns_links" DROP COLUMN "icon";
  ALTER TABLE "page_home" DROP COLUMN "promo_cta_url";
  ALTER TABLE "page_home" DROP COLUMN "promo_image_id";
  ALTER TABLE "page_home_locales" DROP COLUMN "products_eyebrow";
  ALTER TABLE "page_home_locales" DROP COLUMN "products_headline";
  ALTER TABLE "page_home_locales" DROP COLUMN "tab_new_label";
  ALTER TABLE "page_home_locales" DROP COLUMN "tab_best_label";
  ALTER TABLE "page_home_locales" DROP COLUMN "tab_all_label";
  ALTER TABLE "page_home_locales" DROP COLUMN "promo_eyebrow";
  ALTER TABLE "page_home_locales" DROP COLUMN "promo_headline";
  ALTER TABLE "page_home_locales" DROP COLUMN "promo_cta_label";
  DROP TYPE "public"."enum_media_slot";
  DROP TYPE "public"."enum_slides_text_align";
  DROP TYPE "public"."enum_slides_text_theme";
  DROP TYPE "public"."enum_slides_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_fulfillment_status";
  DROP TYPE "public"."enum_footer_columns_links_icon";`)
}
