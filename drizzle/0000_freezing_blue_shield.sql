CREATE TABLE "academic_years" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"start_date" text,
	"end_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"target" text DEFAULT 'all' NOT NULL,
	"channel" text DEFAULT 'dashboard' NOT NULL,
	"scheduled_at" text DEFAULT '' NOT NULL,
	"sent_at" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by_id" integer,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"classroom_id" integer,
	"date" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'hadir' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text DEFAULT '' NOT NULL,
	"model_type" text DEFAULT '' NOT NULL,
	"model_id" text DEFAULT '' NOT NULL,
	"old_values" text DEFAULT '' NOT NULL,
	"new_values" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date_start" text DEFAULT '' NOT NULL,
	"date_end" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'kegiatan' NOT NULL,
	"color" text DEFAULT '#3b82f6' NOT NULL,
	"academic_year_id" integer,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "class_teacher_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"classroom_id" integer,
	"semester" text DEFAULT 'ganjil' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"input_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"academic_year_id" integer,
	"wali_kelas_id" integer,
	"infaq_nominal" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coop_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"items" text DEFAULT '[]' NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"payment_method" text DEFAULT 'tunai' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counseling_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"counselor_id" integer,
	"date" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'akademik' NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"follow_up" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculums" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'KURMER' NOT NULL,
	"academic_year_id" integer,
	"semester" text DEFAULT 'ganjil' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"date" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'hadir' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_salaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"component_id" integer,
	"amount" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nip" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'guru' NOT NULL,
	"position" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"join_date" text DEFAULT '' NOT NULL,
	"base_salary" double precision DEFAULT 0 NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" integer,
	CONSTRAINT "employees_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "extracurricular_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"extracurricular_id" integer,
	"student_id" integer,
	"join_date" text DEFAULT '' NOT NULL,
	"score" double precision DEFAULT 0 NOT NULL,
	"predicate" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extracurriculars" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"employee_id" integer,
	"schedule" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "final_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"curriculum_id" integer,
	"student_id" integer,
	"subject_id" integer,
	"classroom_id" integer,
	"nilai_pengetahuan" double precision DEFAULT 0 NOT NULL,
	"nilai_keterampilan" double precision DEFAULT 0 NOT NULL,
	"nilai_akhir" double precision DEFAULT 0 NOT NULL,
	"predikat" text DEFAULT '' NOT NULL,
	"deskripsi" text DEFAULT '' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "general_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_category_id" integer,
	"cash_account_id" integer,
	"user_id" integer,
	"type" text DEFAULT 'in' NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"transaction_date" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'valid' NOT NULL,
	"reference_type" text DEFAULT '' NOT NULL,
	"reference_id" text DEFAULT '' NOT NULL,
	"wakaf_donor_id" integer,
	"wakaf_purpose_id" integer,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "grade_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"curriculum_id" integer,
	"name" text NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'pengetahuan' NOT NULL,
	"format_nilai" text DEFAULT 'angka' NOT NULL,
	"bobot" double precision DEFAULT 0 NOT NULL,
	"urutan" integer DEFAULT 1 NOT NULL,
	"is_wajib" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade_formulas" (
	"id" serial PRIMARY KEY NOT NULL,
	"curriculum_id" integer,
	"jenis" text DEFAULT 'pengetahuan' NOT NULL,
	"formula" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "infaq_bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"academic_year_id" integer,
	"month" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"nominal" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'belum_lunas' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "infaq_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer,
	"cash_account_id" integer,
	"payment_method" text DEFAULT 'tunai' NOT NULL,
	"amount_paid" double precision DEFAULT 0 NOT NULL,
	"payment_date" text DEFAULT '' NOT NULL,
	"receiver_id" integer,
	"notes" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"condition" text DEFAULT 'baik' NOT NULL,
	"acquisition_date" text DEFAULT '' NOT NULL,
	"acquisition_cost" double precision DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventory_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer,
	"type" text DEFAULT '' NOT NULL,
	"quantity_change" integer DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"logged_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "kkms" (
	"id" serial PRIMARY KEY NOT NULL,
	"curriculum_id" integer,
	"subject_id" integer,
	"nilai_kkm" double precision DEFAULT 75 NOT NULL,
	"deskripsi_kktp" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letters" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'masuk' NOT NULL,
	"number" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"sender" text DEFAULT '' NOT NULL,
	"receiver" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'belum_disposisi' NOT NULL,
	"file_url" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"position" text DEFAULT '' NOT NULL,
	"start_date" text DEFAULT '' NOT NULL,
	"end_date" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_id" integer,
	"component_id" integer,
	"component_name" text DEFAULT '' NOT NULL,
	"type" text DEFAULT '' NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payrolls" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"month" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"base_salary" double precision DEFAULT 0 NOT NULL,
	"total_allowance" double precision DEFAULT 0 NOT NULL,
	"total_deduction" double precision DEFAULT 0 NOT NULL,
	"net_salary" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"paid_at" text,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ppdb_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_no" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"gender" text DEFAULT 'L' NOT NULL,
	"birth_place" text DEFAULT '' NOT NULL,
	"birth_date" text DEFAULT '' NOT NULL,
	"nik" text DEFAULT '' NOT NULL,
	"no_kk" text DEFAULT '' NOT NULL,
	"nisn" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"previous_school" text DEFAULT '' NOT NULL,
	"target_classroom" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"registration_source" text DEFAULT 'offline' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"family_status" text DEFAULT '' NOT NULL,
	"sibling_count" integer,
	"child_position" integer,
	"religion" text DEFAULT 'Islam' NOT NULL,
	"village" text DEFAULT '' NOT NULL,
	"district" text DEFAULT '' NOT NULL,
	"residence_type" text DEFAULT '' NOT NULL,
	"transportation" text DEFAULT '' NOT NULL,
	"student_phone" text DEFAULT '' NOT NULL,
	"height" integer,
	"weight" integer,
	"distance_to_school" text DEFAULT '' NOT NULL,
	"travel_time" integer,
	"father_name" text DEFAULT '' NOT NULL,
	"father_birth_place" text DEFAULT '' NOT NULL,
	"father_birth_date" text DEFAULT '' NOT NULL,
	"father_nik" text DEFAULT '' NOT NULL,
	"father_education" text DEFAULT '' NOT NULL,
	"father_occupation" text DEFAULT '' NOT NULL,
	"mother_name" text DEFAULT '' NOT NULL,
	"mother_birth_place" text DEFAULT '' NOT NULL,
	"mother_birth_date" text DEFAULT '' NOT NULL,
	"mother_nik" text DEFAULT '' NOT NULL,
	"mother_education" text DEFAULT '' NOT NULL,
	"mother_occupation" text DEFAULT '' NOT NULL,
	"parent_income" text DEFAULT '' NOT NULL,
	"guardian_name" text DEFAULT '' NOT NULL,
	"guardian_birth_place" text DEFAULT '' NOT NULL,
	"guardian_birth_date" text DEFAULT '' NOT NULL,
	"guardian_nik" text DEFAULT '' NOT NULL,
	"guardian_education" text DEFAULT '' NOT NULL,
	"guardian_occupation" text DEFAULT '' NOT NULL,
	"guardian_address" text DEFAULT '' NOT NULL,
	"guardian_phone" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"harga_jual" double precision DEFAULT 0 NOT NULL,
	"harga_beli" double precision DEFAULT 0 NOT NULL,
	"stok" integer DEFAULT 0 NOT NULL,
	"min_stok" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "re_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"academic_year_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"registration_source" text DEFAULT 'offline' NOT NULL,
	"confirmed_at" text,
	"notes" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "registration_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payable_type" text DEFAULT '' NOT NULL,
	"payable_id" integer,
	"payment_type" text DEFAULT '' NOT NULL,
	"nominal" double precision DEFAULT 0 NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"paid_at" text,
	"notes" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "report_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"classroom_id" integer,
	"curriculum_id" integer,
	"semester" text DEFAULT 'ganjil' NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"pdf_url" text DEFAULT '' NOT NULL,
	"ranking" text,
	"total_siswa" integer,
	"catatan_wali" text,
	"attendance_atititude" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'earning' NOT NULL,
	"default_amount" double precision DEFAULT 0 NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"classroom_id" integer,
	"subject_id" integer,
	"employee_id" integer,
	"academic_year_id" integer,
	"day" text DEFAULT 'Senin' NOT NULL,
	"start_time" text DEFAULT '' NOT NULL,
	"end_time" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"transaction_id" integer,
	"amount" double precision DEFAULT 0 NOT NULL,
	"paid_amount" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'belum_lunas' NOT NULL,
	"due_date" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"classroom_id" integer,
	"academic_year_id" integer,
	"enrollment_type" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "student_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" integer,
	"student_id" integer,
	"subject_id" integer,
	"classroom_id" integer,
	"nilai_angka" double precision DEFAULT 0 NOT NULL,
	"predikat" text DEFAULT '' NOT NULL,
	"input_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_savings" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"type" text DEFAULT '' NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"balance_after" double precision DEFAULT 0 NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"nisn" text DEFAULT '' NOT NULL,
	"nis" text DEFAULT '' NOT NULL,
	"nik" text DEFAULT '' NOT NULL,
	"no_kk" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"gender" text DEFAULT 'L' NOT NULL,
	"category" text DEFAULT 'reguler' NOT NULL,
	"classroom_id" integer,
	"status" text DEFAULT 'aktif' NOT NULL,
	"entry_date" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"birth_place" text DEFAULT '' NOT NULL,
	"birth_date" text DEFAULT '' NOT NULL,
	"infaq_status" text DEFAULT 'reguler' NOT NULL,
	"infaq_nominal" double precision DEFAULT 0 NOT NULL,
	"family_status" text DEFAULT '' NOT NULL,
	"sibling_count" integer,
	"child_position" integer,
	"religion" text DEFAULT 'Islam' NOT NULL,
	"village" text DEFAULT '' NOT NULL,
	"district" text DEFAULT '' NOT NULL,
	"residence_type" text DEFAULT '' NOT NULL,
	"transportation" text DEFAULT '' NOT NULL,
	"student_phone" text DEFAULT '' NOT NULL,
	"height" integer,
	"weight" integer,
	"distance_to_school" text DEFAULT '' NOT NULL,
	"travel_time" integer,
	"father_name" text DEFAULT '' NOT NULL,
	"father_birth_place" text DEFAULT '' NOT NULL,
	"father_birth_date" text DEFAULT '' NOT NULL,
	"father_nik" text DEFAULT '' NOT NULL,
	"father_education" text DEFAULT '' NOT NULL,
	"father_occupation" text DEFAULT '' NOT NULL,
	"mother_name" text DEFAULT '' NOT NULL,
	"mother_birth_place" text DEFAULT '' NOT NULL,
	"mother_birth_date" text DEFAULT '' NOT NULL,
	"mother_nik" text DEFAULT '' NOT NULL,
	"mother_education" text DEFAULT '' NOT NULL,
	"mother_occupation" text DEFAULT '' NOT NULL,
	"parent_income" text DEFAULT '' NOT NULL,
	"guardian_name" text DEFAULT '' NOT NULL,
	"guardian_birth_place" text DEFAULT '' NOT NULL,
	"guardian_birth_date" text DEFAULT '' NOT NULL,
	"guardian_nik" text DEFAULT '' NOT NULL,
	"guardian_education" text DEFAULT '' NOT NULL,
	"guardian_occupation" text DEFAULT '' NOT NULL,
	"guardian_address" text DEFAULT '' NOT NULL,
	"guardian_phone" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'wajib' NOT NULL,
	"tingkat_kelas" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teaching_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"subject_id" integer,
	"classroom_id" integer,
	"academic_year_id" integer,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transaction_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'in' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wakaf_donors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wakaf_purposes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"target_amount" double precision DEFAULT 0 NOT NULL,
	"collected_amount" double precision DEFAULT 0 NOT NULL,
	"unit_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "announcements_status_idx" ON "announcements" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_attendance" ON "attendances" USING btree ("student_id","date");--> statement-breakpoint
