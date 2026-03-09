# SYSTEM DESIGN — API
## PROJECT: EduVera SaaS Platform

---

## 1. API OVERVIEW

- **Protokol:** REST API via Next.js Route Handlers (`/api/*`)
- **Format:** JSON (request & response)
- **Auth:** JWT via NextAuth v5 (httpOnly cookie)
- **Tenant Isolation:** Middleware inject `tenant_id` ke semua request
- **Versioning:** `/api/v1/*` (prefix versi dari awal untuk future-proof)
- **Rate Limiting:** Upstash Redis (per IP + per user)

---

## 2. RESPONSE FORMAT STANDAR

```typescript
// SUCCESS
{
  "success": true,
  "data": { ... },
  "meta": {             // optional, untuk pagination
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

// ERROR
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nama wajib diisi",
    "fields": {         // optional, untuk validasi form
      "nama": "Nama wajib diisi",
      "email": "Format email tidak valid"
    }
  }
}

// Error Codes:
// UNAUTHORIZED        → 401
// FORBIDDEN           → 403
// NOT_FOUND           → 404
// VALIDATION_ERROR    → 422
// TENANT_SUSPENDED    → 403
// MODULE_DISABLED     → 403
// SERVER_ERROR        → 500
```

---

## 3. API — AUTENTIKASI & TENANT

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/change-password
GET    /api/v1/auth/me                    → profil + role + permissions

GET    /api/v1/tenant/config              → konfigurasi tenant (modul aktif, setting)
PATCH  /api/v1/tenant/config              → update config (Admin only)
GET    /api/v1/tenant/profil              → profil institusi
PATCH  /api/v1/tenant/profil             → update profil + logo
```

---

## 4. API — OWNER PANEL

```
// Tenant Management
GET    /api/v1/owner/tenants              → list semua tenant
POST   /api/v1/owner/tenants             → buat tenant baru
GET    /api/v1/owner/tenants/:id         → detail tenant
PATCH  /api/v1/owner/tenants/:id         → update tenant (status, modul, plan)
POST   /api/v1/owner/tenants/:id/suspend → suspend tenant
POST   /api/v1/owner/tenants/:id/aktifkan→ reaktivasi tenant

// Feature Flags
GET    /api/v1/owner/tenants/:id/flags   → semua feature flags
PATCH  /api/v1/owner/tenants/:id/flags   → update feature flags

// Billing
GET    /api/v1/owner/billing             → semua tagihan langganan
PATCH  /api/v1/owner/billing/:id/konfirmasi → konfirmasi pembayaran manual

// Monitoring
GET    /api/v1/owner/logs                → activity log + security log
GET    /api/v1/owner/stats               → statistik platform global
```

---

## 5. API — PESANTREN: DATA SANTRI

```
// Santri
GET    /api/v1/pesantren/santri                    → list santri (filter: status, marhalah)
POST   /api/v1/pesantren/santri                    → tambah santri
GET    /api/v1/pesantren/santri/:id               → detail santri
PATCH  /api/v1/pesantren/santri/:id               → update santri
PATCH  /api/v1/pesantren/santri/:id/status        → aktif/nonaktif/arsip

// Wali Santri
GET    /api/v1/pesantren/santri/:id/wali          → list wali
POST   /api/v1/pesantren/santri/:id/wali          → tambah wali
PATCH  /api/v1/pesantren/santri/:id/wali/:waliId  → update wali
DELETE /api/v1/pesantren/santri/:id/wali/:waliId  → hapus wali

// Marhalah
GET    /api/v1/pesantren/marhalah                 → list marhalah
POST   /api/v1/pesantren/marhalah                 → tambah marhalah
PATCH  /api/v1/pesantren/marhalah/:id             → update marhalah

// Tahun Ajaran
GET    /api/v1/pesantren/tahun-ajaran             → list
POST   /api/v1/pesantren/tahun-ajaran             → buat
PATCH  /api/v1/pesantren/tahun-ajaran/:id/aktifkan→ set aktif
```

---

## 6. API — PESANTREN: ASRAMA

```
// Asrama
GET    /api/v1/pesantren/asrama                    → list asrama + kapasitas
POST   /api/v1/pesantren/asrama                    → tambah asrama
GET    /api/v1/pesantren/asrama/:id               → detail + daftar kamar
PATCH  /api/v1/pesantren/asrama/:id               → update asrama

