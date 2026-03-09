# SECURITY
## PROJECT: EduVera SaaS Platform

---

## 1. PRINSIP KEAMANAN

EduVera menyimpan data sensitif siswa, santri, keuangan, dan personal. Prinsip keamanan yang diterapkan:

1. **Defense in Depth** → keamanan berlapis (middleware, DB, API, UI)
2. **Least Privilege** → setiap role hanya akses apa yang diperlukan
3. **Tenant Isolation** → data satu tenant tidak boleh bocor ke tenant lain
4. **Immutable Audit** → semua aksi tercatat dan tidak bisa dihapus
5. **Secure by Default** → fitur baru default tertutup, perlu diaktifkan eksplisit

---

## 2. AUTENTIKASI

### 2.1 Login
```
- Provider: Email + Password (Credentials)
- Password hashing: bcrypt (cost factor 12)
- Session: JWT disimpan di httpOnly cookie (tidak accessible dari JS)
- Session expiry: 8 jam aktif, 30 hari remember me
- JWT secret: rotate setiap 90 hari (via env variable)
```

### 2.2 Proteksi Brute Force
```
- Rate limit login: max 5 percobaan gagal per 15 menit per IP
- Setelah 5 gagal: akun di-lock 15 menit otomatis
- Log semua percobaan login gagal ke audit_trail
- Alert ke Owner jika ada brute force pattern terdeteksi
```

### 2.3 Password Policy
```
- Minimum 8 karakter
- Harus ada: huruf besar, huruf kecil, angka
- Tidak boleh sama dengan 3 password terakhir
- Wajib ganti password saat first login (credential baru)
- Expired password: belum diterapkan di MVP
```

### 2.4 Two-Factor Authentication (Post-MVP)
```
- TOTP via Google Authenticator / Authy
- Wajib untuk role: Owner, Super Admin
- Opsional untuk: Admin Tenant, Kepala Sekolah
```

---

## 3. OTORISASI (RBAC)

### 3.1 Permission Check Berlapis
```
Layer 1 — Middleware (Route Level):
  Cek apakah user punya akses ke route ini.
  Jika tidak → 403 Forbidden

Layer 2 — Server Action / API Handler:
  Cek permission spesifik per aksi
  (misal: keuangan:write, rapor:publish)

Layer 3 — Database Level:
  Semua query otomatis filter tenant_id
  (Prisma middleware — tidak bisa bypass dari UI)

Layer 4 — UI Level:
  Sembunyikan menu/tombol yang tidak punya akses
  (UX improvement, bukan security layer utama)
```

### 3.2 Permission Matrix Utama
```
                    Owner  SuperAdmin  Admin  KS/Mudir  Guru  Bendahara  TU  Siswa  Wali
Tenant Management    ✓       ✓(own)     -       -        -       -        -    -      -
User Management      ✓        -         ✓       -        -       -        -    -      -
Feature Flags        ✓        -         -       -        -       -        -    -      -
Data Akademik        ✓        R          ✓       R        R       -        R    -      -
Input Nilai          -        -         -       -        ✓       -        -    -      -
Validasi Nilai       -        -         ✓       ✓        -       -        -    -      -
Publish Rapor        -        -         ✓       ✓        -       -        -    -      -
Keuangan             -        -         ✓       R        -       ✓        R    -      -
SDM/Gaji             -        -         ✓       R        -       R        ✓    -      -
Audit Trail          ✓        -         ✓       R        -       -        -    -      -
Portal Siswa         -        -         -       -        -       -        -    R      -
Portal Wali          -        -         -       -        -       -        -    -      R

R = Read Only, ✓ = Full Access, - = No Access
```

---

## 4. TENANT ISOLATION

### 4.1 Database Isolation
```typescript
// Prisma middleware WAJIB — tidak bisa di-bypass
// Semua query otomatis di-filter tenant_id

prisma.$use(async (params, next) => {
  const tenantId = getContextTenantId()

  // Jika tenantId tidak ada → REJECT
  if (!tenantId && params.model !== 'Tenant') {
    throw new Error('TENANT_CONTEXT_MISSING')
  }

  // Auto-inject tenant_id di semua query
  if (params.action === 'findMany') {
    params.args.where = { ...params.args.where, tenant_id: tenantId }
  }
  if (params.action === 'create') {
    params.args.data = { ...params.args.data, tenant_id: tenantId }
  }

  return next(params)
})
```

### 4.2 File Storage Isolation
```
Cloudflare R2 path selalu prefix dengan tenant_id:
/{tenant_id}/rapor/...
/{tenant_id}/logo/...

Signed URL hanya di-generate oleh server setelah
verifikasi bahwa file path sesuai tenant user yang login.
Tidak ada public URL langsung untuk file sensitif.
```

### 4.3 API Isolation
```
Setiap request ke API:
1. Middleware extract tenant dari subdomain
2. Inject tenant_id ke request context
3. Semua query otomatis ter-filter (Prisma middleware)
4. Cross-tenant request → 403 Forbidden
```

---

## 5. INPUT VALIDATION & SANITASI

