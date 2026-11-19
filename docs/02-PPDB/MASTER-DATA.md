# 🗄️ Menu: PENERIMAAN PPDB — Master Data & Skema Tabel

---

## Tabel Utama

### 1. `ppdb_registrations` — Data Pendaftaran PPDB

| Kolom | Tipe | Null | Default | Deskripsi |
|---|---|---|---|---|
| `id` | serial | NOT NULL | auto | Primary Key |
| `form_no` | text | NOT NULL | `''` | Nomor formulir pendaftaran |
| `name` | text | NOT NULL | — | Nama lengkap calon siswa |
| `gender` | text | NOT NULL | `'L'` | Jenis kelamin: `L` / `P` |
| `birth_place` | text | NOT NULL | `''` | Tempat lahir |
| `birth_date` | text | NOT NULL | `''` | Tanggal lahir (format: YYYY-MM-DD) |
| `nik` | text | NOT NULL | `''` | NIK calon siswa |
| `no_kk` | text | NOT NULL | `''` | Nomor Kartu Keluarga |
| `nisn` | text | NOT NULL | `''` | Nomor Induk Siswa Nasional |
| `phone` | text | NOT NULL | `''` | No. HP orang tua |
| `address` | text | NOT NULL | `''` | Alamat lengkap |
| `previous_school` | text | NOT NULL | `''` | Nama sekolah asal |
| `target_classroom` | text | NOT NULL | `''` | Kelas yang dituju |
| `status` | text | NOT NULL | `'pending'` | Status: `pending`/`verified`/`interviewed`/`accepted`/`rejected` |
| `registration_source` | text | NOT NULL | `'offline'` | Sumber: `offline` / `online` |
| `notes` | text | NOT NULL | `''` | Catatan admin |
| `unit_id` | text | NOT NULL | `''` | ID unit/lembaga |
| `family_status` | text | NOT NULL | `''` | Status keluarga: `lengkap`/`yatim`/`piatu`/`yatim-piatu` |
| `sibling_count` | integer | NULL | — | Jumlah saudara |
| `child_position` | integer | NULL | — | Anak ke- |
| `religion` | text | NOT NULL | `'Islam'` | Agama |
| `village` | text | NOT NULL | `''` | Desa/Kelurahan |
| `district` | text | NOT NULL | `''` | Kecamatan |
| `residence_type` | text | NOT NULL | `''` | Jenis tempat tinggal |
| `transportation` | text | NOT NULL | `''` | Transportasi ke sekolah |
| `student_phone` | text | NOT NULL | `''` | No. HP pribadi siswa |
| `height` | integer | NULL | — | Tinggi badan (cm) |
| `weight` | integer | NULL | — | Berat badan (kg) |
| `distance_to_school` | text | NOT NULL | `''` | Jarak ke sekolah |
| `travel_time` | integer | NULL | — | Waktu tempuh (menit) |
| `father_name` | text | NOT NULL | `''` | Nama ayah |
| `father_birth_place` | text | NOT NULL | `''` | Tempat lahir ayah |
| `father_birth_date` | text | NOT NULL | `''` | Tanggal lahir ayah |
| `father_nik` | text | NOT NULL | `''` | NIK ayah |
| `father_education` | text | NOT NULL | `''` | Pendidikan terakhir ayah |
| `father_occupation` | text | NOT NULL | `''` | Pekerjaan ayah |
| `mother_name` | text | NOT NULL | `''` | Nama ibu |
| `mother_birth_place` | text | NOT NULL | `''` | Tempat lahir ibu |
| `mother_birth_date` | text | NOT NULL | `''` | Tanggal lahir ibu |
| `mother_nik` | text | NOT NULL | `''` | NIK ibu |
| `mother_education` | text | NOT NULL | `''` | Pendidikan terakhir ibu |
| `mother_occupation` | text | NOT NULL | `''` | Pekerjaan ibu |
| `parent_income` | text | NOT NULL | `''` | Penghasilan gabungan orang tua |
| `guardian_name` | text | NOT NULL | `''` | Nama wali |
| `guardian_birth_place` | text | NOT NULL | `''` | Tempat lahir wali |
| `guardian_birth_date` | text | NOT NULL | `''` | Tanggal lahir wali |
| `guardian_nik` | text | NOT NULL | `''` | NIK wali |
| `guardian_education` | text | NOT NULL | `''` | Pendidikan terakhir wali |
| `guardian_occupation` | text | NOT NULL | `''` | Pekerjaan wali |
| `guardian_address` | text | NOT NULL | `''` | Alamat wali |
| `guardian_phone` | text | NOT NULL | `''` | No. HP wali |
| `created_at` | timestamp | NOT NULL | `NOW()` | Waktu dibuat |
| `updated_at` | timestamp | NOT NULL | `NOW()` | Waktu diperbarui |
| `deleted_at` | timestamp | NULL | — | Soft delete |

**Indexes:**
- `ppdb_status_deleted_idx` → (`status`, `deleted_at`)
- `ppdb_deleted_at_idx` → (`deleted_at`)

---

### 2. `registration_payments` — Pembayaran Biaya Pendaftaran

| Kolom | Tipe | Null | Default | Deskripsi |
|---|---|---|---|---|
| `id` | serial | NOT NULL | auto | Primary Key |
| `payable_type` | text | NOT NULL | `''` | Jenis: `ppdb` / `re_registration` |
| `payable_id` | integer | NULL | — | FK ke `ppdb_registrations.id` atau `re_registrations.id` |
| `payment_type` | text | NOT NULL | `''` | Jenis pembayaran (formulir/seragam/dll) |
| `nominal` | doublePrecision | NOT NULL | `0` | Nominal pembayaran |
| `is_paid` | boolean | NOT NULL | `false` | Status lunas |
| `paid_at` | text | NULL | — | Waktu pembayaran |
| `notes` | text | NOT NULL | `''` | Catatan |
| `unit_id` | text | NOT NULL | `''` | ID unit |
| `created_at` | timestamp | NOT NULL | `NOW()` | Waktu dibuat |
| `updated_at` | timestamp | NOT NULL | `NOW()` | Waktu diperbarui |
| `deleted_at` | timestamp | NULL | — | Soft delete |

**Indexes:**
- `reg_payments_payable_idx` → (`payable_type`, `payable_id`)
- `reg_payments_deleted_at_idx` → (`deleted_at`)

---

## Nilai Enum / Konstanta

| Field | Nilai Valid |
|---|---|
| `status` | `pending`, `verified`, `interviewed`, `accepted`, `rejected` |
| `registration_source` | `online`, `offline` |
| `gender` | `L`, `P` |
| `family_status` | `lengkap`, `yatim`, `piatu`, `yatim-piatu` |
| `religion` | `Islam`, `Kristen`, `Katolik`, `Hindu`, `Buddha`, `Konghucu` |
| `payment_type` | `formulir`, `seragam`, `spp_awal`, `lain-lain` |

---

## Relasi

```
ppdb_registrations ──→ (tidak ada FK ke tabel lain saat pendaftaran)
ppdb_registrations ──→ registration_payments (via payable_type + payable_id)
ppdb_registrations ──→ students (setelah diterima → data di-migrate ke tabel students)
```
