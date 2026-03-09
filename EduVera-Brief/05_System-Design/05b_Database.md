# SYSTEM DESIGN — DATABASE
## PROJECT: EduVera SaaS Platform

---

## 1. DATABASE OVERVIEW

- **Engine:** PostgreSQL (via Aiven)
- **ORM:** Prisma
- **Strategy:** Shared Database + Row-Level Isolation (tenant_id di setiap table)
- **Naming Convention:** snake_case
- **Prinsip:** Soft delete (deleted_at), immutable transactions, full audit trail

---

## 2. CORE PLATFORM TABLES

```sql
-- ============================================================
-- TENANTS
-- ============================================================
Table: tenants
┌─────────────────┬──────────────┬────────────────────────────┐
│ Column          │ Type         │ Notes                      │
├─────────────────┼──────────────┼────────────────────────────┤
│ id              │ UUID (PK)    │ Generated                  │
│ subdomain       │ VARCHAR(100) │ UNIQUE, lowercase          │
│ nama_institusi  │ VARCHAR(255) │                            │
│ jenis           │ ENUM         │ SEKOLAH/PESANTREN/HYBRID   │
│ status          │ ENUM         │ TRIAL/AKTIF/SUSPEND/EXPIRED│
│ plan            │ VARCHAR(50)  │ basic/pro/enterprise       │
│ modules         │ JSONB        │ ["sekolah","pesantren"]    │
│ feature_flags   │ JSONB        │ {wa_gateway: true, ...}    │
│ trial_ends_at   │ TIMESTAMP    │                            │
│ created_at      │ TIMESTAMP    │                            │
│ updated_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- USERS (GLOBAL — semua role semua tenant)
-- ============================================================
Table: users
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │ → tenants.id               │
│ email           │ VARCHAR(255) │ UNIQUE per tenant          │
│ password_hash   │ TEXT         │ bcrypt                     │
│ nama            │ VARCHAR(255) │                            │
│ no_wa           │ VARCHAR(20)  │                            │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
│ last_login_at   │ TIMESTAMP    │                            │
│ created_at      │ TIMESTAMP    │                            │
│ updated_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- USER ROLES & PERMISSIONS
-- ============================================================
Table: roles
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(100) │ admin/bendahara/guru/...   │
│ is_system       │ BOOLEAN      │ true = tidak bisa dihapus  │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: permissions
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ role_id         │ UUID (FK)    │ → roles.id                 │
│ module          │ VARCHAR(100) │ keuangan/rapor/sdm/...     │
│ action          │ VARCHAR(50)  │ read/write/publish/export  │
└─────────────────┴──────────────┴────────────────────────────┘

Table: user_roles
┌─────────────────┬──────────────┬────────────────────────────┐
│ user_id         │ UUID (FK)    │                            │
│ role_id         │ UUID (FK)    │                            │
│ PRIMARY KEY (user_id, role_id)                             │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- AUDIT TRAIL (GLOBAL)
-- ============================================================
Table: audit_trail
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ user_id         │ UUID (FK)    │                            │
│ action          │ VARCHAR(100) │ CREATE/UPDATE/DELETE/...   │
│ table_name      │ VARCHAR(100) │                            │
│ record_id       │ UUID         │                            │
│ old_value       │ JSONB        │                            │
│ new_value       │ JSONB        │                            │
│ ip_address      │ VARCHAR(45)  │                            │
│ created_at      │ TIMESTAMP    │ IMMUTABLE                  │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- NOTIFIKASI
-- ============================================================
Table: notifikasi_log
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ channel         │ ENUM         │ WA/EMAIL/DASHBOARD         │
│ recipient       │ VARCHAR(255) │ no WA atau email           │
│ event_type      │ VARCHAR(100) │ spp_jatuh_tempo/rapor_...  │
│ status          │ ENUM         │ SUCCESS/FAILED/RETRY       │
│ retry_count     │ INT          │ default 0                  │
│ payload         │ JSONB        │ isi pesan                  │
│ sent_at         │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘
```

---

## 3. MODUL PESANTREN — DATABASE

