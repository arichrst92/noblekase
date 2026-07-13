import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "integrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"groq_api_key" varchar,
  	"groq_model_chatbot" varchar DEFAULT 'llama-3.1-8b-instant',
  	"groq_model_blog" varchar DEFAULT 'llama-3.3-70b-versatile',
  	"groq_model_market_intel" varchar DEFAULT 'llama-3.3-70b-versatile',
  	"resend_api_key" varchar,
  	"email_from" varchar DEFAULT 'noreply@noblekase.com',
  	"email_reply_to" varchar DEFAULT 'halo@noblekase.com',
  	"ga_measurement_id" varchar,
  	"search_console_property" varchar,
  	"indexing_service_account_json" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "integrations" CASCADE;`)
}
