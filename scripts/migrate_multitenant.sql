-- Migration Script: Multi-Tenant Architecture
-- Created: 2026-10-25
-- Description: Creates tenants master table, inserts default tenant, and adds tenant_id column across required tables.

-- 1. Create master table tenants
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    status TEXT NOT NULL DEFAULT 'aktif',
    plan TEXT NOT NULL DEFAULT 'standard',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 2. Insert default tenant (id = 1) if not exists
INSERT INTO tenants (id, name, slug, domain, status, plan, settings)
VALUES (1, 'Santrix Demo School', 'demo', 'demo.santrix.my.id', 'aktif', 'standard', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Also prevent unique constraint violation on slug if different id was inserted
INSERT INTO tenants (id, name, slug, domain, status, plan, settings)
VALUES (1, 'Santrix Demo School', 'demo', 'demo.santrix.my.id', 'aktif', 'standard', '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Synchronize sequence
SELECT setval(pg_get_serial_sequence('tenants', 'id'), COALESCE((SELECT MAX(id) FROM tenants), 1), true);

-- 3. Add tenant_id to tables and set existing records to default tenant 1

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users(tenant_id);

-- students
ALTER TABLE students ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE students SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS students_tenant_id_idx ON students(tenant_id);

-- academic_years
ALTER TABLE academic_years ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE academic_years SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS academic_years_tenant_id_idx ON academic_years(tenant_id);

-- classrooms
ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE classrooms SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS classrooms_tenant_id_idx ON classrooms(tenant_id);

-- attendances
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE attendances SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS attendances_tenant_id_idx ON attendances(tenant_id);

-- student_grades
ALTER TABLE student_grades ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE student_grades SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS student_grades_tenant_id_idx ON student_grades(tenant_id);

-- final_grades
ALTER TABLE final_grades ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE final_grades SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS final_grades_tenant_id_idx ON final_grades(tenant_id);

-- report_cards
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE report_cards SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS report_cards_tenant_id_idx ON report_cards(tenant_id);

-- employee_salaries
ALTER TABLE employee_salaries ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE employee_salaries SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS employee_salaries_tenant_id_idx ON employee_salaries(tenant_id);

-- payroll_details
ALTER TABLE payroll_details ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE payroll_details SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS payroll_details_tenant_id_idx ON payroll_details(tenant_id);

-- inventory_logs
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE inventory_logs SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS inventory_logs_tenant_id_idx ON inventory_logs(tenant_id);

-- student_enrollments
ALTER TABLE student_enrollments ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE student_enrollments SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS student_enrollments_tenant_id_idx ON student_enrollments(tenant_id);

-- audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE audit_logs SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS audit_logs_tenant_id_idx ON audit_logs(tenant_id);

-- extracurricular_members
ALTER TABLE extracurricular_members ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE extracurricular_members SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS extracurricular_members_tenant_id_idx ON extracurricular_members(tenant_id);

-- grade_components
ALTER TABLE grade_components ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE grade_components SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS grade_components_tenant_id_idx ON grade_components(tenant_id);

-- kkms
ALTER TABLE kkms ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE kkms SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS kkms_tenant_id_idx ON kkms(tenant_id);

-- grade_formulas
ALTER TABLE grade_formulas ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE grade_formulas SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS grade_formulas_tenant_id_idx ON grade_formulas(tenant_id);

-- class_teacher_notes
ALTER TABLE class_teacher_notes ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE class_teacher_notes SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS class_teacher_notes_tenant_id_idx ON class_teacher_notes(tenant_id);

-- employee_attendances
ALTER TABLE employee_attendances ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE employee_attendances SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS employee_attendances_tenant_id_idx ON employee_attendances(tenant_id);

-- organization_positions
ALTER TABLE organization_positions ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE organization_positions SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS organization_positions_tenant_id_idx ON organization_positions(tenant_id);

-- student_credits
ALTER TABLE student_credits ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1;
UPDATE student_credits SET tenant_id = 1 WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS student_credits_tenant_id_idx ON student_credits(tenant_id);
