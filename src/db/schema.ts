import {
  pgTable,
  serial,
  text,
  boolean,
  doublePrecision,
  integer,
  timestamp,
  unique,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── USERS ─────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('admin'),
  status: text('status').notNull().default('aktif'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── ACADEMIC YEARS ────────────────────────────────────────────────────────
export const academicYears = pgTable('academic_years', {
  id: serial('id').primaryKey(),
  year: text('year').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── CLASSROOMS ────────────────────────────────────────────────────────────
export const classrooms = pgTable('classrooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  academicYearId: integer('academic_year_id'),
  waliKelasId: integer('wali_kelas_id'),
  infaqNominal: doublePrecision('infaq_nominal').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── STUDENTS ──────────────────────────────────────────────────────────────
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  nisn: text('nisn').notNull().default(''),
  nis: text('nis').notNull().default(''),
  nik: text('nik').notNull().default(''),
  noKk: text('no_kk').notNull().default(''),
  name: text('name').notNull(),
  gender: text('gender').notNull().default('L'),
  category: text('category').notNull().default('reguler'),
  classroomId: integer('classroom_id'),
  status: text('status').notNull().default('aktif'),
  entryDate: text('entry_date').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  birthPlace: text('birth_place').notNull().default(''),
  birthDate: text('birth_date').notNull().default(''),
  infaqStatus: text('infaq_status').notNull().default('reguler'),
  infaqNominal: doublePrecision('infaq_nominal').notNull().default(0),
  familyStatus: text('family_status').notNull().default(''),
  siblingCount: integer('sibling_count'),
  childPosition: integer('child_position'),
  religion: text('religion').notNull().default('Islam'),
  village: text('village').notNull().default(''),
  district: text('district').notNull().default(''),
  residenceType: text('residence_type').notNull().default(''),
  transportation: text('transportation').notNull().default(''),
  studentPhone: text('student_phone').notNull().default(''),
  height: integer('height'),
  weight: integer('weight'),
  distanceToSchool: text('distance_to_school').notNull().default(''),
  travelTime: integer('travel_time'),
  fatherName: text('father_name').notNull().default(''),
  fatherBirthPlace: text('father_birth_place').notNull().default(''),
  fatherBirthDate: text('father_birth_date').notNull().default(''),
  fatherNik: text('father_nik').notNull().default(''),
  fatherEducation: text('father_education').notNull().default(''),
  fatherOccupation: text('father_occupation').notNull().default(''),
  motherName: text('mother_name').notNull().default(''),
  motherBirthPlace: text('mother_birth_place').notNull().default(''),
  motherBirthDate: text('mother_birth_date').notNull().default(''),
  motherNik: text('mother_nik').notNull().default(''),
  motherEducation: text('mother_education').notNull().default(''),
  motherOccupation: text('mother_occupation').notNull().default(''),
  parentIncome: text('parent_income').notNull().default(''),
  guardianName: text('guardian_name').notNull().default(''),
  guardianBirthPlace: text('guardian_birth_place').notNull().default(''),
  guardianBirthDate: text('guardian_birth_date').notNull().default(''),
  guardianNik: text('guardian_nik').notNull().default(''),
  guardianEducation: text('guardian_education').notNull().default(''),
  guardianOccupation: text('guardian_occupation').notNull().default(''),
  guardianAddress: text('guardian_address').notNull().default(''),
  guardianPhone: text('guardian_phone').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('students_classroom_id_idx').on(t.classroomId),
  index('students_deleted_at_idx').on(t.deletedAt),
  index('students_status_idx').on(t.status),
  index('students_nisn_idx').on(t.nisn),
]);

// ─── PPDB REGISTRATIONS ────────────────────────────────────────────────────
export const ppdbRegistrations = pgTable('ppdb_registrations', {
  id: serial('id').primaryKey(),
  formNo: text('form_no').notNull().default(''),
  name: text('name').notNull(),
  gender: text('gender').notNull().default('L'),
  birthPlace: text('birth_place').notNull().default(''),
  birthDate: text('birth_date').notNull().default(''),
  nik: text('nik').notNull().default(''),
  noKk: text('no_kk').notNull().default(''),
  nisn: text('nisn').notNull().default(''),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  previousSchool: text('previous_school').notNull().default(''),
  targetClassroom: text('target_classroom').notNull().default(''),
  status: text('status').notNull().default('pending'),
  registrationSource: text('registration_source').notNull().default('offline'),
  notes: text('notes').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  familyStatus: text('family_status').notNull().default(''),
  siblingCount: integer('sibling_count'),
  childPosition: integer('child_position'),
  religion: text('religion').notNull().default('Islam'),
  village: text('village').notNull().default(''),
  district: text('district').notNull().default(''),
  residenceType: text('residence_type').notNull().default(''),
  transportation: text('transportation').notNull().default(''),
  studentPhone: text('student_phone').notNull().default(''),
  height: integer('height'),
  weight: integer('weight'),
  distanceToSchool: text('distance_to_school').notNull().default(''),
  travelTime: integer('travel_time'),
  fatherName: text('father_name').notNull().default(''),
  fatherBirthPlace: text('father_birth_place').notNull().default(''),
  fatherBirthDate: text('father_birth_date').notNull().default(''),
  fatherNik: text('father_nik').notNull().default(''),
  fatherEducation: text('father_education').notNull().default(''),
  fatherOccupation: text('father_occupation').notNull().default(''),
  motherName: text('mother_name').notNull().default(''),
  motherBirthPlace: text('mother_birth_place').notNull().default(''),
  motherBirthDate: text('mother_birth_date').notNull().default(''),
  motherNik: text('mother_nik').notNull().default(''),
  motherEducation: text('mother_education').notNull().default(''),
  motherOccupation: text('mother_occupation').notNull().default(''),
  parentIncome: text('parent_income').notNull().default(''),
  guardianName: text('guardian_name').notNull().default(''),
  guardianBirthPlace: text('guardian_birth_place').notNull().default(''),
  guardianBirthDate: text('guardian_birth_date').notNull().default(''),
  guardianNik: text('guardian_nik').notNull().default(''),
  guardianEducation: text('guardian_education').notNull().default(''),
  guardianOccupation: text('guardian_occupation').notNull().default(''),
  guardianAddress: text('guardian_address').notNull().default(''),
  guardianPhone: text('guardian_phone').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('ppdb_status_deleted_idx').on(t.status, t.deletedAt),
  index('ppdb_deleted_at_idx').on(t.deletedAt),
]);

// ─── RE-REGISTRATIONS ──────────────────────────────────────────────────────
export const reRegistrations = pgTable('re_registrations', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  academicYearId: integer('academic_year_id'),
  status: text('status').notNull().default('pending'),
  registrationSource: text('registration_source').notNull().default('offline'),
  confirmedAt: text('confirmed_at'),
  notes: text('notes').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── REGISTRATION PAYMENTS ─────────────────────────────────────────────────
export const registrationPayments = pgTable('registration_payments', {
  id: serial('id').primaryKey(),
  payableType: text('payable_type').notNull().default(''),
  payableId: integer('payable_id'),
  paymentType: text('payment_type').notNull().default(''),
  nominal: doublePrecision('nominal').notNull().default(0),
  isPaid: boolean('is_paid').notNull().default(false),
  paidAt: text('paid_at'),
  notes: text('notes').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('reg_payments_payable_idx').on(t.payableType, t.payableId),
  index('reg_payments_deleted_at_idx').on(t.deletedAt),
]);

// ─── TRANSACTION CATEGORIES ────────────────────────────────────────────────
export const transactionCategories = pgTable('transaction_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('in'),
  description: text('description').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── CASH ACCOUNTS ─────────────────────────────────────────────────────────
export const cashAccounts = pgTable('cash_accounts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  balance: doublePrecision('balance').notNull().default(0),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── INFAQ BILLS ───────────────────────────────────────────────────────────
export const infaqBills = pgTable('infaq_bills', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  academicYearId: integer('academic_year_id'),
  month: text('month').notNull().default(''),
  year: text('year').notNull().default(''),
  nominal: doublePrecision('nominal').notNull().default(0),
  status: text('status').notNull().default('belum_lunas'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  uniqueIndex('unique_bill_per_student_month').on(t.studentId, t.month, t.year, t.academicYearId),
  index('infaq_bills_student_id_idx').on(t.studentId),
  index('infaq_bills_month_idx').on(t.month),
  index('infaq_bills_status_deleted_idx').on(t.status, t.deletedAt),
]);

// ─── INFAQ PAYMENTS ────────────────────────────────────────────────────────
export const infaqPayments = pgTable('infaq_payments', {
  id: serial('id').primaryKey(),
  billId: integer('bill_id'),
  cashAccountId: integer('cash_account_id'),
  paymentMethod: text('payment_method').notNull().default('tunai'),
  amountPaid: doublePrecision('amount_paid').notNull().default(0),
  paymentDate: text('payment_date').notNull().default(''),
  receiverId: integer('receiver_id'),
  notes: text('notes').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── STUDENT SAVINGS ───────────────────────────────────────────────────────
export const studentSavings = pgTable('student_savings', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  type: text('type').notNull().default(''),
  amount: doublePrecision('amount').notNull().default(0),
  balanceAfter: doublePrecision('balance_after').notNull().default(0),
  date: text('date').notNull().default(''),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('active'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('student_savings_student_id_idx').on(t.studentId),
  index('student_savings_status_deleted_idx').on(t.status, t.deletedAt),
  index('student_savings_type_idx').on(t.type),
]);

// ─── WAKAF DONORS ──────────────────────────────────────────────────────────
export const wakafDonors = pgTable('wakaf_donors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── WAKAF PURPOSES ────────────────────────────────────────────────────────
export const wakafPurposes = pgTable('wakaf_purposes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  targetAmount: doublePrecision('target_amount').notNull().default(0),
  collectedAmount: doublePrecision('collected_amount').notNull().default(0),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── GENERAL TRANSACTIONS ──────────────────────────────────────────────────
export const generalTransactions = pgTable('general_transactions', {
  id: serial('id').primaryKey(),
  categoryId: integer('transaction_category_id'),
  cashAccountId: integer('cash_account_id'),
  userId: integer('user_id'),
  type: text('type').notNull().default('in'),
  amount: doublePrecision('amount').notNull().default(0),
  description: text('description').notNull().default(''),
  date: text('transaction_date').notNull().default(''),
  status: text('status').notNull().default('valid'),
  referenceType: text('reference_type').notNull().default(''),
  referenceId: text('reference_id').notNull().default(''),
  wakafDonorId: integer('wakaf_donor_id'),
  wakafPurposeId: integer('wakaf_purpose_id'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('gen_tx_type_deleted_idx').on(t.type, t.deletedAt),
  index('gen_tx_date_idx').on(t.date),
  index('gen_tx_category_idx').on(t.categoryId),
  index('gen_tx_deleted_at_idx').on(t.deletedAt),
]);

// ─── EMPLOYEES ─────────────────────────────────────────────────────────────
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  nip: text('nip').notNull().default(''),
  type: text('type').notNull().default('guru'),
  position: text('position').notNull().default(''),
  status: text('status').notNull().default('aktif'),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  joinDate: text('join_date').notNull().default(''),
  baseSalary: doublePrecision('base_salary').notNull().default(0),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  userId: integer('user_id').unique(),
}, (t) => [
  index('employees_type_deleted_idx').on(t.type, t.deletedAt),
  index('employees_status_idx').on(t.status),
]);

// ─── SALARY COMPONENTS ─────────────────────────────────────────────────────
export const salaryComponents = pgTable('salary_components', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('earning'),
  defaultAmount: doublePrecision('default_amount').notNull().default(0),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── EMPLOYEE SALARIES ─────────────────────────────────────────────────────
export const employeeSalaries = pgTable('employee_salaries', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id'),
  componentId: integer('component_id'),
  amount: doublePrecision('amount').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── PAYROLLS ──────────────────────────────────────────────────────────────
export const payrolls = pgTable('payrolls', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id'),
  month: text('month').notNull().default(''),
  year: text('year').notNull().default(''),
  baseSalary: doublePrecision('base_salary').notNull().default(0),
  totalAllowance: doublePrecision('total_allowance').notNull().default(0),
  totalDeduction: doublePrecision('total_deduction').notNull().default(0),
  netSalary: doublePrecision('net_salary').notNull().default(0),
  status: text('status').notNull().default('draft'),
  paidAt: text('paid_at'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('payrolls_employee_id_idx').on(t.employeeId),
  index('payrolls_month_year_idx').on(t.month, t.year),
  index('payrolls_deleted_at_idx').on(t.deletedAt),
]);

// ─── PAYROLL DETAILS ───────────────────────────────────────────────────────
export const payrollDetails = pgTable('payroll_details', {
  id: serial('id').primaryKey(),
  payrollId: integer('payroll_id'),
  componentId: integer('component_id'),
  componentName: text('component_name').notNull().default(''),
  type: text('type').notNull().default(''),
  amount: doublePrecision('amount').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── INVENTORIES ───────────────────────────────────────────────────────────
export const inventories = pgTable('inventories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().default(''),
  category: text('category').notNull().default(''),
  location: text('location').notNull().default(''),
  quantity: integer('quantity').notNull().default(0),
  condition: text('condition').notNull().default('baik'),
  acquisitionDate: text('acquisition_date').notNull().default(''),
  acquisitionCost: doublePrecision('acquisition_cost').notNull().default(0),
  notes: text('notes').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── INVENTORY LOGS ────────────────────────────────────────────────────────
export const inventoryLogs = pgTable('inventory_logs', {
  id: serial('id').primaryKey(),
  inventoryId: integer('inventory_id'),
  type: text('type').notNull().default(''),
  quantityChange: integer('quantity_change').notNull().default(0),
  description: text('description').notNull().default(''),
  loggedBy: text('logged_by').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── STUDENT ENROLLMENTS ───────────────────────────────────────────────────
export const studentEnrollments = pgTable('student_enrollments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  classroomId: integer('classroom_id'),
  academicYearId: integer('academic_year_id'),
  enrollmentType: text('enrollment_type').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── SCHOOL SETTINGS ───────────────────────────────────────────────────────
export const schoolSettings = pgTable('school_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull(),
  value: text('value').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── AUDIT LOGS ────────────────────────────────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  action: text('action').notNull().default(''),
  modelType: text('model_type').notNull().default(''),
  modelId: text('model_id').notNull().default(''),
  oldValues: text('old_values').notNull().default(''),
  newValues: text('new_values').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── SUBJECTS ──────────────────────────────────────────────────────────────
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().default(''),
  type: text('type').notNull().default('wajib'),
  tingkatKelas: text('tingkat_kelas').notNull().default(''),
  status: text('status').notNull().default('aktif'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  index('subjects_type_idx').on(t.type),
  index('subjects_status_deleted_idx').on(t.status, t.deletedAt),
]);

// ─── TEACHING ASSIGNMENTS ──────────────────────────────────────────────────
export const teachingAssignments = pgTable('teaching_assignments', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id'),
  subjectId: integer('subject_id'),
  classroomId: integer('classroom_id'),
  academicYearId: integer('academic_year_id'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  uniqueIndex('unique_teaching_assignment').on(t.employeeId, t.subjectId, t.classroomId, t.academicYearId),
  index('teaching_assignments_employee_id_idx').on(t.employeeId),
  index('teaching_assignments_classroom_id_idx').on(t.classroomId),
]);

// ─── SCHEDULES ─────────────────────────────────────────────────────────────
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  classroomId: integer('classroom_id'),
  subjectId: integer('subject_id'),
  employeeId: integer('employee_id'),
  academicYearId: integer('academic_year_id'),
  day: text('day').notNull().default('Senin'),
  startTime: text('start_time').notNull().default(''),
  endTime: text('end_time').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('schedules_classroom_day_idx').on(t.classroomId, t.day),
  index('schedules_employee_day_idx').on(t.employeeId, t.day),
]);

// ─── ATTENDANCES ───────────────────────────────────────────────────────────
export const attendances = pgTable('attendances', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  classroomId: integer('classroom_id'),
  date: text('date').notNull().default(''),
  status: text('status').notNull().default('hadir'),
  note: text('note').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_attendance').on(t.studentId, t.date),
  index('attendances_classroom_date_idx').on(t.classroomId, t.date),
]);

// ─── EXTRACURRICULARS ──────────────────────────────────────────────────────
export const extracurriculars = pgTable('extracurriculars', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  employeeId: integer('employee_id'),
  schedule: text('schedule').notNull().default(''),
  status: text('status').notNull().default('aktif'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── EXTRACURRICULAR MEMBERS ───────────────────────────────────────────────
export const extracurricularMembers = pgTable('extracurricular_members', {
  id: serial('id').primaryKey(),
  extracurricularId: integer('extracurricular_id'),
  studentId: integer('student_id'),
  joinDate: text('join_date').notNull().default(''),
  score: doublePrecision('score').notNull().default(0),
  predicate: text('predicate').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_member').on(t.extracurricularId, t.studentId),
]);

// ─── CALENDAR EVENTS ───────────────────────────────────────────────────────
export const calendarEvents = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  dateStart: text('date_start').notNull().default(''),
  dateEnd: text('date_end').notNull().default(''),
  type: text('type').notNull().default('kegiatan'),
  color: text('color').notNull().default('#3b82f6'),
  academicYearId: integer('academic_year_id'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('calendar_events_date_start_idx').on(t.dateStart),
]);

// ─── COUNSELING RECORDS ────────────────────────────────────────────────────
export const counselingRecords = pgTable('counseling_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  counselorId: integer('counselor_id'),
  date: text('date').notNull().default(''),
  category: text('category').notNull().default('akademik'),
  status: text('status').notNull().default('aktif'),
  description: text('description').notNull().default(''),
  followUp: text('follow_up').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('counseling_records_student_id_idx').on(t.studentId),
  index('counseling_records_status_idx').on(t.status),
]);

// ─── CURRICULUMS ───────────────────────────────────────────────────────────
export const curriculums = pgTable('curriculums', {
  id: serial('id').primaryKey(),
  type: text('type').notNull().default('KURMER'),
  academicYearId: integer('academic_year_id'),
  semester: text('semester').notNull().default('ganjil'),
  isLocked: boolean('is_locked').notNull().default(false),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── GRADE COMPONENTS ──────────────────────────────────────────────────────
export const gradeComponents = pgTable('grade_components', {
  id: serial('id').primaryKey(),
  curriculumId: integer('curriculum_id'),
  name: text('name').notNull(),
  code: text('code').notNull().default(''),
  type: text('type').notNull().default('pengetahuan'),
  formatNilai: text('format_nilai').notNull().default('angka'),
  bobot: doublePrecision('bobot').notNull().default(0),
  urutan: integer('urutan').notNull().default(1),
  isWajib: boolean('is_wajib').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── KKM ───────────────────────────────────────────────────────────────────
export const kkms = pgTable('kkms', {
  id: serial('id').primaryKey(),
  curriculumId: integer('curriculum_id'),
  subjectId: integer('subject_id'),
  nilaiKKM: doublePrecision('nilai_kkm').notNull().default(75),
  deskripsiKKTP: text('deskripsi_kktp').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_kkm').on(t.curriculumId, t.subjectId),
]);

// ─── STUDENT GRADES ────────────────────────────────────────────────────────
export const studentGrades = pgTable('student_grades', {
  id: serial('id').primaryKey(),
  componentId: integer('component_id'),
  studentId: integer('student_id'),
  subjectId: integer('subject_id'),
  classroomId: integer('classroom_id'),
  nilaiAngka: doublePrecision('nilai_angka').notNull().default(0),
  predikat: text('predikat').notNull().default(''),
  inputById: integer('input_by_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_grade').on(t.componentId, t.studentId, t.subjectId),
]);

// ─── FINAL GRADES ──────────────────────────────────────────────────────────
export const finalGrades = pgTable('final_grades', {
  id: serial('id').primaryKey(),
  curriculumId: integer('curriculum_id'),
  studentId: integer('student_id'),
  subjectId: integer('subject_id'),
  classroomId: integer('classroom_id'),
  nilaiPengetahuan: doublePrecision('nilai_pengetahuan').notNull().default(0),
  nilaiKeterampilan: doublePrecision('nilai_keterampilan').notNull().default(0),
  nilaiAkhir: doublePrecision('nilai_akhir').notNull().default(0),
  predikat: text('predikat').notNull().default(''),
  deskripsi: text('deskripsi').notNull().default(''),
  isLocked: boolean('is_locked').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_final_grade').on(t.curriculumId, t.studentId, t.subjectId),
]);

// ─── GRADE FORMULAS ────────────────────────────────────────────────────────
export const gradeFormulas = pgTable('grade_formulas', {
  id: serial('id').primaryKey(),
  curriculumId: integer('curriculum_id'),
  jenis: text('jenis').notNull().default('pengetahuan'),
  formula: text('formula').notNull().default('[]'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── REPORT CARDS ──────────────────────────────────────────────────────────
export const reportCards = pgTable('report_cards', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  classroomId: integer('classroom_id'),
  curriculumId: integer('curriculum_id'),
  semester: text('semester').notNull().default('ganjil'),
  status: text('status').notNull().default('DRAFT'),
  pdfUrl: text('pdf_url').notNull().default(''),
  ranking: text('ranking'),
  totalSiswa: integer('total_siswa'),
  catatanWali: text('catatan_wali'),
  attendanceAtititude: jsonb('attendance_atititude'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_report_card').on(t.studentId, t.curriculumId, t.semester),
]);

// ─── CLASS TEACHER NOTES ───────────────────────────────────────────────────
export const classTeacherNotes = pgTable('class_teacher_notes', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  classroomId: integer('classroom_id'),
  semester: text('semester').notNull().default('ganjil'),
  note: text('note').notNull().default(''),
  inputById: integer('input_by_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_teacher_note').on(t.studentId, t.classroomId, t.semester),
]);

// ─── EMPLOYEE ATTENDANCES ──────────────────────────────────────────────────
export const employeeAttendances = pgTable('employee_attendances', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id'),
  date: text('date').notNull().default(''),
  status: text('status').notNull().default('hadir'),
  note: text('note').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('unique_employee_attendance').on(t.employeeId, t.date),
]);

// ─── LETTERS ───────────────────────────────────────────────────────────────
export const letters = pgTable('letters', {
  id: serial('id').primaryKey(),
  type: text('type').notNull().default('masuk'),
  number: text('number').notNull().default(''),
  subject: text('subject').notNull().default(''),
  sender: text('sender').notNull().default(''),
  receiver: text('receiver').notNull().default(''),
  date: text('date').notNull().default(''),
  status: text('status').notNull().default('belum_disposisi'),
  fileUrl: text('file_url').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('letters_type_idx').on(t.type),
]);

// ─── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  target: text('target').notNull().default('all'),
  channel: text('channel').notNull().default('dashboard'),
  scheduledAt: text('scheduled_at').notNull().default(''),
  sentAt: text('sent_at').notNull().default(''),
  status: text('status').notNull().default('draft'),
  createdById: integer('created_by_id'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('announcements_status_idx').on(t.status),
]);

// ─── ORGANIZATION POSITIONS ────────────────────────────────────────────────
export const organizationPositions = pgTable('organization_positions', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id'),
  position: text('position').notNull().default(''),
  startDate: text('start_date').notNull().default(''),
  endDate: text('end_date').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── PRODUCTS ──────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull().default(''),
  hargaJual: doublePrecision('harga_jual').notNull().default(0),
  hargaBeli: doublePrecision('harga_beli').notNull().default(0),
  stok: integer('stok').notNull().default(0),
  minStok: integer('min_stok').notNull().default(0),
  status: text('status').notNull().default('aktif'),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── COOP TRANSACTIONS ─────────────────────────────────────────────────────
export const coopTransactions = pgTable('coop_transactions', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  items: text('items').notNull().default('[]'),
  total: doublePrecision('total').notNull().default(0),
  paymentMethod: text('payment_method').notNull().default('tunai'),
  date: text('date').notNull().default(''),
  unitId: text('unit_id').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('coop_transactions_date_idx').on(t.date),
]);

// ─── STUDENT CREDITS ───────────────────────────────────────────────────────
export const studentCredits = pgTable('student_credits', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id'),
  transactionId: integer('transaction_id'),
  amount: doublePrecision('amount').notNull().default(0),
  paidAmount: doublePrecision('paid_amount').notNull().default(0),
  status: text('status').notNull().default('belum_lunas'),
  dueDate: text('due_date').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('student_credits_student_id_status_idx').on(t.studentId, t.status),
]);

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ one, many }) => ({
  employee: one(employees, { fields: [users.id], references: [employees.userId] }),
  auditLogs: many(auditLogs),
  announcements: many(announcements),
  classTeacherNotes: many(classTeacherNotes),
  inputtedGrades: many(studentGrades),
  receivedPayments: many(infaqPayments),
  transactions: many(generalTransactions),
}));

export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  classrooms: many(classrooms),
  curriculums: many(curriculums),
  infaqBills: many(infaqBills),
  reRegistrations: many(reRegistrations),
  schedules: many(schedules),
  studentEnrollments: many(studentEnrollments),
  teachingAssignments: many(teachingAssignments),
  calendarEvents: many(calendarEvents),
}));

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  academicYear: one(academicYears, { fields: [classrooms.academicYearId], references: [academicYears.id] }),
  waliKelas: one(employees, { fields: [classrooms.waliKelasId], references: [employees.id] }),
  attendances: many(attendances),
  classTeacherNotes: many(classTeacherNotes),
  finalGrades: many(finalGrades),
  reportCards: many(reportCards),
  schedules: many(schedules),
  studentEnrollments: many(studentEnrollments),
  studentGrades: many(studentGrades),
  students: many(students),
  teachingAssignments: many(teachingAssignments),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  classroom: one(classrooms, { fields: [students.classroomId], references: [classrooms.id] }),
  attendances: many(attendances),
  classTeacherNotes: many(classTeacherNotes),
  coopTransactions: many(coopTransactions),
  counselingRecords: many(counselingRecords),
  extracurricularMembers: many(extracurricularMembers),
  finalGrades: many(finalGrades),
  infaqBills: many(infaqBills),
  reRegistrations: many(reRegistrations),
  reportCards: many(reportCards),
  studentCredits: many(studentCredits),
  enrollments: many(studentEnrollments),
  studentGrades: many(studentGrades),
  savings: many(studentSavings),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  waliKelasOf: many(classrooms),
  counselingRecords: many(counselingRecords),
  employeeAttendances: many(employeeAttendances),
  salaries: many(employeeSalaries),
  extracurriculars: many(extracurriculars),
  organizationPositions: many(organizationPositions),
  payrolls: many(payrolls),
  schedules: many(schedules),
  teachingAssignments: many(teachingAssignments),
}));

export const infaqBillsRelations = relations(infaqBills, ({ one, many }) => ({
  student: one(students, { fields: [infaqBills.studentId], references: [students.id] }),
  academicYear: one(academicYears, { fields: [infaqBills.academicYearId], references: [academicYears.id] }),
  payments: many(infaqPayments),
}));

export const infaqPaymentsRelations = relations(infaqPayments, ({ one }) => ({
  bill: one(infaqBills, { fields: [infaqPayments.billId], references: [infaqBills.id] }),
  cashAccount: one(cashAccounts, { fields: [infaqPayments.cashAccountId], references: [cashAccounts.id] }),
  receiver: one(users, { fields: [infaqPayments.receiverId], references: [users.id] }),
}));

export const generalTransactionsRelations = relations(generalTransactions, ({ one }) => ({
  cashAccount: one(cashAccounts, { fields: [generalTransactions.cashAccountId], references: [cashAccounts.id] }),
  category: one(transactionCategories, { fields: [generalTransactions.categoryId], references: [transactionCategories.id] }),
  user: one(users, { fields: [generalTransactions.userId], references: [users.id] }),
  wakafDonor: one(wakafDonors, { fields: [generalTransactions.wakafDonorId], references: [wakafDonors.id] }),
  wakafPurpose: one(wakafPurposes, { fields: [generalTransactions.wakafPurposeId], references: [wakafPurposes.id] }),
}));

export const cashAccountsRelations = relations(cashAccounts, ({ many }) => ({
  transactions: many(generalTransactions),
  infaqPayments: many(infaqPayments),
}));

export const curriculumsRelations = relations(curriculums, ({ one, many }) => ({
  academicYear: one(academicYears, { fields: [curriculums.academicYearId], references: [academicYears.id] }),
  finalGrades: many(finalGrades),
  gradeComponents: many(gradeComponents),
  gradeFormulas: many(gradeFormulas),
  kkms: many(kkms),
  reportCards: many(reportCards),
}));

export const coopTransactionsRelations = relations(coopTransactions, ({ one, many }) => ({
  student: one(students, { fields: [coopTransactions.studentId], references: [students.id] }),
  studentCredits: many(studentCredits),
}));

export const studentCreditsRelations = relations(studentCredits, ({ one }) => ({
  student: one(students, { fields: [studentCredits.studentId], references: [students.id] }),
  transaction: one(coopTransactions, { fields: [studentCredits.transactionId], references: [coopTransactions.id] }),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  inventory: one(inventories, { fields: [inventoryLogs.inventoryId], references: [inventories.id] }),
}));

export const inventoriesRelations = relations(inventories, ({ many }) => ({
  logs: many(inventoryLogs),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  finalGrades: many(finalGrades),
  kkms: many(kkms),
  schedules: many(schedules),
  studentGrades: many(studentGrades),
  teachingAssignments: many(teachingAssignments),
}));

export const payrollsRelations = relations(payrolls, ({ one, many }) => ({
  employee: one(employees, { fields: [payrolls.employeeId], references: [employees.id] }),
  details: many(payrollDetails),
}));

export const payrollDetailsRelations = relations(payrollDetails, ({ one }) => ({
  payroll: one(payrolls, { fields: [payrollDetails.payrollId], references: [payrolls.id] }),
  component: one(salaryComponents, { fields: [payrollDetails.componentId], references: [salaryComponents.id] }),
}));

export const employeeSalariesRelations = relations(employeeSalaries, ({ one }) => ({
  employee: one(employees, { fields: [employeeSalaries.employeeId], references: [employees.id] }),
  component: one(salaryComponents, { fields: [employeeSalaries.componentId], references: [salaryComponents.id] }),
}));

export const salaryComponentsRelations = relations(salaryComponents, ({ many }) => ({
  employeeSalaries: many(employeeSalaries),
  payrollDetails: many(payrollDetails),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, { fields: [announcements.createdById], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
