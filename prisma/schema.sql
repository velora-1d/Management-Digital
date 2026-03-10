-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" SERIAL NOT NULL,
    "year" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TEXT,
    "end_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "academic_year_id" INTEGER,
    "wali_kelas_id" INTEGER,
    "infaq_nominal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "nisn" TEXT NOT NULL DEFAULT '',
    "nis" TEXT NOT NULL DEFAULT '',
    "nik" TEXT NOT NULL DEFAULT '',
    "no_kk" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'L',
    "category" TEXT NOT NULL DEFAULT 'reguler',
    "classroom_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "entry_date" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "birth_place" TEXT NOT NULL DEFAULT '',
    "birth_date" TEXT NOT NULL DEFAULT '',
    "infaq_status" TEXT NOT NULL DEFAULT 'reguler',
    "infaq_nominal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "family_status" TEXT NOT NULL DEFAULT '',
    "sibling_count" INTEGER,
    "child_position" INTEGER,
    "religion" TEXT NOT NULL DEFAULT 'Islam',
    "village" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "residence_type" TEXT NOT NULL DEFAULT '',
    "transportation" TEXT NOT NULL DEFAULT '',
    "student_phone" TEXT NOT NULL DEFAULT '',
    "height" INTEGER,
    "weight" INTEGER,
    "distance_to_school" TEXT NOT NULL DEFAULT '',
    "travel_time" INTEGER,
    "father_name" TEXT NOT NULL DEFAULT '',
    "father_birth_place" TEXT NOT NULL DEFAULT '',
    "father_birth_date" TEXT NOT NULL DEFAULT '',
    "father_nik" TEXT NOT NULL DEFAULT '',
    "father_education" TEXT NOT NULL DEFAULT '',
    "father_occupation" TEXT NOT NULL DEFAULT '',
    "mother_name" TEXT NOT NULL DEFAULT '',
    "mother_birth_place" TEXT NOT NULL DEFAULT '',
    "mother_birth_date" TEXT NOT NULL DEFAULT '',
    "mother_nik" TEXT NOT NULL DEFAULT '',
    "mother_education" TEXT NOT NULL DEFAULT '',
    "mother_occupation" TEXT NOT NULL DEFAULT '',
    "parent_income" TEXT NOT NULL DEFAULT '',
    "guardian_name" TEXT NOT NULL DEFAULT '',
    "guardian_birth_place" TEXT NOT NULL DEFAULT '',
    "guardian_birth_date" TEXT NOT NULL DEFAULT '',
    "guardian_nik" TEXT NOT NULL DEFAULT '',
    "guardian_education" TEXT NOT NULL DEFAULT '',
    "guardian_occupation" TEXT NOT NULL DEFAULT '',
    "guardian_address" TEXT NOT NULL DEFAULT '',
    "guardian_phone" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppdb_registrations" (
    "id" SERIAL NOT NULL,
    "form_no" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'L',
    "birth_place" TEXT NOT NULL DEFAULT '',
    "birth_date" TEXT NOT NULL DEFAULT '',
    "nik" TEXT NOT NULL DEFAULT '',
    "no_kk" TEXT NOT NULL DEFAULT '',
    "nisn" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "previous_school" TEXT NOT NULL DEFAULT '',
    "target_classroom" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "registration_source" TEXT NOT NULL DEFAULT 'offline',
    "notes" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "family_status" TEXT NOT NULL DEFAULT '',
    "sibling_count" INTEGER,
    "child_position" INTEGER,
    "religion" TEXT NOT NULL DEFAULT 'Islam',
    "village" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "residence_type" TEXT NOT NULL DEFAULT '',
    "transportation" TEXT NOT NULL DEFAULT '',
    "student_phone" TEXT NOT NULL DEFAULT '',
    "height" INTEGER,
    "weight" INTEGER,
    "distance_to_school" TEXT NOT NULL DEFAULT '',
    "travel_time" INTEGER,
    "father_name" TEXT NOT NULL DEFAULT '',
    "father_birth_place" TEXT NOT NULL DEFAULT '',
    "father_birth_date" TEXT NOT NULL DEFAULT '',
    "father_nik" TEXT NOT NULL DEFAULT '',
    "father_education" TEXT NOT NULL DEFAULT '',
    "father_occupation" TEXT NOT NULL DEFAULT '',
    "mother_name" TEXT NOT NULL DEFAULT '',
    "mother_birth_place" TEXT NOT NULL DEFAULT '',
    "mother_birth_date" TEXT NOT NULL DEFAULT '',
    "mother_nik" TEXT NOT NULL DEFAULT '',
    "mother_education" TEXT NOT NULL DEFAULT '',
    "mother_occupation" TEXT NOT NULL DEFAULT '',
    "parent_income" TEXT NOT NULL DEFAULT '',
    "guardian_name" TEXT NOT NULL DEFAULT '',
    "guardian_birth_place" TEXT NOT NULL DEFAULT '',
    "guardian_birth_date" TEXT NOT NULL DEFAULT '',
    "guardian_nik" TEXT NOT NULL DEFAULT '',
    "guardian_education" TEXT NOT NULL DEFAULT '',
    "guardian_occupation" TEXT NOT NULL DEFAULT '',
    "guardian_address" TEXT NOT NULL DEFAULT '',
    "guardian_phone" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ppdb_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "re_registrations" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER,
    "academic_year_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "registration_source" TEXT NOT NULL DEFAULT 'offline',
    "confirmed_at" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "re_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_payments" (
    "id" SERIAL NOT NULL,
    "payable_type" TEXT NOT NULL DEFAULT '',
    "payable_id" INTEGER,
    "payment_type" TEXT NOT NULL DEFAULT '',
    "nominal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "registration_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'in',
    "description" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transaction_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infaq_bills" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER,
    "academic_year_id" INTEGER,
    "month" TEXT NOT NULL DEFAULT '',
    "year" TEXT NOT NULL DEFAULT '',
    "nominal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'belum_lunas',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "infaq_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infaq_payments" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER,
    "cash_account_id" INTEGER,
    "payment_method" TEXT NOT NULL DEFAULT 'tunai',
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payment_date" TEXT NOT NULL DEFAULT '',
    "receiver_id" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "infaq_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_savings" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER,
    "type" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_after" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_transactions" (
    "id" SERIAL NOT NULL,
    "transaction_category_id" INTEGER,
    "cash_account_id" INTEGER,
    "user_id" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'in',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "transaction_date" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'valid',
    "reference_type" TEXT NOT NULL DEFAULT '',
    "reference_id" TEXT NOT NULL DEFAULT '',
    "wakaf_donor_id" INTEGER,
    "wakaf_purpose_id" INTEGER,
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "general_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_accounts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cash_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'guru',
    "position" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "join_date" TEXT NOT NULL DEFAULT '',
    "base_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'earning',
    "default_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "component_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "month" TEXT NOT NULL DEFAULT '',
    "year" TEXT NOT NULL DEFAULT '',
    "base_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paid_at" TEXT,
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_details" (
    "id" SERIAL NOT NULL,
    "payroll_id" INTEGER,
    "component_id" INTEGER,
    "component_name" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payroll_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL DEFAULT 'baik',
    "acquisition_date" TEXT NOT NULL DEFAULT '',
    "acquisition_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER,
    "type" TEXT NOT NULL DEFAULT '',
    "quantity_change" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "logged_by" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER,
    "classroom_id" INTEGER,
    "academic_year_id" INTEGER,
    "enrollment_type" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wakaf_donors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wakaf_donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wakaf_purposes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "target_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "collected_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wakaf_purposes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "unit_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL DEFAULT '',
    "model_type" TEXT NOT NULL DEFAULT '',
    "model_id" TEXT NOT NULL DEFAULT '',
    "old_values" TEXT NOT NULL DEFAULT '',
    "new_values" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "students_classroom_id_idx" ON "students"("classroom_id");

-- CreateIndex
CREATE INDEX "students_deleted_at_idx" ON "students"("deleted_at");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_nisn_idx" ON "students"("nisn");

-- CreateIndex
CREATE INDEX "ppdb_registrations_status_deleted_at_idx" ON "ppdb_registrations"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "ppdb_registrations_deleted_at_idx" ON "ppdb_registrations"("deleted_at");

-- CreateIndex
CREATE INDEX "registration_payments_payable_type_payable_id_idx" ON "registration_payments"("payable_type", "payable_id");

-- CreateIndex
CREATE INDEX "registration_payments_deleted_at_idx" ON "registration_payments"("deleted_at");

-- CreateIndex
CREATE INDEX "infaq_bills_student_id_idx" ON "infaq_bills"("student_id");

-- CreateIndex
CREATE INDEX "infaq_bills_month_idx" ON "infaq_bills"("month");

-- CreateIndex
CREATE INDEX "infaq_bills_status_deleted_at_idx" ON "infaq_bills"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "infaq_bills_student_id_month_year_academic_year_id_key" ON "infaq_bills"("student_id", "month", "year", "academic_year_id");

-- CreateIndex
CREATE INDEX "student_savings_student_id_idx" ON "student_savings"("student_id");

-- CreateIndex
CREATE INDEX "student_savings_status_deleted_at_idx" ON "student_savings"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "student_savings_type_idx" ON "student_savings"("type");

-- CreateIndex
CREATE INDEX "general_transactions_type_deleted_at_idx" ON "general_transactions"("type", "deleted_at");

-- CreateIndex
CREATE INDEX "general_transactions_transaction_date_idx" ON "general_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "general_transactions_transaction_category_id_idx" ON "general_transactions"("transaction_category_id");

-- CreateIndex
CREATE INDEX "general_transactions_deleted_at_idx" ON "general_transactions"("deleted_at");

-- CreateIndex
CREATE INDEX "employees_type_deleted_at_idx" ON "employees"("type", "deleted_at");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "payrolls_employee_id_idx" ON "payrolls"("employee_id");

-- CreateIndex
CREATE INDEX "payrolls_month_year_idx" ON "payrolls"("month", "year");

-- CreateIndex
CREATE INDEX "payrolls_deleted_at_idx" ON "payrolls"("deleted_at");

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_wali_kelas_id_fkey" FOREIGN KEY ("wali_kelas_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_registrations" ADD CONSTRAINT "re_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_registrations" ADD CONSTRAINT "re_registrations_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infaq_bills" ADD CONSTRAINT "infaq_bills_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infaq_bills" ADD CONSTRAINT "infaq_bills_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infaq_payments" ADD CONSTRAINT "infaq_payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "infaq_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infaq_payments" ADD CONSTRAINT "infaq_payments_cash_account_id_fkey" FOREIGN KEY ("cash_account_id") REFERENCES "cash_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infaq_payments" ADD CONSTRAINT "infaq_payments_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_savings" ADD CONSTRAINT "student_savings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_transactions" ADD CONSTRAINT "general_transactions_transaction_category_id_fkey" FOREIGN KEY ("transaction_category_id") REFERENCES "transaction_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_transactions" ADD CONSTRAINT "general_transactions_cash_account_id_fkey" FOREIGN KEY ("cash_account_id") REFERENCES "cash_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_transactions" ADD CONSTRAINT "general_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_transactions" ADD CONSTRAINT "general_transactions_wakaf_donor_id_fkey" FOREIGN KEY ("wakaf_donor_id") REFERENCES "wakaf_donors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_transactions" ADD CONSTRAINT "general_transactions_wakaf_purpose_id_fkey" FOREIGN KEY ("wakaf_purpose_id") REFERENCES "wakaf_purposes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "salary_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "salary_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

