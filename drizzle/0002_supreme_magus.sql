CREATE TABLE "web_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon_name" text DEFAULT 'BookOpen' NOT NULL,
	"color" text DEFAULT 'from-emerald-500 to-teal-600' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"suffix" text DEFAULT '+' NOT NULL,
	"icon_name" text DEFAULT 'Trophy' NOT NULL,
	"color" text DEFAULT 'from-amber-500 to-orange-600' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "coop_transactions" ADD COLUMN "status" text DEFAULT 'valid' NOT NULL;--> statement-breakpoint
ALTER TABLE "coop_transactions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "letters" ADD COLUMN "academic_year_id" integer;--> statement-breakpoint
ALTER TABLE "letters" ADD COLUMN "semester" text;--> statement-breakpoint
ALTER TABLE "letters" ADD COLUMN "month" text;--> statement-breakpoint
ALTER TABLE "student_credits" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "previous_school" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "coop_transactions_status_idx" ON "coop_transactions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_nip_unique_idx" ON "employees" USING btree ("nip");--> statement-breakpoint
CREATE UNIQUE INDEX "inventories_code_unique_idx" ON "inventories" USING btree ("code");--> statement-breakpoint
CREATE INDEX "letters_academic_year_idx" ON "letters" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "letters_semester_idx" ON "letters" USING btree ("semester");--> statement-breakpoint
CREATE INDEX "letters_month_idx" ON "letters" USING btree ("month");--> statement-breakpoint
CREATE UNIQUE INDEX "letters_number_unique_idx" ON "letters" USING btree ("number");--> statement-breakpoint
CREATE UNIQUE INDEX "students_nisn_unique_idx" ON "students" USING btree ("nisn");--> statement-breakpoint
CREATE UNIQUE INDEX "students_nis_unique_idx" ON "students" USING btree ("nis");--> statement-breakpoint
CREATE UNIQUE INDEX "students_nik_unique_idx" ON "students" USING btree ("nik");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_code_unique_idx" ON "subjects" USING btree ("code");