```sql
-- ============================================================
-- MASTER DATA PESANTREN
-- ============================================================
Table: marhalah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(100) │ I'dadiyah/Ula/Wustha/Ulya  │
│ urutan          │ INT          │ untuk sorting              │
│ is_custom       │ BOOLEAN      │                            │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

Table: tahun_ajaran_pesantren
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ tahun_hijriah   │ VARCHAR(20)  │ 1446/1447                  │
│ tahun_masehi    │ VARCHAR(20)  │ 2025/2026                  │
│ semester        │ VARCHAR(50)  │ Ganjil/Genap/Custom        │
│ is_aktif        │ BOOLEAN      │ hanya 1 yang true          │
│ tanggal_mulai   │ DATE         │                            │
│ tanggal_akhir   │ DATE         │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- DATA SANTRI
-- ============================================================
Table: santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_code     │ VARCHAR(50)  │ auto-generated             │
│ nama            │ VARCHAR(255) │                            │
│ nik             │ VARCHAR(20)  │ opsional                   │
│ jenis_kelamin   │ ENUM         │ L/P                        │
│ tanggal_lahir   │ DATE         │                            │
│ marhalah_id     │ UUID (FK)    │ → marhalah.id              │
│ status_mukim    │ BOOLEAN      │                            │
│ status          │ ENUM         │ AKTIF/NONAKTIF/ARSIP       │
│ foto_url        │ TEXT         │ R2 URL                     │
│ alamat          │ TEXT         │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: wali_santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │ → santri.id                │
│ user_id         │ UUID (FK)    │ → users.id (portal wali)   │
│ nama            │ VARCHAR(255) │                            │
│ hubungan        │ ENUM         │ AYAH/IBU/WALI              │
│ no_wa           │ VARCHAR(20)  │                            │
│ email           │ VARCHAR(255) │                            │
│ is_utama        │ BOOLEAN      │ hanya 1 per santri         │
└─────────────────┴──────────────┴────────────────────────────┘

Table: kesehatan_santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ golongan_darah  │ VARCHAR(5)   │                            │
│ riwayat_penyakit│ TEXT         │                            │
│ alergi          │ TEXT         │                            │
│ catatan_medis   │ TEXT         │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- ASRAMA
-- ============================================================
Table: asrama
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(100) │                            │
│ jenis           │ ENUM         │ PUTRA/PUTRI/CAMPURAN       │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

Table: kamar
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ asrama_id       │ UUID (FK)    │ → asrama.id                │
│ nomor_kamar     │ VARCHAR(20)  │                            │
│ kapasitas       │ INT          │                            │
│ kapasitas_terisi│ INT          │ auto-calculated            │
│ status          │ ENUM         │ KOSONG/TERISI/PENUH/NONAKTIF│
└─────────────────┴──────────────┴────────────────────────────┘

Table: penempatan_santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ asrama_id       │ UUID (FK)    │                            │
│ kamar_id        │ UUID (FK)    │                            │
│ tgl_masuk       │ DATE         │                            │
│ tgl_keluar      │ DATE         │ null = masih aktif         │
│ alasan_mutasi   │ VARCHAR(255) │ null = penempatan awal     │
│ is_aktif        │ BOOLEAN      │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: absensi_asrama
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ kamar_id        │ UUID (FK)    │                            │
│ musyrif_id      │ UUID (FK)    │ → users.id                 │
│ tanggal         │ DATE         │                            │
│ sesi            │ ENUM         │ PAGI/MALAM                 │
│ status          │ ENUM         │ HADIR/IZIN/TIDAK_HADIR     │
│ catatan         │ TEXT         │                            │
│ UNIQUE (santri_id, tanggal, sesi)                          │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KEPESANTRENAN
-- ============================================================
Table: tata_tertib
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ judul           │ VARCHAR(255) │                            │
│ deskripsi       │ TEXT         │                            │
│ jenis           │ ENUM         │ UMUM/ASRAMA/IBADAH         │
│ marhalah_id     │ UUID (FK)    │ null = semua marhalah      │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

Table: jenis_pelanggaran
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(255) │                            │
│ kategori        │ ENUM         │ UMUM/ASRAMA/IBADAH         │
│ level           │ ENUM         │ RINGAN/SEDANG/BERAT        │
│ poin            │ INT          │ >= 0                       │
│ rekomendasi_sanksi│ TEXT       │                            │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

Table: riwayat_pelanggaran
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ jenis_id        │ UUID (FK)    │ → jenis_pelanggaran.id     │
│ musyrif_id      │ UUID (FK)    │                            │
│ tanggal         │ DATE         │                            │
│ keterangan      │ TEXT         │                            │
│ poin            │ INT          │ snapshot saat input        │
│ status          │ ENUM         │ AKTIF/DISELESAIKAN         │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: perizinan_santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ jenis           │ ENUM         │ KELUAR/PULANG/SAKIT        │
│ tgl_mulai       │ DATE         │                            │
│ tgl_kembali     │ DATE         │                            │
│ alasan          │ TEXT         │                            │
│ status          │ ENUM         │ PENDING/DISETUJUI/DITOLAK  │
│ approved_by     │ UUID (FK)    │ → users.id                 │
│ approved_at     │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: catatan_musyrif
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ musyrif_id      │ UUID (FK)    │                            │
│ tipe            │ ENUM         │ HARIAN/EVALUASI            │
│ tanggal         │ DATE         │                            │
│ periode         │ VARCHAR(20)  │ null jika HARIAN           │
│ isi_catatan     │ TEXT         │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- TAHFIDZ
-- ============================================================
Table: target_hafalan
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ marhalah_id     │ UUID (FK)    │ null = per santri          │
│ santri_id       │ UUID (FK)    │ null = per marhalah        │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ target_juz      │ INT          │                            │
│ target_surah    │ INT          │                            │
│ target_ayat     │ INT          │                            │
│ periode         │ ENUM         │ SEMESTER/TAHUNAN           │
│ alasan_override │ TEXT         │ null jika marhalah         │
└─────────────────┴──────────────┴────────────────────────────┘

Table: setoran_hafalan
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ ustadz_id       │ UUID (FK)    │ → users.id                 │
│ tanggal         │ DATE         │                            │
│ jenis           │ ENUM         │ BARU/MURAJAAH              │
│ surah_mulai     │ INT          │ nomor surah                │
│ ayat_mulai      │ INT          │                            │
│ surah_akhir     │ INT          │                            │
│ ayat_akhir      │ INT          │                            │
│ nilai_awal      │ ENUM         │ LANCAR/KURANG/ULANG        │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: penilaian_tahfidz
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ ustadz_id       │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ semester        │ VARCHAR(20)  │                            │
│ nilai_kelancaran│ DECIMAL(5,2) │                            │
│ nilai_tajwid    │ DECIMAL(5,2) │                            │
│ nilai_konsistensi│ DECIMAL(5,2)│                            │
│ predikat        │ ENUM         │ MUMTAZ/JAYYID_JIDDAN/...  │
│ narasi          │ TEXT         │ WAJIB                      │
│ status          │ ENUM         │ DRAFT/VALID                │
│ validated_by    │ UUID (FK)    │                            │
│ validated_at    │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- DINIYAH & KITAB
-- ============================================================
Table: kitab
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(255) │                            │
│ pengarang       │ VARCHAR(255) │                            │
│ jenis           │ ENUM         │ KUNING/MODERN/TAMBAHAN     │
│ bidang          │ VARCHAR(100) │ Fiqih/Aqidah/Akhlak/...   │
│ status          │ ENUM         │ AKTIF/ARSIP                │
└─────────────────┴──────────────┴────────────────────────────┘

Table: halaqah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(255) │                            │
│ kitab_id        │ UUID (FK)    │ → kitab.id                 │
│ marhalah_id     │ UUID (FK)    │                            │
│ ustadz_id       │ UUID (FK)    │                            │
│ kapasitas       │ INT          │                            │
│ jadwal          │ JSONB        │ [{hari, jam_mulai, jam_end}]│
│ tipe            │ ENUM         │ KITAB/TAHFIDZ/AKHLAK       │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

Table: penilaian_diniyah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ halaqah_id      │ UUID (FK)    │                            │
│ ustadz_id       │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ semester        │ VARCHAR(20)  │                            │
│ nilai_pemahaman │ DECIMAL(5,2) │                            │
│ nilai_akhlak    │ DECIMAL(5,2) │                            │
│ nilai_kehadiran │ DECIMAL(5,2) │ auto dari absensi          │
│ predikat        │ ENUM         │                            │
│ narasi          │ TEXT         │ WAJIB                      │
│ status          │ ENUM         │ DRAFT/VALID                │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- E-RAPOR PESANTREN
-- ============================================================
Table: rapor_pesantren
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ marhalah_id     │ UUID (FK)    │                            │
│ semester        │ VARCHAR(20)  │                            │
│ status          │ ENUM         │ DRAFT/PUBLISHED            │
│ pdf_url         │ TEXT         │ R2 signed URL              │
│ qr_code         │ TEXT         │ verifikasi URL             │
│ published_by    │ UUID (FK)    │                            │
│ published_at    │ TIMESTAMP    │                            │
│ created_at      │ TIMESTAMP    │                            │
│ UNIQUE (santri_id, tahun_ajaran_id, semester)              │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KEUANGAN PESANTREN
-- ============================================================
Table: coa_pesantren
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ kode            │ VARCHAR(20)  │ UNIQUE per tenant          │
│ nama            │ VARCHAR(255) │                            │
│ tipe            │ ENUM         │ ASET/KEWAJIBAN/DANA/       │
│                 │              │ PEMASUKAN/PENGELUARAN      │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

Table: tagihan_spp_pesantren
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ periode         │ DATE         │ tgl_1 bulan tagihan        │
│ nominal         │ DECIMAL(15,2)│                            │
│ status          │ ENUM         │ BELUM/SEBAGIAN/LUNAS       │
│ tgl_bayar       │  DATE        │                            │
│ metode_bayar    │ VARCHAR(50)  │ TRANSFER/CASH              │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: transaksi_pesantren
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ coa_id          │ UUID (FK)    │ → coa_pesantren.id         │
│ tipe            │ ENUM         │ MASUK/KELUAR               │
│ kategori        │ VARCHAR(100) │ SPP/DONASI/WAKAF/HONOR/... │
│ nominal         │ DECIMAL(15,2)│                            │
│ tanggal         │ DATE         │                            │
│ keterangan      │ TEXT         │                            │
│ bukti_url       │ TEXT         │ R2 URL                     │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │ IMMUTABLE                  │
└─────────────────┴──────────────┴────────────────────────────┘

Table: anggaran_pesantren
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ kategori        │ VARCHAR(100) │                            │
│ nominal         │ DECIMAL(15,2)│                            │
│ realisasi       │ DECIMAL(15,2)│ auto-updated               │
└─────────────────┴──────────────┴────────────────────────────┘
```