// Kamar
GET    /api/v1/pesantren/asrama/:id/kamar          → list kamar
POST   /api/v1/pesantren/asrama/:id/kamar          → tambah kamar
PATCH  /api/v1/pesantren/asrama/:id/kamar/:kamarId → update kamar
GET    /api/v1/pesantren/asrama/:id/kamar/:kamarId/santri → santri di kamar

// Penempatan
GET    /api/v1/pesantren/penempatan                → list penempatan aktif
POST   /api/v1/pesantren/penempatan                → assign santri ke kamar
POST   /api/v1/pesantren/penempatan/:id/mutasi     → mutasi kamar

// Absensi Asrama
GET    /api/v1/pesantren/asrama/absensi            → list absensi (filter: tanggal, sesi)
POST   /api/v1/pesantren/asrama/absensi            → input absensi (bulk per kamar)
GET    /api/v1/pesantren/asrama/absensi/rekap      → rekap per santri/asrama
```

---

## 7. API — PESANTREN: KEPESANTRENAN

```
// Tata Tertib
GET    /api/v1/pesantren/tata-tertib               → list aturan
POST   /api/v1/pesantren/tata-tertib               → tambah aturan
PATCH  /api/v1/pesantren/tata-tertib/:id           → update aturan

// Jenis Pelanggaran
GET    /api/v1/pesantren/pelanggaran/jenis         → list jenis + poin
POST   /api/v1/pesantren/pelanggaran/jenis         → tambah jenis
PATCH  /api/v1/pesantren/pelanggaran/jenis/:id     → update jenis

// Riwayat Pelanggaran
GET    /api/v1/pesantren/pelanggaran               → list (filter: santri, level, periode)
POST   /api/v1/pesantren/pelanggaran               → input pelanggaran
GET    /api/v1/pesantren/pelanggaran/:id           → detail
PATCH  /api/v1/pesantren/pelanggaran/:id/selesai   → tandai diselesaikan
GET    /api/v1/pesantren/santri/:id/poin           → total poin akumulatif santri

// Perizinan
GET    /api/v1/pesantren/izin                      → list (filter: status, santri)
POST   /api/v1/pesantren/izin                      → ajukan izin
GET    /api/v1/pesantren/izin/:id                  → detail
PATCH  /api/v1/pesantren/izin/:id/approve          → setujui
PATCH  /api/v1/pesantren/izin/:id/tolak            → tolak

// Catatan Musyrif
GET    /api/v1/pesantren/catatan-musyrif            → list catatan
POST   /api/v1/pesantren/catatan-musyrif            → tambah catatan
GET    /api/v1/pesantren/santri/:id/catatan         → catatan per santri
```

---

## 8. API — PESANTREN: TAHFIDZ

```
// Target Hafalan
GET    /api/v1/pesantren/tahfidz/target            → list target (marhalah/santri)
POST   /api/v1/pesantren/tahfidz/target            → set target marhalah
POST   /api/v1/pesantren/tahfidz/target/override   → override target per santri

// Setoran Hafalan
GET    /api/v1/pesantren/tahfidz/setoran           → list (filter: santri, ustadz, tgl)
POST   /api/v1/pesantren/tahfidz/setoran           → input setoran
GET    /api/v1/pesantren/santri/:id/progress       → progres hafalan santri
GET    /api/v1/pesantren/tahfidz/rekap-pekanan     → rekap per pekan (auto-kalkulasi)
GET    /api/v1/pesantren/tahfidz/rekap-bulanan     → rekap per bulan

// Penilaian Tahfidz
GET    /api/v1/pesantren/tahfidz/nilai             → list (filter: santri, semester)
POST   /api/v1/pesantren/tahfidz/nilai             → input nilai
PATCH  /api/v1/pesantren/tahfidz/nilai/:id/validasi→ admin validasi nilai
GET    /api/v1/pesantren/tahfidz/laporan           → laporan per santri/marhalah/ustadz
```

---

## 9. API — PESANTREN: DINIYAH

```
// Kitab
GET    /api/v1/pesantren/kitab                     → list kitab
POST   /api/v1/pesantren/kitab                     → tambah kitab
PATCH  /api/v1/pesantren/kitab/:id                 → update kitab

// Halaqah
GET    /api/v1/pesantren/halaqah                   → list (filter: marhalah, ustadz)
POST   /api/v1/pesantren/halaqah                   → buat halaqah
GET    /api/v1/pesantren/halaqah/:id               → detail + anggota
PATCH  /api/v1/pesantren/halaqah/:id               → update halaqah
POST   /api/v1/pesantren/halaqah/:id/santri        → assign santri ke halaqah