CREATE INDEX "attendances_classroom_date_idx" ON "attendances" USING btree ("classroom_id","date");--> statement-breakpoint
CREATE INDEX "calendar_events_date_start_idx" ON "calendar_events" USING btree ("date_start");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_teacher_note" ON "class_teacher_notes" USING btree ("student_id","classroom_id","semester");--> statement-breakpoint
CREATE INDEX "coop_transactions_date_idx" ON "coop_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "counseling_records_student_id_idx" ON "counseling_records" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "counseling_records_status_idx" ON "counseling_records" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_employee_attendance" ON "employee_attendances" USING btree ("employee_id","date");--> statement-breakpoint
CREATE INDEX "employees_type_deleted_idx" ON "employees" USING btree ("type","deleted_at");--> statement-breakpoint
CREATE INDEX "employees_status_idx" ON "employees" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_member" ON "extracurricular_members" USING btree ("extracurricular_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_final_grade" ON "final_grades" USING btree ("curriculum_id","student_id","subject_id");--> statement-breakpoint
CREATE INDEX "gen_tx_type_deleted_idx" ON "general_transactions" USING btree ("type","deleted_at");--> statement-breakpoint
CREATE INDEX "gen_tx_date_idx" ON "general_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "gen_tx_category_idx" ON "general_transactions" USING btree ("transaction_category_id");--> statement-breakpoint
CREATE INDEX "gen_tx_deleted_at_idx" ON "general_transactions" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bill_per_student_month" ON "infaq_bills" USING btree ("student_id","month","year","academic_year_id");--> statement-breakpoint
CREATE INDEX "infaq_bills_student_id_idx" ON "infaq_bills" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "infaq_bills_month_idx" ON "infaq_bills" USING btree ("month");--> statement-breakpoint
CREATE INDEX "infaq_bills_status_deleted_idx" ON "infaq_bills" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_kkm" ON "kkms" USING btree ("curriculum_id","subject_id");--> statement-breakpoint
CREATE INDEX "letters_type_idx" ON "letters" USING btree ("type");--> statement-breakpoint
CREATE INDEX "payrolls_employee_id_idx" ON "payrolls" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payrolls_month_year_idx" ON "payrolls" USING btree ("month","year");--> statement-breakpoint
CREATE INDEX "payrolls_deleted_at_idx" ON "payrolls" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ppdb_status_deleted_idx" ON "ppdb_registrations" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX "ppdb_deleted_at_idx" ON "ppdb_registrations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "reg_payments_payable_idx" ON "registration_payments" USING btree ("payable_type","payable_id");--> statement-breakpoint
CREATE INDEX "reg_payments_deleted_at_idx" ON "registration_payments" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_report_card" ON "report_cards" USING btree ("student_id","curriculum_id","semester");--> statement-breakpoint
CREATE INDEX "schedules_classroom_day_idx" ON "schedules" USING btree ("classroom_id","day");--> statement-breakpoint
CREATE INDEX "schedules_employee_day_idx" ON "schedules" USING btree ("employee_id","day");--> statement-breakpoint
CREATE INDEX "student_credits_student_id_status_idx" ON "student_credits" USING btree ("student_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_grade" ON "student_grades" USING btree ("component_id","student_id","subject_id");--> statement-breakpoint
CREATE INDEX "student_savings_student_id_idx" ON "student_savings" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_savings_status_deleted_idx" ON "student_savings" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX "student_savings_type_idx" ON "student_savings" USING btree ("type");--> statement-breakpoint
CREATE INDEX "students_classroom_id_idx" ON "students" USING btree ("classroom_id");--> statement-breakpoint
CREATE INDEX "students_deleted_at_idx" ON "students" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "students_status_idx" ON "students" USING btree ("status");--> statement-breakpoint
CREATE INDEX "students_nisn_idx" ON "students" USING btree ("nisn");--> statement-breakpoint
CREATE INDEX "subjects_type_idx" ON "subjects" USING btree ("type");--> statement-breakpoint
CREATE INDEX "subjects_status_deleted_idx" ON "subjects" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_teaching_assignment" ON "teaching_assignments" USING btree ("employee_id","subject_id","classroom_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "teaching_assignments_employee_id_idx" ON "teaching_assignments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "teaching_assignments_classroom_id_idx" ON "teaching_assignments" USING btree ("classroom_id");