---

## 4. MODUL SEKOLAH — DATABASE

```sql
-- ============================================================
-- MASTER DATA SEKOLAH
-- ============================================================
Table: tahun_ajaran_sekolah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(50)  │ 2025/2026                  │
│ semester        │ ENUM         │ GANJIL/GENAP               │
│ tanggal_mulai   │ DATE         │                            │
│ tanggal_akhir   │ DATE         │                            │
│ is_aktif        │ BOOLEAN      │ hanya 1 yang true          │
└─────────────────┴──────────────┴────────────────────────────┘

Table: jenjang
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ kode            │ VARCHAR(20)  │ SD/SMP/SMA/SMK/PAUD        │
│ nama            │ VARCHAR(100) │ SYSTEM LOCK (tidak hapus)  │
│ is_system       │ BOOLEAN      │ true                       │
└─────────────────┴──────────────┴────────────────────────────┘

Table: tenant_jenjang (jenjang aktif per tenant)
┌─────────────────┬──────────────┬────────────────────────────┐
│ tenant_id       │ UUID (FK)    │                            │
│ jenjang_id      │ UUID (FK)    │                            │
│ is_aktif        │ BOOLEAN      │                            │
│ PRIMARY KEY (tenant_id, jenjang_id)                        │
└─────────────────┴──────────────┴────────────────────────────┘

Table: jurusan (SMK)
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(100) │ RPL/TKJ/Akuntansi          │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- SISWA
-- ============================================================
Table: siswa
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nis             │ VARCHAR(20)  │ UNIQUE per tenant          │
│ nisn            │ VARCHAR(20)  │                            │
│ nama            │ VARCHAR(255) │                            │
│ jenis_kelamin   │ ENUM         │ L/P                        │
│ tanggal_lahir   │ DATE         │                            │
│ jenjang_id      │ UUID (FK)    │                            │
│ tingkat         │ INT          │ 1-12 atau KB/TKA/TKB       │
│ jurusan_id      │ UUID (FK)    │ null kecuali SMK           │
│ status          │ ENUM         │ AKTIF/NONAKTIF/ARSIP       │
│ foto_url        │ TEXT         │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: wali_siswa
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ user_id         │ UUID (FK)    │ → users.id                 │
│ nama            │ VARCHAR(255) │                            │
│ hubungan        │ ENUM         │ AYAH/IBU/WALI              │
│ no_wa           │ VARCHAR(20)  │                            │
│ is_utama        │ BOOLEAN      │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- GURU & STAF
-- ============================================================
Table: pegawai
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ user_id         │ UUID (FK)    │ → users.id                 │
│ nip             │ VARCHAR(20)  │                            │
│ nama            │ VARCHAR(255) │                            │
│ tipe            │ ENUM         │ GURU/STAF                  │
│ jenis_guru      │ ENUM         │ KELAS/MAPEL/KEAGAMAAN/     │
│                 │              │ PRODUKTIF (null jika staf) │
│ unit_kerja      │ VARCHAR(100) │ null jika guru             │
│ status_kepeg    │ ENUM         │ PNS/PPPK/HONORER           │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KELAS & PEMBELAJARAN
-- ============================================================
Table: kelas
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ jenjang_id      │ UUID (FK)    │                            │
│ tingkat         │ INT          │                            │
│ nama            │ VARCHAR(50)  │ VII A / X RPL 1            │
│ jurusan_id      │ UUID (FK)    │ null kecuali SMK           │
│ wali_kelas_id   │ UUID (FK)    │ → pegawai.id               │
│ status          │ ENUM         │ AKTIF/ARSIP                │
└─────────────────┴──────────────┴────────────────────────────┘

Table: kelas_siswa
┌─────────────────┬──────────────┬────────────────────────────┐
│ kelas_id        │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ PRIMARY KEY (kelas_id, siswa_id, tahun_ajaran_id)          │
└─────────────────┴──────────────┴────────────────────────────┘

Table: penugasan_guru
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ guru_id         │ UUID (FK)    │ → pegawai.id               │
│ kelas_id        │ UUID (FK)    │                            │
│ mapel_id        │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KURIKULUM & NILAI
-- ============================================================
Table: kurikulum
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ jenjang_id      │ UUID (FK)    │                            │
│ jenis           │ ENUM         │ K13/MERDEKA/KEMENAG/CUSTOM │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ is_aktif        │ BOOLEAN      │ 1 aktif per jenjang/tahun  │
└─────────────────┴──────────────┴────────────────────────────┘

Table: komponen_nilai
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ kurikulum_id    │ UUID (FK)    │                            │
│ mapel_id        │ UUID (FK)    │                            │
│ nama            │ VARCHAR(100) │ Pengetahuan/Keterampilan   │
│ bobot           │ DECIMAL(5,2) │ total per mapel = 100      │
│ tipe            │ ENUM         │ ANGKA/NARASI/PREDIKAT      │
└─────────────────┴──────────────┴────────────────────────────┘

Table: nilai_siswa
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ kelas_id        │ UUID (FK)    │                            │
│ mapel_id        │ UUID (FK)    │                            │
│ komponen_id     │ UUID (FK)    │                            │
│ guru_id         │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ semester        │ ENUM         │ GANJIL/GENAP               │
│ nilai           │ DECIMAL(5,2) │                            │
│ narasi          │ TEXT         │                            │
│ is_locked       │ BOOLEAN      │ true setelah publish rapor │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: rapor_sekolah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ kelas_id        │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ semester        │ ENUM         │                            │
│ status          │ ENUM         │ DRAFT/PUBLISHED            │
│ pdf_url         │ TEXT         │                            │
│ qr_code         │ TEXT         │                            │
│ published_by    │ UUID (FK)    │                            │
│ published_at    │ TIMESTAMP    │                            │
│ UNIQUE (siswa_id, tahun_ajaran_id, semester)               │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- SDM & PENGGAJIAN
-- ============================================================
Table: absensi_pegawai
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ pegawai_id      │ UUID (FK)    │                            │
│ tanggal         │ DATE         │                            │
│ status          │ ENUM         │ HADIR/SAKIT/IZIN/ALPHA     │
│ keterangan      │ TEXT         │                            │
│ UNIQUE (pegawai_id, tanggal)                               │
└─────────────────┴──────────────┴────────────────────────────┘

Table: komponen_gaji
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ status_kepeg    │ ENUM         │ PNS/PPPK/HONORER           │
│ nama_komponen   │ VARCHAR(100) │ Gaji Pokok/Tunjangan/Honor │
│ tipe            │ ENUM         │ TETAP/PER_JAM/POTONGAN     │
│ nominal         │ DECIMAL(15,2)│ null jika per_jam          │
│ tarif_per_jam   │ DECIMAL(15,2)│ null jika tetap            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: slip_gaji
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ pegawai_id      │ UUID (FK)    │                            │
│ periode         │ DATE         │ tgl_1 bulan gaji           │
│ komponen        │ JSONB        │ breakdown komponen gaji    │
│ total_gaji      │ DECIMAL(15,2)│                            │
│ status          │ ENUM         │ DRAFT/PUBLISHED            │
│ published_at    │ TIMESTAMP    │                            │
│ pdf_url         │ TEXT         │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KEUANGAN SEKOLAH
-- ============================================================
Table: tagihan_spp_sekolah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ periode         │ DATE         │                            │
│ nominal         │ DECIMAL(15,2)│                            │
│ status          │ ENUM         │ BELUM/SEBAGIAN/LUNAS       │
│ tgl_bayar       │ DATE         │                            │
│ metode_bayar    │ VARCHAR(50)  │                            │
│ confirmed_by    │ UUID (FK)    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: transaksi_sekolah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ coa_id          │ UUID (FK)    │                            │
│ tipe            │ ENUM         │ MASUK/KELUAR               │
│ kategori        │ VARCHAR(100) │ SPP/BOS/GAJI/OPERASIONAL   │
│ nominal         │ DECIMAL(15,2)│                            │
│ tanggal         │ DATE         │                            │
│ keterangan      │ TEXT         │                            │
│ bukti_url       │ TEXT         │                            │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │ IMMUTABLE                  │
└─────────────────┴──────────────┴────────────────────────────┘
```