### 5.1 Validasi di Semua Layer
```
Layer 1 — Frontend:
  React Hook Form + Zod schema
  Validasi sisi client untuk UX

Layer 2 — API Handler / Server Action:
  Zod schema validation wajib sebelum proses
  Reject request jika tidak valid → return error

Layer 3 — Database:
  Prisma type safety
  Database constraints (NOT NULL, UNIQUE, FK)
```

### 5.2 Perlindungan Injeksi
```
- SQL Injection: Prisma ORM pakai parameterized query → aman by default
- XSS: Next.js auto-escape HTML, shadcn/ui tidak pakai dangerouslySetInnerHTML
- CSRF: NextAuth v5 menangani CSRF token untuk semua form mutation
- Path Traversal: validasi file upload path (tidak boleh ada ../ di path)
```

### 5.3 File Upload
```
- Tipe file yang diizinkan: jpg, jpeg, png, pdf, xlsx (tergantung konteks)
- Ukuran maksimal: 5MB per file
- Validasi MIME type di server (bukan hanya ekstensi)
- File upload ke R2, bukan ke server langsung
- Scan virus: post-MVP (Cloudflare WARP / ClamAV via Lambda)
```

---

## 6. KOMUNIKASI & TRANSPORT SECURITY

```
- HTTPS wajib semua endpoint (Vercel enforce by default)
- HSTS header: max-age=31536000; includeSubDomains
- Redirect HTTP → HTTPS otomatis
- TLS minimum versi 1.2 (Vercel default)
- Cookie: httpOnly, Secure, SameSite=Strict
```

---

## 7. SECURITY HEADERS

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      font-src 'self' fonts.gstatic.com;
      img-src 'self' data: *.r2.cloudflarestorage.com;
      connect-src 'self' api.fonnte.com api.resend.com;
    `.replace(/\n/g, '') }
]
```

---

## 8. RATE LIMITING

```typescript
// Upstash Redis Rate Limiter

// Login endpoint:
limit: 5 req / 15 menit per IP

// API umum (per user):
limit: 100 req / 1 menit per user

// Export PDF/Excel (berat):
limit: 10 req / 1 jam per tenant

// WA/Email blast:
limit: 1 blast / 10 menit per tenant
(Inngest job handle antrian, tidak langsung kirim)

// Jika melebihi limit → 429 Too Many Requests
// Log ke audit_trail untuk security review
```

---

## 9. AUDIT TRAIL

```
Semua aksi write (CREATE, UPDATE, DELETE) wajib dicatat:

Table: audit_trail
- tenant_id
- user_id (siapa yang melakukan)
- action (CREATE/UPDATE/DELETE/PUBLISH/APPROVE/REJECT)
- table_name (model yang diubah)
- record_id (ID record yang diubah)
- old_value (JSON — nilai sebelum)
- new_value (JSON — nilai sesudah)
- ip_address (dari request header)
- created_at (timestamp, IMMUTABLE)

Rules:
- Audit trail TIDAK BISA diedit atau dihapus
- Tidak ada endpoint DELETE untuk audit_trail
- Owner bisa filter dan export audit log
- Admin Tenant bisa lihat audit log tenant mereka
- Disimpan minimal 2 tahun
```

---

## 10. DATA PRIVACY

### 10.1 Data Sensitif
```
Data yang termasuk sensitif dan perlu perlindungan ekstra:
- NIK siswa/santri/wali
- Data kesehatan (golongan darah, riwayat penyakit)
- Nominal keuangan
- Kata sandi (hashed, tidak pernah plain)
- Nomor WhatsApp
```

### 10.2 Kebijakan Data
```
- Data tenant tidak pernah diakses Owner tanpa alasan teknis
- Setiap akses Owner ke data tenant dicatat di security_log
- Data tenant yang expired/suspend: retensi 90 hari setelah expired
  lalu soft-delete (admin tenant bisa request export sebelum hapus)
- Password tidak pernah disimpan plain text
- WA number: hanya tampil 4 digit terakhir di UI non-admin
```

### 10.3 Data Backup
```
- Aiven PostgreSQL: daily backup otomatis, retensi 7 hari
- Cloudflare R2: versioning aktif untuk file rapor (immutable)
- Export manual: Admin Tenant bisa export semua datanya
```

---

## 11. MONITORING & ALERTING

```
- Sentry: error tracking realtime (exception, stack trace, user context)
- Upstash Redis: monitoring rate limit hits
- Vercel Analytics: performance monitoring
- Custom Alert (Inngest):
  → Jika ada login gagal > 10x dalam 5 menit per tenant
  → Jika ada export massal tidak wajar
  → Jika ada transaksi keuangan sangat besar (threshold tenant-specific)
  
Alert dikirim ke: Owner via Email + WA
```

---

## 12. INNGEST JOB SECURITY

```
- Semua Inngest job menggunakan signing key (INNGEST_SIGNING_KEY)
- Request ke /api/inngest diverifikasi signature
- Job payload divalidasi Zod sebelum diproses
- Job tidak bisa di-trigger dari client langsung
- Sensitive data di payload: di-encrypt atau hanya kirim ID
  (data diambil ulang dari DB di dalam job — bukan dari payload)
```
