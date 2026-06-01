CREATE TABLE "web_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"student_name" text,
	"competition_name" text,
	"level" text DEFAULT 'kabupaten' NOT NULL,
	"year" integer NOT NULL,
	"image_url" text,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"icon_svg" text,
	"order" integer DEFAULT 0 NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_heroes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"media_type" text DEFAULT 'image' NOT NULL,
	"media_url" text NOT NULL,
	"cta_text" text,
	"cta_url" text,
	"order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"thumbnail_url" text,
	"category" text DEFAULT 'berita' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"meta_title" text,
	"meta_description" text,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "web_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "web_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"group" text DEFAULT 'umum' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "web_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "web_teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" text,
	"bio" text,
	"photo_url" text,
	"order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "academic_year_id" integer;--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "is_notified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "report_cards" ADD COLUMN "snapshot_data" jsonb;--> statement-breakpoint
ALTER TABLE "report_cards" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
CREATE INDEX "web_posts_slug_idx" ON "web_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "web_posts_status_idx" ON "web_posts" USING btree ("status");