---

## 5. INDEX STRATEGY

```sql
-- Index wajib untuk performance multi-tenant
CREATE INDEX idx_santri_tenant ON santri(tenant_id);
CREATE INDEX idx_siswa_tenant ON siswa(tenant_id);
CREATE INDEX idx_transaksi_tenant_periode ON transaksi_pesantren(tenant_id, tanggal);
CREATE INDEX idx_absensi_santri_tgl ON absensi_asrama(santri_id, tanggal);
CREATE INDEX idx_nilai_siswa_kelas ON nilai_siswa(kelas_id, tahun_ajaran_id);
CREATE INDEX idx_rapor_siswa ON rapor_sekolah(siswa_id, tahun_ajaran_id);
CREATE INDEX idx_audit_tenant_tgl ON audit_trail(tenant_id, created_at);
```

---

## 6. PRISMA MIDDLEWARE (TENANT ISOLATION)

```typescript
// Prisma middleware untuk auto-inject tenant_id
prisma.$use(async (params, next) => {
  const tenantId = getTenantFromContext()

  // Auto-add tenant_id ke semua query
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      tenant_id: tenantId
    }
  }

  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      tenant_id: tenantId
    }
  }

  // Auto-add audit trail di setiap write
  if (['create', 'update', 'delete'].includes(params.action)) {
    await logAuditTrail(params, tenantId)
  }

  return next(params)
})
```

