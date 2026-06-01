import { pgTable, serial, integer, text, doublePrecision, boolean, timestamp, index, uniqueIndex, jsonb, unique, pgView, bigint, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gradeComponents = pgTable("grade_components", {
	id: serial().primaryKey().notNull(),
	curriculumId: integer("curriculum_id"),
	name: text().notNull(),
	code: text().default('').notNull(),
	type: text().default('pengetahuan').notNull(),
	formatNilai: text("format_nilai").default('angka').notNull(),
	bobot: doublePrecision().default(0).notNull(),
	urutan: integer().default(1).notNull(),
	isWajib: boolean("is_wajib").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const generalTransactions = pgTable("general_transactions", {
	id: serial().primaryKey().notNull(),
	transactionCategoryId: integer("transaction_category_id"),
	cashAccountId: integer("cash_account_id"),
	userId: integer("user_id"),
	type: text().default('in').notNull(),
	amount: doublePrecision().default(0).notNull(),
	description: text().default('').notNull(),
	transactionDate: text("transaction_date").default('').notNull(),
	status: text().default('valid').notNull(),
	referenceType: text("reference_type").default('').notNull(),
	referenceId: text("reference_id").default('').notNull(),
	wakafDonorId: integer("wakaf_donor_id"),
	wakafPurposeId: integer("wakaf_purpose_id"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("gen_tx_category_idx").using("btree", table.transactionCategoryId.asc().nullsLast().op("int4_ops")),
	index("gen_tx_date_idx").using("btree", table.transactionDate.asc().nullsLast().op("text_ops")),
	index("gen_tx_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("gen_tx_type_deleted_idx").using("btree", table.type.asc().nullsLast().op("timestamp_ops"), table.deletedAt.asc().nullsLast().op("timestamp_ops")),
]);

export const gradeFormulas = pgTable("grade_formulas", {
	id: serial().primaryKey().notNull(),
	curriculumId: integer("curriculum_id"),
	jenis: text().default('pengetahuan').notNull(),
	formula: text().default('[]').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const infaqBills = pgTable("infaq_bills", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	academicYearId: integer("academic_year_id"),
	month: text().default('').notNull(),
	year: text().default('').notNull(),
	nominal: doublePrecision().default(0).notNull(),
	status: text().default('belum_lunas').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("infaq_bills_month_idx").using("btree", table.month.asc().nullsLast().op("text_ops")),
	index("infaq_bills_status_deleted_idx").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("infaq_bills_student_id_idx").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("unique_bill_per_student_month").using("btree", table.studentId.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops"), table.academicYearId.asc().nullsLast().op("int4_ops")),
]);

export const infaqPayments = pgTable("infaq_payments", {
	id: serial().primaryKey().notNull(),
	billId: integer("bill_id"),
	cashAccountId: integer("cash_account_id"),
	paymentMethod: text("payment_method").default('tunai').notNull(),
	amountPaid: doublePrecision("amount_paid").default(0).notNull(),
	paymentDate: text("payment_date").default('').notNull(),
	receiverId: integer("receiver_id"),
	notes: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const inventories = pgTable("inventories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	code: text().default('').notNull(),
	category: text().default('').notNull(),
	location: text().default('').notNull(),
	quantity: integer().default(0).notNull(),
	condition: text().default('baik').notNull(),
	acquisitionDate: text("acquisition_date").default('').notNull(),
	acquisitionCost: doublePrecision("acquisition_cost").default(0).notNull(),
	notes: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const inventoryLogs = pgTable("inventory_logs", {
	id: serial().primaryKey().notNull(),
	inventoryId: integer("inventory_id"),
	type: text().default('').notNull(),
	quantityChange: integer("quantity_change").default(0).notNull(),
	description: text().default('').notNull(),
	loggedBy: text("logged_by").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const kkms = pgTable("kkms", {
	id: serial().primaryKey().notNull(),
	curriculumId: integer("curriculum_id"),
	subjectId: integer("subject_id"),
	nilaiKkm: doublePrecision("nilai_kkm").default(75).notNull(),
	deskripsiKktp: text("deskripsi_kktp").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_kkm").using("btree", table.curriculumId.asc().nullsLast().op("int4_ops"), table.subjectId.asc().nullsLast().op("int4_ops")),
]);

export const letters = pgTable("letters", {
	id: serial().primaryKey().notNull(),
	type: text().default('masuk').notNull(),
	number: text().default('').notNull(),
	subject: text().default('').notNull(),
	sender: text().default('').notNull(),
	receiver: text().default('').notNull(),
	date: text().default('').notNull(),
	status: text().default('belum_disposisi').notNull(),
	fileUrl: text("file_url").default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("letters_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const organizationPositions = pgTable("organization_positions", {
	id: serial().primaryKey().notNull(),
	employeeId: integer("employee_id"),
	position: text().default('').notNull(),
	startDate: text("start_date").default('').notNull(),
	endDate: text("end_date").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payrollDetails = pgTable("payroll_details", {
	id: serial().primaryKey().notNull(),
	payrollId: integer("payroll_id"),
	componentId: integer("component_id"),
	componentName: text("component_name").default('').notNull(),
	type: text().default('').notNull(),
	amount: doublePrecision().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const payrolls = pgTable("payrolls", {
	id: serial().primaryKey().notNull(),
	employeeId: integer("employee_id"),
	month: text().default('').notNull(),
	year: text().default('').notNull(),
	baseSalary: doublePrecision("base_salary").default(0).notNull(),
	totalAllowance: doublePrecision("total_allowance").default(0).notNull(),
	totalDeduction: doublePrecision("total_deduction").default(0).notNull(),
	netSalary: doublePrecision("net_salary").default(0).notNull(),
	status: text().default('draft').notNull(),
	paidAt: text("paid_at"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("payrolls_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("payrolls_employee_id_idx").using("btree", table.employeeId.asc().nullsLast().op("int4_ops")),
	index("payrolls_month_year_idx").using("btree", table.month.asc().nullsLast().op("text_ops"), table.year.asc().nullsLast().op("text_ops")),
]);

export const ppdbRegistrations = pgTable("ppdb_registrations", {
	id: serial().primaryKey().notNull(),
	formNo: text("form_no").default('').notNull(),
	name: text().notNull(),
	gender: text().default('L').notNull(),
	birthPlace: text("birth_place").default('').notNull(),
	birthDate: text("birth_date").default('').notNull(),
	nik: text().default('').notNull(),
	noKk: text("no_kk").default('').notNull(),
	nisn: text().default('').notNull(),
	phone: text().default('').notNull(),
	address: text().default('').notNull(),
	previousSchool: text("previous_school").default('').notNull(),
	targetClassroom: text("target_classroom").default('').notNull(),
	status: text().default('pending').notNull(),
	registrationSource: text("registration_source").default('offline').notNull(),
	notes: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	familyStatus: text("family_status").default('').notNull(),
	siblingCount: integer("sibling_count"),
	childPosition: integer("child_position"),
	religion: text().default('Islam').notNull(),
	village: text().default('').notNull(),
	district: text().default('').notNull(),
	residenceType: text("residence_type").default('').notNull(),
	transportation: text().default('').notNull(),
	studentPhone: text("student_phone").default('').notNull(),
	height: integer(),
	weight: integer(),
	distanceToSchool: text("distance_to_school").default('').notNull(),
	travelTime: integer("travel_time"),
	fatherName: text("father_name").default('').notNull(),
	fatherBirthPlace: text("father_birth_place").default('').notNull(),
	fatherBirthDate: text("father_birth_date").default('').notNull(),
	fatherNik: text("father_nik").default('').notNull(),
	fatherEducation: text("father_education").default('').notNull(),
	fatherOccupation: text("father_occupation").default('').notNull(),
	motherName: text("mother_name").default('').notNull(),
	motherBirthPlace: text("mother_birth_place").default('').notNull(),
	motherBirthDate: text("mother_birth_date").default('').notNull(),
	motherNik: text("mother_nik").default('').notNull(),
	motherEducation: text("mother_education").default('').notNull(),
	motherOccupation: text("mother_occupation").default('').notNull(),
	parentIncome: text("parent_income").default('').notNull(),
	guardianName: text("guardian_name").default('').notNull(),
	guardianBirthPlace: text("guardian_birth_place").default('').notNull(),
	guardianBirthDate: text("guardian_birth_date").default('').notNull(),
	guardianNik: text("guardian_nik").default('').notNull(),
	guardianEducation: text("guardian_education").default('').notNull(),
	guardianOccupation: text("guardian_occupation").default('').notNull(),
	guardianAddress: text("guardian_address").default('').notNull(),
	guardianPhone: text("guardian_phone").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("ppdb_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("ppdb_status_deleted_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.deletedAt.asc().nullsLast().op("text_ops")),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	category: text().default('').notNull(),
	hargaJual: doublePrecision("harga_jual").default(0).notNull(),
	hargaBeli: doublePrecision("harga_beli").default(0).notNull(),
	stok: integer().default(0).notNull(),
	minStok: integer("min_stok").default(0).notNull(),
	status: text().default('aktif').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const reportCards = pgTable("report_cards", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	classroomId: integer("classroom_id"),
	curriculumId: integer("curriculum_id"),
	semester: text().default('ganjil').notNull(),
	status: text().default('DRAFT').notNull(),
	pdfUrl: text("pdf_url").default('').notNull(),
	ranking: text(),
	totalSiswa: integer("total_siswa"),
	catatanWali: text("catatan_wali"),
	attendanceAtititude: jsonb("attendance_atititude"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	snapshotData: jsonb("snapshot_data"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("unique_report_card").using("btree", table.studentId.asc().nullsLast().op("int4_ops"), table.curriculumId.asc().nullsLast().op("text_ops"), table.semester.asc().nullsLast().op("text_ops")),
]);

export const reRegistrations = pgTable("re_registrations", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	academicYearId: integer("academic_year_id"),
	status: text().default('pending').notNull(),
	registrationSource: text("registration_source").default('offline').notNull(),
	confirmedAt: text("confirmed_at"),
	notes: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const registrationPayments = pgTable("registration_payments", {
	id: serial().primaryKey().notNull(),
	payableType: text("payable_type").default('').notNull(),
	payableId: integer("payable_id"),
	paymentType: text("payment_type").default('').notNull(),
	nominal: doublePrecision().default(0).notNull(),
	isPaid: boolean("is_paid").default(false).notNull(),
	paidAt: text("paid_at"),
	notes: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("reg_payments_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("reg_payments_payable_idx").using("btree", table.payableType.asc().nullsLast().op("int4_ops"), table.payableId.asc().nullsLast().op("int4_ops")),
]);

export const salaryComponents = pgTable("salary_components", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().default('earning').notNull(),
	defaultAmount: doublePrecision("default_amount").default(0).notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const schedules = pgTable("schedules", {
	id: serial().primaryKey().notNull(),
	classroomId: integer("classroom_id"),
	subjectId: integer("subject_id"),
	employeeId: integer("employee_id"),
	academicYearId: integer("academic_year_id"),
	day: text().default('Senin').notNull(),
	startTime: text("start_time").default('').notNull(),
	endTime: text("end_time").default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("schedules_classroom_day_idx").using("btree", table.classroomId.asc().nullsLast().op("int4_ops"), table.day.asc().nullsLast().op("int4_ops")),
	index("schedules_employee_day_idx").using("btree", table.employeeId.asc().nullsLast().op("int4_ops"), table.day.asc().nullsLast().op("int4_ops")),
]);

export const schoolSettings = pgTable("school_settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const studentCredits = pgTable("student_credits", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	transactionId: integer("transaction_id"),
	amount: doublePrecision().default(0).notNull(),
	paidAmount: doublePrecision("paid_amount").default(0).notNull(),
	status: text().default('belum_lunas').notNull(),
	dueDate: text("due_date").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("student_credits_student_id_status_idx").using("btree", table.studentId.asc().nullsLast().op("int4_ops"), table.status.asc().nullsLast().op("int4_ops")),
]);

export const studentEnrollments = pgTable("student_enrollments", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	classroomId: integer("classroom_id"),
	academicYearId: integer("academic_year_id"),
	enrollmentType: text("enrollment_type").default('').notNull(),
	notes: text().default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const studentGrades = pgTable("student_grades", {
	id: serial().primaryKey().notNull(),
	componentId: integer("component_id"),
	studentId: integer("student_id"),
	subjectId: integer("subject_id"),
	classroomId: integer("classroom_id"),
	nilaiAngka: doublePrecision("nilai_angka").default(0).notNull(),
	predikat: text().default('').notNull(),
	inputById: integer("input_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_grade").using("btree", table.componentId.asc().nullsLast().op("int4_ops"), table.studentId.asc().nullsLast().op("int4_ops"), table.subjectId.asc().nullsLast().op("int4_ops")),
]);

export const studentSavings = pgTable("student_savings", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	type: text().default('').notNull(),
	amount: doublePrecision().default(0).notNull(),
	balanceAfter: doublePrecision("balance_after").default(0).notNull(),
	date: text().default('').notNull(),
	description: text().default('').notNull(),
	status: text().default('active').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("student_savings_status_deleted_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.deletedAt.asc().nullsLast().op("text_ops")),
	index("student_savings_student_id_idx").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	index("student_savings_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const students = pgTable("students", {
	id: serial().primaryKey().notNull(),
	nisn: text().default('').notNull(),
	nis: text().default('').notNull(),
	nik: text().default('').notNull(),
	noKk: text("no_kk").default('').notNull(),
	name: text().notNull(),
	gender: text().default('L').notNull(),
	category: text().default('reguler').notNull(),
	classroomId: integer("classroom_id"),
	status: text().default('aktif').notNull(),
	entryDate: text("entry_date").default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	phone: text().default('').notNull(),
	address: text().default('').notNull(),
	birthPlace: text("birth_place").default('').notNull(),
	birthDate: text("birth_date").default('').notNull(),
	infaqStatus: text("infaq_status").default('reguler').notNull(),
	infaqNominal: doublePrecision("infaq_nominal").default(0).notNull(),
	familyStatus: text("family_status").default('').notNull(),
	siblingCount: integer("sibling_count"),
	childPosition: integer("child_position"),
	religion: text().default('Islam').notNull(),
	village: text().default('').notNull(),
	district: text().default('').notNull(),
	residenceType: text("residence_type").default('').notNull(),
	transportation: text().default('').notNull(),
	studentPhone: text("student_phone").default('').notNull(),
	height: integer(),
	weight: integer(),
	distanceToSchool: text("distance_to_school").default('').notNull(),
	travelTime: integer("travel_time"),
	fatherName: text("father_name").default('').notNull(),
	fatherBirthPlace: text("father_birth_place").default('').notNull(),
	fatherBirthDate: text("father_birth_date").default('').notNull(),
	fatherNik: text("father_nik").default('').notNull(),
	fatherEducation: text("father_education").default('').notNull(),
	fatherOccupation: text("father_occupation").default('').notNull(),
	motherName: text("mother_name").default('').notNull(),
	motherBirthPlace: text("mother_birth_place").default('').notNull(),
	motherBirthDate: text("mother_birth_date").default('').notNull(),
	motherNik: text("mother_nik").default('').notNull(),
	motherEducation: text("mother_education").default('').notNull(),
	motherOccupation: text("mother_occupation").default('').notNull(),
	parentIncome: text("parent_income").default('').notNull(),
	guardianName: text("guardian_name").default('').notNull(),
	guardianBirthPlace: text("guardian_birth_place").default('').notNull(),
	guardianBirthDate: text("guardian_birth_date").default('').notNull(),
	guardianNik: text("guardian_nik").default('').notNull(),
	guardianEducation: text("guardian_education").default('').notNull(),
	guardianOccupation: text("guardian_occupation").default('').notNull(),
	guardianAddress: text("guardian_address").default('').notNull(),
	guardianPhone: text("guardian_phone").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("students_classroom_id_idx").using("btree", table.classroomId.asc().nullsLast().op("int4_ops")),
	index("students_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("students_nisn_idx").using("btree", table.nisn.asc().nullsLast().op("text_ops")),
	index("students_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	code: text().default('').notNull(),
	type: text().default('wajib').notNull(),
	tingkatKelas: text("tingkat_kelas").default('').notNull(),
	status: text().default('aktif').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("subjects_status_deleted_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.deletedAt.asc().nullsLast().op("text_ops")),
	index("subjects_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const teachingAssignments = pgTable("teaching_assignments", {
	id: serial().primaryKey().notNull(),
	employeeId: integer("employee_id"),
	subjectId: integer("subject_id"),
	classroomId: integer("classroom_id"),
	academicYearId: integer("academic_year_id"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("teaching_assignments_classroom_id_idx").using("btree", table.classroomId.asc().nullsLast().op("int4_ops")),
	index("teaching_assignments_employee_id_idx").using("btree", table.employeeId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("unique_teaching_assignment").using("btree", table.employeeId.asc().nullsLast().op("int4_ops"), table.subjectId.asc().nullsLast().op("int4_ops"), table.classroomId.asc().nullsLast().op("int4_ops"), table.academicYearId.asc().nullsLast().op("int4_ops")),
]);

export const transactionCategories = pgTable("transaction_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().default('in').notNull(),
	description: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	role: text().default('admin').notNull(),
	status: text().default('aktif').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const wakafDonors = pgTable("wakaf_donors", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	phone: text().default('').notNull(),
	address: text().default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const webAchievements = pgTable("web_achievements", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	studentName: text("student_name"),
	competitionName: text("competition_name"),
	level: text().default('kabupaten').notNull(),
	year: integer().notNull(),
	imageUrl: text("image_url"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const wakafPurposes = pgTable("wakaf_purposes", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().default('').notNull(),
	targetAmount: doublePrecision("target_amount").default(0).notNull(),
	collectedAmount: doublePrecision("collected_amount").default(0).notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const webFacilities = pgTable("web_facilities", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	iconSvg: text("icon_svg"),
	order: integer().default(0).notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const webHeroes = pgTable("web_heroes", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	subtitle: text(),
	mediaType: text("media_type").default('image').notNull(),
	mediaUrl: text("media_url").notNull(),
	ctaText: text("cta_text"),
	ctaUrl: text("cta_url"),
	order: integer().default(0).notNull(),
	status: text().default('aktif').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const academicYears = pgTable("academic_years", {
	id: serial().primaryKey().notNull(),
	year: text().notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	startDate: text("start_date"),
	endDate: text("end_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const announcements = pgTable("announcements", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	content: text().default('').notNull(),
	target: text().default('all').notNull(),
	channel: text().default('dashboard').notNull(),
	scheduledAt: text("scheduled_at").default('').notNull(),
	sentAt: text("sent_at").default('').notNull(),
	status: text().default('draft').notNull(),
	createdById: integer("created_by_id"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("announcements_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const auditLogs = pgTable("audit_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	action: text().default('').notNull(),
	modelType: text("model_type").default('').notNull(),
	modelId: text("model_id").default('').notNull(),
	oldValues: text("old_values").default('').notNull(),
	newValues: text("new_values").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	dateStart: text("date_start").default('').notNull(),
	dateEnd: text("date_end").default('').notNull(),
	type: text().default('kegiatan').notNull(),
	color: text().default('#3b82f6').notNull(),
	academicYearId: integer("academic_year_id"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("calendar_events_date_start_idx").using("btree", table.dateStart.asc().nullsLast().op("text_ops")),
]);

export const cashAccounts = pgTable("cash_accounts", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	balance: doublePrecision().default(0).notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const classTeacherNotes = pgTable("class_teacher_notes", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	classroomId: integer("classroom_id"),
	semester: text().default('ganjil').notNull(),
	note: text().default('').notNull(),
	inputById: integer("input_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_teacher_note").using("btree", table.studentId.asc().nullsLast().op("int4_ops"), table.classroomId.asc().nullsLast().op("int4_ops"), table.semester.asc().nullsLast().op("int4_ops")),
]);

export const classrooms = pgTable("classrooms", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	level: integer("level").default(1).notNull(),
	academicYearId: integer("academic_year_id"),
	waliKelasId: integer("wali_kelas_id"),
	infaqNominal: doublePrecision("infaq_nominal").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const coopTransactions = pgTable("coop_transactions", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	items: text().default('[]').notNull(),
	total: doublePrecision().default(0).notNull(),
	paymentMethod: text("payment_method").default('tunai').notNull(),
	date: text().default('').notNull(),
	status: text().default('valid').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("coop_transactions_date_idx").using("btree", table.date.asc().nullsLast().op("text_ops")),
	index("coop_transactions_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
]);

export const counselingRecords = pgTable("counseling_records", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	counselorId: integer("counselor_id"),
	date: text().default('').notNull(),
	category: text().default('akademik').notNull(),
	status: text().default('aktif').notNull(),
	description: text().default('').notNull(),
	followUp: text("follow_up").default('').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("counseling_records_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("counseling_records_student_id_idx").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
]);

export const curriculums = pgTable("curriculums", {
	id: serial().primaryKey().notNull(),
	type: text().default('KURMER').notNull(),
	academicYearId: integer("academic_year_id"),
	semester: text().default('ganjil').notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const employeeAttendances = pgTable("employee_attendances", {
	id: serial().primaryKey().notNull(),
	employeeId: integer("employee_id"),
	date: text().default('').notNull(),
	status: text().default('hadir').notNull(),
	note: text().default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_employee_attendance").using("btree", table.employeeId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast().op("int4_ops")),
]);

export const employeeSalaries = pgTable("employee_salaries", {
	id: serial().primaryKey().notNull(),
	employeeId: integer("employee_id"),
	componentId: integer("component_id"),
	amount: doublePrecision().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const employees = pgTable("employees", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	nip: text().default('').notNull(),
	type: text().default('guru').notNull(),
	position: text().default('').notNull(),
	status: text().default('aktif').notNull(),
	phone: text().default('').notNull(),
	address: text().default('').notNull(),
	joinDate: text("join_date").default('').notNull(),
	baseSalary: doublePrecision("base_salary").default(0).notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	userId: integer("user_id"),
}, (table) => [
	index("employees_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("employees_type_deleted_idx").using("btree", table.type.asc().nullsLast().op("timestamp_ops"), table.deletedAt.asc().nullsLast().op("text_ops")),
	unique("employees_user_id_unique").on(table.userId),
]);

export const extracurricularMembers = pgTable("extracurricular_members", {
	id: serial().primaryKey().notNull(),
	extracurricularId: integer("extracurricular_id"),
	studentId: integer("student_id"),
	joinDate: text("join_date").default('').notNull(),
	score: doublePrecision().default(0).notNull(),
	predicate: text().default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_member").using("btree", table.extracurricularId.asc().nullsLast().op("int4_ops"), table.studentId.asc().nullsLast().op("int4_ops")),
]);

export const extracurriculars = pgTable("extracurriculars", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	employeeId: integer("employee_id"),
	schedule: text().default('').notNull(),
	status: text().default('aktif').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const attendances = pgTable("attendances", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	classroomId: integer("classroom_id"),
	date: text().default('').notNull(),
	status: text().default('hadir').notNull(),
	note: text().default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	academicYearId: integer("academic_year_id"),
	isNotified: boolean("is_notified").default(false),
}, (table) => [
	index("attendances_classroom_date_idx").using("btree", table.classroomId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast().op("text_ops")),
	uniqueIndex("unique_attendance").using("btree", table.studentId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("text_ops")),
]);

export const finalGrades = pgTable("final_grades", {
	id: serial().primaryKey().notNull(),
	curriculumId: integer("curriculum_id"),
	studentId: integer("student_id"),
	subjectId: integer("subject_id"),
	classroomId: integer("classroom_id"),
	nilaiPengetahuan: doublePrecision("nilai_pengetahuan").default(0).notNull(),
	nilaiKeterampilan: doublePrecision("nilai_keterampilan").default(0).notNull(),
	nilaiAkhir: doublePrecision("nilai_akhir").default(0).notNull(),
	predikat: text().default('').notNull(),
	deskripsi: text().default('').notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_final_grade").using("btree", table.curriculumId.asc().nullsLast().op("int4_ops"), table.studentId.asc().nullsLast().op("int4_ops"), table.subjectId.asc().nullsLast().op("int4_ops")),
]);

export const webPosts = pgTable("web_posts", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	excerpt: text(),
	content: text().notNull(),
	thumbnailUrl: text("thumbnail_url"),
	category: text().default('berita').notNull(),
	status: text().default('draft').notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("web_posts_slug_unique").on(table.slug),
]);

export const webSettings = pgTable("web_settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	group: text().default('umum').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("web_settings_key_unique").on(table.key),
]);

export const webTeachers = pgTable("web_teachers", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	position: text(),
	bio: text(),
	photoUrl: text("photo_url"),
	order: integer().default(0).notNull(),
	status: text().default('aktif').notNull(),
	unitId: text("unit_id").default('').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
export const pgStatStatementsInfo = pgView("pg_stat_statements_info", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dealloc: bigint({ mode: "number" }),
	statsReset: timestamp("stats_reset", { withTimezone: true, mode: 'string' }),
}).as(sql`SELECT dealloc, stats_reset FROM pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset)`);

export const pgStatStatements = pgView("pg_stat_statements", {	// OID dipetakan ke integer
	userid: integer("userid"),
	// OID dipetakan ke integer
	dbid: integer("dbid"),
	toplevel: boolean(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	queryid: bigint({ mode: "number" }),
	query: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	plans: bigint({ mode: "number" }),
	totalPlanTime: doublePrecision("total_plan_time"),
	minPlanTime: doublePrecision("min_plan_time"),
	maxPlanTime: doublePrecision("max_plan_time"),
	meanPlanTime: doublePrecision("mean_plan_time"),
	stddevPlanTime: doublePrecision("stddev_plan_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	calls: bigint({ mode: "number" }),
	totalExecTime: doublePrecision("total_exec_time"),
	minExecTime: doublePrecision("min_exec_time"),
	maxExecTime: doublePrecision("max_exec_time"),
	meanExecTime: doublePrecision("mean_exec_time"),
	stddevExecTime: doublePrecision("stddev_exec_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	rows: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksHit: bigint("shared_blks_hit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksRead: bigint("shared_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksDirtied: bigint("shared_blks_dirtied", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksWritten: bigint("shared_blks_written", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksHit: bigint("local_blks_hit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksRead: bigint("local_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksDirtied: bigint("local_blks_dirtied", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksWritten: bigint("local_blks_written", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tempBlksRead: bigint("temp_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tempBlksWritten: bigint("temp_blks_written", { mode: "number" }),
	sharedBlkReadTime: doublePrecision("shared_blk_read_time"),
	sharedBlkWriteTime: doublePrecision("shared_blk_write_time"),
	localBlkReadTime: doublePrecision("local_blk_read_time"),
	localBlkWriteTime: doublePrecision("local_blk_write_time"),
	tempBlkReadTime: doublePrecision("temp_blk_read_time"),
	tempBlkWriteTime: doublePrecision("temp_blk_write_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walRecords: bigint("wal_records", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walFpi: bigint("wal_fpi", { mode: "number" }),
	walBytes: numeric("wal_bytes"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walBuffersFull: bigint("wal_buffers_full", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitFunctions: bigint("jit_functions", { mode: "number" }),
	jitGenerationTime: doublePrecision("jit_generation_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitInliningCount: bigint("jit_inlining_count", { mode: "number" }),
	jitInliningTime: doublePrecision("jit_inlining_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitOptimizationCount: bigint("jit_optimization_count", { mode: "number" }),
	jitOptimizationTime: doublePrecision("jit_optimization_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitEmissionCount: bigint("jit_emission_count", { mode: "number" }),
	jitEmissionTime: doublePrecision("jit_emission_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitDeformCount: bigint("jit_deform_count", { mode: "number" }),
	jitDeformTime: doublePrecision("jit_deform_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parallelWorkersToLaunch: bigint("parallel_workers_to_launch", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parallelWorkersLaunched: bigint("parallel_workers_launched", { mode: "number" }),
	statsSince: timestamp("stats_since", { withTimezone: true, mode: 'string' }),
	minmaxStatsSince: timestamp("minmax_stats_since", { withTimezone: true, mode: 'string' }),
}).as(sql`SELECT userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time, shared_blk_write_time, local_blk_read_time, local_blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, wal_buffers_full, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time, jit_deform_count, jit_deform_time, parallel_workers_to_launch, parallel_workers_launched, stats_since, minmax_stats_since FROM pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time, shared_blk_write_time, local_blk_read_time, local_blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, wal_buffers_full, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time, jit_deform_count, jit_deform_time, parallel_workers_to_launch, parallel_workers_launched, stats_since, minmax_stats_since)`);