// Absensi Diniyah
GET    /api/v1/pesantren/diniyah/absensi           → list (filter: halaqah, tgl)
POST   /api/v1/pesantren/diniyah/absensi           → input absensi
GET    /api/v1/pesantren/diniyah/absensi/rekap     → rekap per santri/halaqah

// Penilaian Diniyah
GET    /api/v1/pesantren/diniyah/nilai             → list
POST   /api/v1/pesantren/diniyah/nilai             → input nilai
PATCH  /api/v1/pesantren/diniyah/nilai/:id/validasi→ validasi
```

---

## 10. API — PESANTREN: E-RAPOR

```
GET    /api/v1/pesantren/rapor                     → list rapor (filter: santri, ta, semester)
GET    /api/v1/pesantren/rapor/kelengkapan         → cek kelengkapan nilai sebelum generate
POST   /api/v1/pesantren/rapor/generate            → generate rapor (single/bulk trigger Inngest)
GET    /api/v1/pesantren/rapor/:id                 → detail rapor
GET    /api/v1/pesantren/rapor/:id/preview         → preview PDF (signed URL)
POST   /api/v1/pesantren/rapor/:id/publish         → publish rapor
GET    /api/v1/pesantren/rapor/:id/download        → download PDF (signed URL)
GET    /api/v1/pesantren/rapor/arsip               → arsip semua rapor
```

---

## 11. API — PESANTREN: KEUANGAN

```
// COA
GET    /api/v1/pesantren/keuangan/coa              → list COA
POST   /api/v1/pesantren/keuangan/coa              → tambah COA
PATCH  /api/v1/pesantren/keuangan/coa/:id          → update COA

// SPP & Tagihan
GET    /api/v1/pesantren/keuangan/spp              → list tagihan (filter: periode, status)
POST   /api/v1/pesantren/keuangan/spp/generate     → generate tagihan bulanan
GET    /api/v1/pesantren/keuangan/spp/:id          → detail tagihan
POST   /api/v1/pesantren/keuangan/spp/:id/konfirmasi → konfirmasi bayar
GET    /api/v1/pesantren/santri/:id/tagihan        → riwayat tagihan per santri

// Transaksi
GET    /api/v1/pesantren/keuangan/transaksi        → list (filter: tipe, kategori, periode)
POST   /api/v1/pesantren/keuangan/transaksi/masuk  → catat pemasukan
POST   /api/v1/pesantren/keuangan/transaksi/keluar → catat pengeluaran

// Anggaran
GET    /api/v1/pesantren/keuangan/anggaran         → list + realisasi
POST   /api/v1/pesantren/keuangan/anggaran         → buat anggaran
PATCH  /api/v1/pesantren/keuangan/anggaran/:id     → update anggaran

// Laporan
GET    /api/v1/pesantren/keuangan/laporan/kas      → laporan kas (query: periode)
GET    /api/v1/pesantren/keuangan/laporan/anggaran → laporan anggaran vs realisasi
GET    /api/v1/pesantren/keuangan/laporan/audit    → audit trail keuangan
POST   /api/v1/pesantren/keuangan/laporan/export   → trigger export PDF/Excel (Inngest)
```

---

## 12. API — PESANTREN: SDM (SEKRETARIS)

```
// Data SDM
GET    /api/v1/pesantren/sdm                       → list (filter: tipe, unit)
POST   /api/v1/pesantren/sdm                       → tambah SDM
GET    /api/v1/pesantren/sdm/:id                   → detail SDM
PATCH  /api/v1/pesantren/sdm/:id                   → update SDM

// Absensi SDM
GET    /api/v1/pesantren/sdm/absensi               → list (filter: tanggal, sdm)
POST   /api/v1/pesantren/sdm/absensi               → input absensi harian (bulk)
GET    /api/v1/pesantren/sdm/absensi/rekap         → rekap bulanan
POST   /api/v1/pesantren/sdm/absensi/kunci         → kunci rekap bulanan

// Honor
GET    /api/v1/pesantren/sdm/honor                 → kalkulasi honor (query: periode)
POST   /api/v1/pesantren/sdm/honor/setujui         → approve honor → kirim ke keuangan
GET    /api/v1/pesantren/sdm/honor/riwayat         → riwayat pembayaran
GET    /api/v1/pesantren/sdm/:id/slip-honor        → slip honor per SDM

