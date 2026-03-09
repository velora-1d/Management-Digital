# FLOW GLOBAL — EduVera SaaS Platform

---

## A. USER FLOW — REGISTRASI & ONBOARDING TENANT

```
[Calon Tenant]
     │
     ▼
Landing Page (eduvera.id)
     │
     ├── Klik [Daftar Sekarang]
     │
     ▼
STEP 1 — Pilih Jenis Institusi
     ├── Sekolah
     ├── Pesantren
     └── Hybrid (Sekolah + Pesantren)
     │
     ▼
STEP 2 — Input Data Tenant
     ├── Nama Institusi
     ├── Email Admin Utama
     ├── Nomor WhatsApp Admin
     └── Alamat Institusi
     │
     ▼
STEP 3 — Input Subdomain
     ├── Input: [nama].eduvera.id
     ├── Sistem cek ketersediaan REALTIME
     ├── Jika BENTROK → tampilkan rekomendasi alternatif
     └── Jika VALID → lanjut
     │
     ▼
STEP 4 — Pilih Modul (Checklist)
     ├── Modul Sekolah (jika dipilih)
     ├── Modul Pesantren (jika dipilih)
     └── Add-on (WA Gateway, Notifikasi, dll)
     │
     ▼
STEP 5 — Review & Ringkasan
     ├── Ringkasan data tenant
     ├── Modul aktif
     └── Klik [Daftar]
     │
     ▼
STEP 6 — Approval Manual (Owner EduVera)
     ├── Owner review data tenant
     ├── Konfirmasi pembayaran (manual fase awal)
     └── Klik [Aktifkan Tenant]
     │
     ▼
STEP 7 — Aktivasi Otomatis
     ├── Sistem provisioning tenant
     ├── Subdomain aktif
     ├── Modul di-enable sesuai checklist
     └── Akun Admin digenerate
     │
     ▼
STEP 8 — Distribusi Akses
     ├── Email → URL login, username, password sementara
     └── WA → Notifikasi aktivasi + link login
     │
     ▼
FIRST LOGIN — Admin Tenant
     ├── Wajib ganti password
     ├── Lengkapi profil institusi
     ├── Setup tahun ajaran / hijriah
     ├── Setup kurikulum (placeholder)
     └── Masuk ke aplikasi
```

---

## B. SYSTEM FLOW — PROVISIONING TENANT

```
[Owner klik Aktifkan Tenant]
          │
          ▼
    Validasi data tenant
          │
          ▼
    Generate tenant_id (UUID)
          │
          ▼
    Buat schema database tenant
    (isolated per tenant di Aiven PostgreSQL)
          │
          ▼
    Enable modul sesuai checklist
    (feature_flags per tenant)
          │
          ▼
    Register subdomain
    (DNS record via Cloudflare API)
          │
          ▼
    Generate akun Admin Utama
    (hash password sementara, simpan ke DB)
          │
          ▼
    Trigger notifikasi (Inngest Job)
    ├── Kirim Email (via Resend)
    └── Kirim WA (via Fonnte/WaBlas)
          │
          ▼
    Status tenant → AKTIF
    Log aktivitas tersimpan di audit_trail
```

---

## C. USER FLOW — LOGIN & AUTENTIKASI

```
[User]
  │
  ▼
Buka [tenant].eduvera.id
  │
  ▼
Halaman Login
  ├── Input Email + Password
  └── Klik [Masuk]
  │
  ▼
Sistem Validasi
  ├── Cek tenant aktif/suspend
  ├── Cek user aktif
  ├── Validasi password
  └── Cek role user
  │
  ├── GAGAL → tampilkan pesan error
  │
  └── BERHASIL
        │
        ▼
   Generate session token (NextAuth)
        │
        ▼
   Redirect ke Dashboard
   (sesuai role user)
```

---

## D. SYSTEM FLOW — SUSPEND & REAKTIVASI TENANT

```
[Owner — Suspend Tenant]
        │
        ▼
   Update status tenant → SUSPEND
        │
        ▼
   Force logout semua user tenant
   (invalidate semua session)
        │
        ▼
   API tenant diblok (middleware)
        │
        ▼
   Kirim notifikasi ke Admin Tenant
   (Email + WA)

─────────────────────────────────────────

[Owner — Reaktivasi Tenant]
        │
        ▼
   Update status tenant → AKTIF
        │
        ▼
   Buka akses API kembali
        │
        ▼
   Kirim notifikasi reaktivasi
   ke Admin Tenant
```

---

## E. USER FLOW — OWNER PANEL (Internal EduVera)

```
[Owner Login → app.eduvera.id]
        │
        ▼
Dashboard Global
├── Total tenant, revenue, health system
│
├── Manajemen Tenant
│   ├── Lihat semua tenant
│   ├── Klik tenant → detail
│   │   ├── Status (Trial/Aktif/Suspend)
│   │   ├── Modul aktif
│   │   ├── Log aktivitas
│   │   └── Aksi: Suspend / Aktifkan / Edit Modul
│   └── Feature Flag per tenant
│
├── Billing Manual
│   ├── Lihat daftar pembayaran pending
│   ├── Konfirmasi pembayaran
│   └── Update status tenant
│
├── WA Gateway Master
│   ├── Konfigurasi device
│   ├── Template pesan global
│   └── Log pengiriman
│
├── Audit & Log
│   ├── Login log
│   ├── Activity log
│   └── Security log
│
└── System Setting
    ├── Domain & subdomain config
    ├── Email config (Resend)
    └── Backup setting
```

---

## F. USER FLOW — SUPER ADMIN (Pemilik Yayasan)

```
[Super Admin Login → app.eduvera.id/yayasan]
        │
        ▼
Dashboard Yayasan
├── Ringkasan semua tenant miliknya
│   ├── Status per tenant
│   ├── Jumlah siswa/santri per tenant
│   └── Ringkasan keuangan lintas tenant
│
├── Tenant Saya
│   ├── List semua tenant
│   ├── Klik tenant → redirect ke tenant app
│   └── Monitor modul aktif per tenant
│
├── Laporan Lintas Tenant
│   ├── Akademik (aggregasi semua tenant)
│   ├── Keuangan
│   └── SDM
│
└── Setting Yayasan
    ├── Profil yayasan
    └── Manajemen akun
```