---

## 7. TABEL TAMBAHAN — MENU BARU

```sql
-- ============================================================
-- EKSTRAKURIKULER (SEKOLAH)
-- ============================================================
Table: ekskul
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(100) │                            │
│ deskripsi       │ TEXT         │                            │
│ pembina_id      │ UUID (FK)    │ → pegawai                  │
│ jadwal          │ JSONB        │ [{hari, jam_mulai, jam_selesai}] │
│ status          │ ENUM         │ AKTIF/NONAKTIF             │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: ekskul_anggota
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ ekskul_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ tgl_masuk       │ DATE         │                            │
│ status          │ ENUM         │ AKTIF/KELUAR               │
│ UNIQUE          │              │ (ekskul_id, siswa_id, tahun_ajaran_id) │
└─────────────────┴──────────────┴────────────────────────────┘

Table: absensi_ekskul
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ ekskul_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ tanggal         │ DATE         │                            │
│ status          │ ENUM         │ HADIR/TIDAK_HADIR/IZIN     │
│ keterangan      │ TEXT         │                            │
│ UNIQUE          │              │ (ekskul_id, siswa_id, tanggal) │
└─────────────────┴──────────────┴────────────────────────────┘

Table: nilai_ekskul
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ ekskul_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ semester        │ ENUM         │ GANJIL/GENAP               │
│ nilai           │ DECIMAL(5,2) │                            │
│ predikat        │ VARCHAR(50)  │ A/B/C/D                    │
│ keterangan      │ TEXT         │                            │
│ UNIQUE          │              │ (ekskul_id, siswa_id, tahun_ajaran_id, semester) │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- BIMBINGAN KONSELING (SEKOLAH)
-- ============================================================
Table: bk_catatan
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ guru_bk_id      │ UUID (FK)    │ → pegawai                  │
│ tanggal         │ DATE         │                            │
│ kategori        │ ENUM         │ AKADEMIK/PERILAKU/SOSIAL/KELUARGA │
│ isi_catatan     │ TEXT         │                            │
│ tindak_lanjut   │ TEXT         │                            │
│ status          │ ENUM         │ AKTIF/PROSES/SELESAI       │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- MUTASI SISWA (SEKOLAH)
-- ============================================================
Table: mutasi_siswa
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ tipe            │ ENUM         │ MASUK/KELUAR               │
│ tanggal         │ DATE         │                            │
│ asal_tujuan     │ VARCHAR(200) │ nama sekolah asal/tujuan   │
│ alasan          │ TEXT         │                            │
│ dokumen_url     │ TEXT         │                            │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KENAIKAN KELAS (SEKOLAH)
-- ============================================================
Table: kenaikan_kelas
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ siswa_id        │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │ tahun ajaran yang berakhir │
│ kelas_dari_id   │ UUID (FK)    │                            │
│ kelas_ke_id     │ UUID (FK)    │ null jika lulus/tinggal    │
│ status          │ ENUM         │ NAIK/TINGGAL/LULUS         │
│ alasan_tinggal  │ TEXT         │ wajib jika TINGGAL         │
│ confirmed_by    │ UUID (FK)    │                            │
│ confirmed_at    │ TIMESTAMP    │                            │
│ UNIQUE          │              │ (siswa_id, tahun_ajaran_id) │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- INVENTARIS (SEKOLAH)
-- ============================================================
Table: inventaris
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ kode_barang     │ VARCHAR(50)  │ UNIQUE per tenant          │
│ nama_barang     │ VARCHAR(200) │                            │
│ kategori        │ VARCHAR(100) │                            │
│ jumlah          │ INTEGER      │                            │
│ kondisi         │ ENUM         │ BAIK/RUSAK_RINGAN/RUSAK_BERAT/HILANG │
│ lokasi          │ VARCHAR(200) │                            │
│ tgl_pengadaan   │ DATE         │                            │
│ keterangan      │ TEXT         │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: pengadaan
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama_barang     │ VARCHAR(200) │                            │
│ jumlah          │ INTEGER      │                            │
│ estimasi_biaya  │ DECIMAL(15,2)│                            │
│ status          │ ENUM         │ RENCANA/DISETUJUI/REALISASI│
│ transaksi_id    │ UUID (FK)    │ → transaksi_sekolah        │
│ tgl_realisasi   │ DATE         │                            │
│ keterangan      │ TEXT         │                            │
│ created_by      │ UUID (FK)    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- SURAT MENYURAT (SEKOLAH & PESANTREN)
-- ============================================================
Table: surat_masuk
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nomor_surat     │ VARCHAR(100) │                            │
│ tanggal_surat   │ DATE         │                            │
│ tanggal_terima  │ DATE         │                            │
│ pengirim        │ VARCHAR(200) │                            │
│ perihal         │ TEXT         │                            │
│ dokumen_url     │ TEXT         │ upload scan                │
│ disposisi_ke    │ UUID (FK)    │ → users                    │
│ instruksi       │ TEXT         │                            │
│ status          │ ENUM         │ MASUK/TERDISPOSISI/SELESAI │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: surat_keluar
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nomor_surat     │ VARCHAR(100) │ auto-generate              │
│ nomor_urut      │ INTEGER      │ auto-increment per tahun   │
│ tanggal_surat   │ DATE         │                            │
│ tujuan          │ VARCHAR(200) │                            │
│ perihal         │ TEXT         │                            │
│ isi             │ TEXT         │                            │
│ dokumen_url     │ TEXT         │                            │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- MUTASI SANTRI (PESANTREN)
-- ============================================================
Table: mutasi_santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ tipe            │ ENUM         │ MASUK/KELUAR/LULUS         │
│ tanggal         │ DATE         │                            │
│ asal_tujuan     │ VARCHAR(200) │ nama pesantren asal/tujuan │
│ alasan          │ TEXT         │                            │
│ hafalan_terakhir│ VARCHAR(100) │ juz/surah terakhir (jika masuk) │
│ dokumen_url     │ TEXT         │                            │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KENAIKAN MARHALAH (PESANTREN)
-- ============================================================
Table: kenaikan_marhalah
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ tahun_ajaran_id │ UUID (FK)    │                            │
│ marhalah_dari_id│ UUID (FK)    │                            │
│ marhalah_ke_id  │ UUID (FK)    │ null jika lulus/tetap      │
│ status          │ ENUM         │ NAIK/TETAP/LULUS           │
│ alasan_tetap    │ TEXT         │ wajib jika TETAP           │
│ confirmed_by    │ UUID (FK)    │                            │
│ confirmed_at    │ TIMESTAMP    │                            │
│ UNIQUE          │              │ (santri_id, tahun_ajaran_id) │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- KESEHATAN SANTRI (PESANTREN)
-- ============================================================
Table: pemeriksaan_santri
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ tanggal         │ DATE         │                            │
│ keluhan         │ TEXT         │                            │
│ diagnosis       │ TEXT         │                            │
│ tindakan        │ TEXT         │                            │
│ petugas_id      │ UUID (FK)    │ → users                    │
│ status          │ ENUM         │ AKTIF/SEMBUH/DIRUJUK       │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: stok_obat
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama_obat       │ VARCHAR(200) │                            │
│ satuan          │ VARCHAR(50)  │ strip/tablet/botol/sachet  │
│ stok            │ INTEGER      │                            │
│ stok_minimum    │ INTEGER      │ threshold warning          │
│ keterangan      │ TEXT         │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: log_obat
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ obat_id         │ UUID (FK)    │ → stok_obat                │
│ tipe            │ ENUM         │ MASUK/KELUAR               │
│ jumlah          │ INTEGER      │                            │
│ keterangan      │ TEXT         │                            │
│ santri_id       │ UUID (FK)    │ null jika masuk stok       │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: rujukan_rs
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
│ tanggal         │ DATE         │                            │
│ nama_rs         │ VARCHAR(200) │                            │
│ nama_dokter     │ VARCHAR(200) │                            │
│ diagnosa        │ TEXT         │                            │
│ dokumen_url     │ TEXT         │                            │
│ tindak_lanjut   │ TEXT         │                            │
│ status          │ ENUM         │ DIRUJUK/KEMBALI/RAWAT_INAP │
│ created_by      │ UUID (FK)    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- PROGRAM KEGIATAN (PESANTREN)
-- ============================================================
Table: program_kegiatan
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ nama            │ VARCHAR(200) │                            │
│ jenis           │ ENUM         │ DAUROH/HAFLAH/KHATAMAN/WISATA/LAINNYA │
│ deskripsi       │ TEXT         │                            │
│ tgl_mulai       │ DATE         │                            │
│ tgl_selesai     │ DATE         │                            │
│ lokasi          │ VARCHAR(200) │                            │
│ status          │ ENUM         │ RENCANA/BERLANGSUNG/SELESAI│
│ evaluasi        │ TEXT         │                            │
│ created_by      │ UUID (FK)    │                            │
│ created_at      │ TIMESTAMP    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: program_panitia
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ program_id      │ UUID (FK)    │                            │
│ sdm_id          │ UUID (FK)    │ → users (ustadz/musyrif)   │
│ jabatan_panitia │ VARCHAR(100) │ Ketua/Sekretaris/Anggota   │
└─────────────────┴──────────────┴────────────────────────────┘

Table: program_peserta
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ program_id      │ UUID (FK)    │                            │
│ santri_id       │ UUID (FK)    │                            │
└─────────────────┴──────────────┴────────────────────────────┘

Table: program_agenda
┌─────────────────┬──────────────┬────────────────────────────┐
│ id              │ UUID (PK)    │                            │
│ tenant_id       │ UUID (FK)    │                            │
│ program_id      │ UUID (FK)    │                            │
│ tanggal         │ DATE         │                            │
│ jam_mulai       │ TIME         │                            │
│ jam_selesai     │ TIME         │                            │
│ kegiatan        │ VARCHAR(200) │                            │
│ penanggung_jawab│ VARCHAR(200) │                            │
└─────────────────┴──────────────┴────────────────────────────┘

-- ============================================================
-- INDEX TAMBAHAN
-- ============================================================
CREATE INDEX idx_ekskul_anggota_siswa ON ekskul_anggota(siswa_id, tahun_ajaran_id);
CREATE INDEX idx_absensi_ekskul_tgl ON absensi_ekskul(ekskul_id, tanggal);
CREATE INDEX idx_bk_siswa ON bk_catatan(siswa_id, tenant_id);
CREATE INDEX idx_mutasi_siswa ON mutasi_siswa(siswa_id, tenant_id);
CREATE INDEX idx_mutasi_santri ON mutasi_santri(santri_id, tenant_id);
CREATE INDEX idx_kenaikan_kelas ON kenaikan_kelas(siswa_id, tahun_ajaran_id);
CREATE INDEX idx_kenaikan_marhalah ON kenaikan_marhalah(santri_id, tahun_ajaran_id);
CREATE INDEX idx_pemeriksaan_santri ON pemeriksaan_santri(santri_id, tanggal);
CREATE INDEX idx_program_kegiatan ON program_kegiatan(tenant_id, tgl_mulai);
CREATE INDEX idx_surat_masuk ON surat_masuk(tenant_id, tanggal_terima);
CREATE INDEX idx_surat_keluar ON surat_keluar(tenant_id, tanggal_surat);
```