// Pengumuman
GET    /api/v1/pesantren/pengumuman                → list pengumuman
POST   /api/v1/pesantren/pengumuman                → buat pengumuman
GET    /api/v1/pesantren/pengumuman/:id/log        → log pengiriman
```

---

## 13. API — SEKOLAH (SUMMARY)

> Pattern sama dengan Pesantren, hanya prefix berbeda dan entity berbeda.

```
// Data Akademik
GET/POST/PATCH /api/v1/sekolah/siswa/*
GET/POST/PATCH /api/v1/sekolah/guru/*
GET/POST/PATCH /api/v1/sekolah/staf/*
GET/POST/PATCH /api/v1/sekolah/mapel/*
GET/POST/PATCH /api/v1/sekolah/jenjang/*
GET/POST/PATCH /api/v1/sekolah/jurusan/*         (SMK)

// Kelas & Pembelajaran
GET/POST/PATCH /api/v1/sekolah/kelas/*
GET/POST/PATCH /api/v1/sekolah/kelas/:id/siswa
GET/POST/PATCH /api/v1/sekolah/penugasan-guru/*
GET/POST/PATCH /api/v1/sekolah/jadwal/*
GET/POST       /api/v1/sekolah/absensi-siswa/*

// Kurikulum & Nilai
GET/POST/PATCH /api/v1/sekolah/kurikulum/*
GET/POST/PATCH /api/v1/sekolah/komponen-nilai/*
GET/POST/PATCH /api/v1/sekolah/nilai/*
GET/POST       /api/v1/sekolah/rapor/*

// Keuangan Sekolah
GET/POST/PATCH /api/v1/sekolah/keuangan/coa/*
GET/POST/PATCH /api/v1/sekolah/keuangan/spp/*
GET/POST       /api/v1/sekolah/keuangan/transaksi/*
GET/POST/PATCH /api/v1/sekolah/keuangan/rapbs/*
GET            /api/v1/sekolah/keuangan/laporan/*

// SDM & TU
GET/POST/PATCH /api/v1/sekolah/pegawai/*
GET/POST       /api/v1/sekolah/absensi-pegawai/*
GET/POST/PATCH /api/v1/sekolah/komponen-gaji/*
GET/POST       /api/v1/sekolah/slip-gaji/*
GET/POST       /api/v1/sekolah/pengumuman/*
```

---

## 14. API — PORTAL SISWA & SANTRI (Read-Only)

```
GET  /api/v1/portal/siswa/profil               → profil siswa login
GET  /api/v1/portal/siswa/jadwal               → jadwal pelajaran
GET  /api/v1/portal/siswa/absensi              → riwayat absensi diri sendiri
GET  /api/v1/portal/siswa/nilai                → nilai per mapel
GET  /api/v1/portal/siswa/rapor                → list rapor yang published
GET  /api/v1/portal/siswa/rapor/:id/download   → download rapor

GET  /api/v1/portal/santri/profil
GET  /api/v1/portal/santri/absensi-asrama      → riwayat absensi asrama
GET  /api/v1/portal/santri/hafalan             → progress tahfidz
GET  /api/v1/portal/santri/rapor
GET  /api/v1/portal/santri/rapor/:id/download
```

---

## 15. API — PORTAL WALI (Read-Only)

```
GET  /api/v1/portal/wali/anak                  → list anak terdaftar
GET  /api/v1/portal/wali/anak/:id/profil
GET  /api/v1/portal/wali/anak/:id/absensi
GET  /api/v1/portal/wali/anak/:id/tagihan      → tagihan SPP anak
GET  /api/v1/portal/wali/anak/:id/rapor
GET  /api/v1/portal/wali/anak/:id/rapor/:rapId/download
GET  /api/v1/portal/wali/pengumuman            → pengumuman untuk wali
```

---

## 16. API — SYSTEM

```
// SSE (Realtime Dashboard)
GET  /api/v1/sse                               → SSE connection (tenant-scoped)

// File Upload
POST /api/v1/upload/logo                       → upload logo institusi → R2
POST /api/v1/upload/dokumen                    → upload dokumen (bukti bayar, dll) → R2
GET  /api/v1/upload/signed-url                 → generate signed URL untuk download

// Inngest Webhook
POST /api/inngest                              → Inngest event handler (internal)

// Health Check
GET  /api/health                               → status sistem
```

---

## 17. MIDDLEWARE STACK

```
Request masuk
     │
     ▼
[1] Rate Limiter (Upstash Redis)
     │  → 429 jika melebihi limit
     ▼
[2] CORS Handler
     │
     ▼
[3] Tenant Resolver (dari subdomain)
     │  → 404 jika tenant tidak ditemukan
     │  → 403 jika tenant suspend
     ▼
[4] Auth Checker (NextAuth session)
     │  → 401 jika tidak login
     ▼
[5] Permission Checker (RBAC)
     │  → 403 jika tidak punya akses
     ▼
[6] Module Checker
     │  → 403 jika modul tidak aktif di tenant
     ▼
[7] Prisma Middleware (inject tenant_id)
     │
     ▼
Handler / Server Action
     │
     ▼
[8] Audit Trail Logger (async, tidak block response)
     │
     ▼
Response ke Client
```

---

## 18. API ENDPOINTS TAMBAHAN — MENU BARU

```
// ============================================================
// EKSTRAKURIKULER (SEKOLAH)
// ============================================================
GET    /api/v1/sekolah/ekskul                          → list ekskul + filter
POST   /api/v1/sekolah/ekskul                          → tambah ekskul
GET    /api/v1/sekolah/ekskul/:id                      → detail ekskul
PUT    /api/v1/sekolah/ekskul/:id                      → edit ekskul
PATCH  /api/v1/sekolah/ekskul/:id/status               → aktif/nonaktif

GET    /api/v1/sekolah/ekskul/:id/anggota              → list anggota
POST   /api/v1/sekolah/ekskul/:id/anggota              → assign siswa ke ekskul
DELETE /api/v1/sekolah/ekskul/:id/anggota/:siswaId     → remove anggota

GET    /api/v1/sekolah/ekskul/:id/absensi              → list absensi per tanggal
POST   /api/v1/sekolah/ekskul/:id/absensi              → input absensi massal
GET    /api/v1/sekolah/ekskul/:id/absensi/rekap        → rekap kehadiran

GET    /api/v1/sekolah/ekskul/:id/nilai                → list nilai anggota
POST   /api/v1/sekolah/ekskul/:id/nilai                → input/update nilai ekskul

// ============================================================
// BIMBINGAN KONSELING (SEKOLAH)
// ============================================================
GET    /api/v1/sekolah/bk                              → list catatan BK (filter role)
POST   /api/v1/sekolah/bk                              → tambah catatan BK
GET    /api/v1/sekolah/bk/:id                          → detail catatan
PUT    /api/v1/sekolah/bk/:id                          → edit catatan
PATCH  /api/v1/sekolah/bk/:id/status                   → update status tindak lanjut
GET    /api/v1/sekolah/bk/siswa/:siswaId               → histori BK per siswa
GET    /api/v1/sekolah/bk/laporan                      → laporan BK per periode/kategori

// ============================================================
// MUTASI SISWA (SEKOLAH)
// ============================================================
GET    /api/v1/sekolah/mutasi-siswa                    → list mutasi + filter
POST   /api/v1/sekolah/mutasi-siswa/masuk              → input siswa pindah masuk
POST   /api/v1/sekolah/mutasi-siswa/keluar             → input siswa pindah keluar
GET    /api/v1/sekolah/mutasi-siswa/:siswaId/riwayat   → riwayat mutasi per siswa

// ============================================================
// KENAIKAN KELAS (SEKOLAH)
// ============================================================
GET    /api/v1/sekolah/kenaikan-kelas                  → list siswa + status naik/tinggal
PUT    /api/v1/sekolah/kenaikan-kelas/:siswaId         → set status naik/tinggal/lulus
POST   /api/v1/sekolah/kenaikan-kelas/konfirmasi       → konfirmasi massal kenaikan kelas
GET    /api/v1/sekolah/kenaikan-kelas/riwayat          → riwayat per tahun ajaran

// ============================================================
// INVENTARIS & SARPRAS (SEKOLAH)
// ============================================================
GET    /api/v1/sekolah/inventaris                      → list inventaris + filter kondisi
POST   /api/v1/sekolah/inventaris                      → tambah barang
PUT    /api/v1/sekolah/inventaris/:id                  → edit barang
PATCH  /api/v1/sekolah/inventaris/:id/kondisi          → update kondisi barang

GET    /api/v1/sekolah/pengadaan                       → list rencana pengadaan
POST   /api/v1/sekolah/pengadaan                       → tambah rencana pengadaan
PATCH  /api/v1/sekolah/pengadaan/:id/realisasi         → realisasi pengadaan → link ke transaksi

// ============================================================
// SURAT MENYURAT (SEKOLAH & PESANTREN)
// ============================================================
// Sekolah
GET    /api/v1/sekolah/surat/masuk                     → list surat masuk
POST   /api/v1/sekolah/surat/masuk                     → catat surat masuk
PATCH  /api/v1/sekolah/surat/masuk/:id/disposisi       → disposisi surat
GET    /api/v1/sekolah/surat/keluar                    → list surat keluar
POST   /api/v1/sekolah/surat/keluar                    → buat surat keluar (nomor auto)
GET    /api/v1/sekolah/surat/keterangan                → generate surat keterangan siswa
POST   /api/v1/sekolah/surat/keterangan/generate       → render + PDF surat keterangan

// Pesantren
GET    /api/v1/pesantren/surat/masuk                   → list surat masuk
POST   /api/v1/pesantren/surat/masuk                   → catat surat masuk
PATCH  /api/v1/pesantren/surat/masuk/:id/disposisi     → disposisi surat
GET    /api/v1/pesantren/surat/keluar                  → list surat keluar
POST   /api/v1/pesantren/surat/keluar                  → buat surat keluar
GET    /api/v1/pesantren/surat/keterangan/generate     → generate surat keterangan santri

// ============================================================
// MUTASI SANTRI (PESANTREN)
// ============================================================
GET    /api/v1/pesantren/mutasi-santri                 → list mutasi + filter
POST   /api/v1/pesantren/mutasi-santri/masuk           → input santri masuk dari pesantren lain
POST   /api/v1/pesantren/mutasi-santri/keluar          → input santri keluar/lulus
GET    /api/v1/pesantren/mutasi-santri/:santriId/riwayat → riwayat mutasi per santri

// ============================================================
// KENAIKAN MARHALAH (PESANTREN)
// ============================================================
GET    /api/v1/pesantren/kenaikan-marhalah             → list santri + status
PUT    /api/v1/pesantren/kenaikan-marhalah/:santriId   → set status naik/tetap/lulus
POST   /api/v1/pesantren/kenaikan-marhalah/konfirmasi  → konfirmasi massal
GET    /api/v1/pesantren/kenaikan-marhalah/riwayat     → riwayat per tahun hijriah

// ============================================================
// KESEHATAN SANTRI (PESANTREN)
// ============================================================
GET    /api/v1/pesantren/kesehatan/pemeriksaan         → list pemeriksaan + filter
POST   /api/v1/pesantren/kesehatan/pemeriksaan         → input pemeriksaan
PUT    /api/v1/pesantren/kesehatan/pemeriksaan/:id     → edit
PATCH  /api/v1/pesantren/kesehatan/pemeriksaan/:id/status → update status (sembuh/dirujuk)
GET    /api/v1/pesantren/kesehatan/santri/:santriId    → rekam medis per santri

GET    /api/v1/pesantren/kesehatan/stok-obat           → list stok obat
POST   /api/v1/pesantren/kesehatan/stok-obat           → tambah/update stok
POST   /api/v1/pesantren/kesehatan/stok-obat/:id/keluar → catat penggunaan obat

GET    /api/v1/pesantren/kesehatan/rujukan             → list rujukan RS
POST   /api/v1/pesantren/kesehatan/rujukan             → catat rujukan
PATCH  /api/v1/pesantren/kesehatan/rujukan/:id         → update tindak lanjut

// ============================================================
// PROGRAM KEGIATAN (PESANTREN)
// ============================================================
GET    /api/v1/pesantren/program-kegiatan              → list program + filter status
POST   /api/v1/pesantren/program-kegiatan              → buat program baru
GET    /api/v1/pesantren/program-kegiatan/:id          → detail program
PUT    /api/v1/pesantren/program-kegiatan/:id          → edit program
PATCH  /api/v1/pesantren/program-kegiatan/:id/status   → update status (berlangsung/selesai)

POST   /api/v1/pesantren/program-kegiatan/:id/panitia  → assign panitia SDM
DELETE /api/v1/pesantren/program-kegiatan/:id/panitia/:sdmId → remove panitia

POST   /api/v1/pesantren/program-kegiatan/:id/peserta  → assign peserta santri
DELETE /api/v1/pesantren/program-kegiatan/:id/peserta/:santriId → remove peserta

GET    /api/v1/pesantren/program-kegiatan/:id/agenda   → list rundown agenda
POST   /api/v1/pesantren/program-kegiatan/:id/agenda   → tambah agenda
PUT    /api/v1/pesantren/program-kegiatan/:id/agenda/:agendaId → edit agenda

POST   /api/v1/pesantren/program-kegiatan/:id/laporan  → upload dokumentasi/evaluasi
```
