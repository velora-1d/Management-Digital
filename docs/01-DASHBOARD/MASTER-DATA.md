# 🗄️ Menu: DASHBOARD — Master Data & Referensi Tabel

> Dashboard tidak memiliki tabel master sendiri — hanya BACA (read-only aggregate) dari tabel-tabel di bawah ini.

---

## Tabel yang Diakses Dashboard

### 1. `students` — Data Siswa
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID unik siswa |
| `name` | text | Nama lengkap |
| `status` | text | `aktif` / `mutasi` / `lulus` / `dropout` |
| `classroom_id` | integer FK | Referensi kelas |
| `unit_id` | text | Referensi lembaga/unit |
| `deleted_at` | timestamp | Soft delete |

**Query Dashboard:** `COUNT(*) WHERE status='aktif' AND deleted_at IS NULL`

---

### 2. `employees` — Data Guru & Staf
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID unik pegawai |
| `name` | text | Nama pegawai |
| `type` | text | `guru` / `staf` / `tendik` |
| `status` | text | `aktif` / `nonaktif` |
| `unit_id` | text | Unit lembaga |
| `deleted_at` | timestamp | Soft delete |

**Query Dashboard:** `COUNT(*) WHERE status='aktif' AND deleted_at IS NULL`

---

### 3. `general_transactions` — Jurnal Keuangan
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID transaksi |
| `type` | text | `in` (pemasukan) / `out` (pengeluaran) |
| `amount` | doublePrecision | Nominal transaksi |
| `transaction_date` | text | Tanggal transaksi |
| `status` | text | `valid` / `void` |
| `unit_id` | text | Unit lembaga |

**Query Dashboard:** `SUM(amount) WHERE type='in' AND MONTH(transaction_date) = bulan_ini`

---

### 4. `infaq_bills` — Tagihan Infaq/SPP
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID tagihan |
| `student_id` | integer FK | Referensi siswa |
| `month` | text | Bulan tagihan |
| `year` | text | Tahun tagihan |
| `nominal` | doublePrecision | Nominal tagihan |
| `status` | text | `belum_lunas` / `lunas` / `cicilan` |
| `academic_year_id` | integer FK | Tahun ajaran |

**Query Dashboard:** `COUNT(*) WHERE status='belum_lunas'`

---

### 5. `attendances` — Absensi Siswa
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID absensi |
| `student_id` | integer FK | Referensi siswa |
| `classroom_id` | integer FK | Referensi kelas |
| `date` | text | Tanggal absensi |
| `status` | text | `hadir` / `sakit` / `izin` / `alpha` |

**Query Dashboard:** `GROUP BY status WHERE date = TODAY`

---

### 6. `audit_logs` — Log Aktivitas
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID log |
| `user_id` | integer FK | User yang melakukan aksi |
| `action` | text | Jenis aksi (create/update/delete) |
| `model_type` | text | Tabel yang diubah |
| `model_id` | text | ID record yang diubah |
| `old_values` | text (JSON) | Nilai sebelum |
| `new_values` | text (JSON) | Nilai sesudah |
| `created_at` | timestamp | Waktu aksi |

---

### 7. `calendar_events` — Kalender Akademik
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID event |
| `title` | text | Judul event |
| `date_start` | text | Tanggal mulai |
| `date_end` | text | Tanggal selesai |
| `type` | text | `kegiatan` / `libur` / `ujian` |
| `color` | text | Warna event (hex) |
| `academic_year_id` | integer FK | Tahun ajaran |

---

### 8. `announcements` — Pengumuman
| Kolom | Tipe | Deskripsi |
|---|---|---|
| `id` | serial PK | ID pengumuman |
| `title` | text | Judul pengumuman |
| `content` | text | Isi pengumuman |
| `target` | text | `all` / `guru` / `siswa` / `ortu` |
| `status` | text | `draft` / `published` / `archived` |
| `scheduled_at` | text | Jadwal publish |

---

## Catatan

- Dashboard **tidak ada form input** — semua data adalah read-only aggregate
- Data di-refresh setiap kali halaman dibuka atau tombol refresh ditekan
- Semua query otomatis difilter berdasarkan `unit_id` user yang login
