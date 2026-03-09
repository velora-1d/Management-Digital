# SYSTEM DESIGN — ARCHITECTURE
## PROJECT: EduVera SaaS Platform

---

## 1. ARSITEKTUR OVERVIEW

EduVera menggunakan pendekatan **Modular Monolith** yang di-deploy di Vercel sebagai platform utama. Arsitektur ini dipilih karena:
- Realistis untuk tim kecil di fase MVP
- Codebase terpusat, mudah di-maintain
- Modul terpisah secara logis, siap di-extract ke microservice jika perlu
- Full Next.js 15 App Router: SSR, SSG, Server Actions, Route Handlers dalam 1 repo

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Web Browser  │  │ Mobile (PWA) │  │  Future Mobile   │  │
│  │ (Next.js)    │  │ (Post-MVP)   │  │  App (API-ready) │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 15 Application                 │    │
│  │                                                     │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │    │
│  │  │  App Router │  │   API Routes │  │  Middleware│  │    │
│  │  │  (Pages/UI) │  │ (/api/*)     │  │  (Auth,   │  │    │
│  │  │             │  │              │  │  Tenant,  │  │    │
│  │  │  - Landing  │  │  - REST API  │  │  RBAC)    │  │    │
│  │  │  - Dashboard│  │  - Webhooks  │  └───────────┘  │    │
│  │  │  - Portal   │  │  - Server    │                  │    │
│  │  └─────────────┘  │    Actions   │                  │    │
│  │                   └──────────────┘                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          │                │                   │
          ▼                ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
│   Aiven      │  │  Cloudflare  │  │      Inngest         │
│  PostgreSQL  │  │      R2      │  │  (Background Jobs)   │
│              │  │              │  │                      │
│  Multi-tenant│  │  File Storage│  │  - PDF Generate      │
│  DB (shared  │  │  - PDF Rapor │  │  - Notif WA/Email    │
│  schema +    │  │  - Logo      │  │  - Billing Reminder  │
│  row-level)  │  │  - Dokumen   │  │  - Rekap Otomatis    │
└──────────────┘  └──────────────┘  └──────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Resend  │  │  Fonnte  │  │  Upstash │  │Cloudflare │  │
│  │  (Email) │  │(WA Notif)│  │  Redis   │  │   DNS     │  │
│  └──────────┘  └──────────┘  │  (Cache/ │  │(Subdomain)│  │
│                               │  Rate    │  └───────────┘  │
│                               │  Limit)  │                  │
│                               └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. MULTI-TENANT STRATEGY

EduVera menggunakan **Shared Database + Row-Level Isolation** (Schema Tunggal):

```
┌─────────────────────────────────────────────────┐
│              Aiven PostgreSQL                    │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Table: tenants                            │  │
│  │  id | subdomain | status | plan | modules  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Table: santri                             │  │
│  │  id | tenant_id | nama | marhalah | ...    │  │
│  │  ───────────────────────────────────────── │  │
│  │  tenant_id = FK ke tenants.id              │  │
│  │  RLS: WHERE tenant_id = current_tenant     │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Semua table memiliki tenant_id                  │
│  Middleware inject tenant_id ke setiap query     │
└─────────────────────────────────────────────────┘
```

**Keuntungan:**
- Lebih mudah di-maintain (1 schema)
- Migration cukup 1x untuk semua tenant
- Biaya DB lebih efisien di MVP
- Prisma Row-Level Security (RLS) via Postgres

**Keamanan:**
- Middleware wajib inject `tenant_id` ke semua query
- Tidak ada query tanpa `tenant_id` (enforced di Prisma middleware)
- RLS policy di PostgreSQL sebagai safety net kedua

---

## 4. SUBDOMAIN ROUTING

```
Request masuk: alhikmah.eduvera.id
          │
          ▼
Vercel Edge Middleware
          │
          ▼
Extract subdomain dari hostname
          │
          ▼
Query: tenants WHERE subdomain = 'alhikmah'
          │
          ├── NOT FOUND → redirect 404
          ├── SUSPEND   → redirect /suspend-page
          └── AKTIF     → inject tenant_id ke request context
                              │
                              ▼
                         Lanjut ke App
```

**Implementasi di Next.js middleware:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const subdomain = hostname?.split('.')[0]

  // Skip untuk app.eduvera.id & eduvera.id
  if (['app', 'www', 'eduvera'].includes(subdomain)) {
    return NextResponse.next()
  }

  // Lookup tenant dari subdomain
  const tenant = await getTenantBySubdomain(subdomain)

  if (!tenant) return NextResponse.redirect('/404')
  if (tenant.status === 'SUSPEND') return NextResponse.redirect('/suspended')

  // Inject tenant ke header
  const headers = new Headers(request.headers)
  headers.set('x-tenant-id', tenant.id)
  headers.set('x-tenant-modules', JSON.stringify(tenant.modules))

  return NextResponse.next({ request: { headers } })
}
```

---

## 5. AUTHENTICATION & SESSION

```
┌──────────────────────────────────────────────────┐
│              NextAuth v5                          │
│                                                  │
│  Provider: Credentials (Email + Password)         │
│  Session: JWT (disimpan di httpOnly cookie)       │
│                                                  │
│  Session Payload:                                 │
│  {                                               │
│    userId: string                                │
│    tenantId: string                              │
│    role: string[]                                │
│    permissions: string[]                         │
│    moduleAccess: string[]                        │
│  }                                               │
└──────────────────────────────────────────────────┘

Flow Login:
User input email + password
        │
        ▼
NextAuth credentials provider
        │
        ▼
Query: users WHERE email=x AND tenant_id=x
        │
        ▼
Verify bcrypt password
        │
        ▼
Generate JWT session
(berisi role, permissions, moduleAccess)
        │
        ▼
Set httpOnly cookie
        │
        ▼
Redirect ke dashboard sesuai role
```

---

## 6. RBAC (ROLE-BASED ACCESS CONTROL)

```
┌─────────────────────────────────────────────────────┐
│                  RBAC System                         │
│                                                      │
│  Base Role → Default Permissions                     │
│  (disimpan di DB per tenant)                         │
│                                                      │
│  Contoh:                                             │
│  ┌───────────────────────────────────────────────┐   │
│  │ Role: bendahara                               │   │
│  │ Permissions:                                  │   │
│  │  - keuangan:read                              │   │
│  │  - keuangan:write                             │   │
│  │  - laporan:read                               │   │
│  │  - laporan:export                             │   │
│  │  - sdm:read (terbatas)                        │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  Tenant Admin bisa custom permission per role         │
│  Owner tidak bisa di-override                         │
│                                                      │
│  Check di:                                           │
│  1. Middleware (route-level)                         │
│  2. Server Action (action-level)                     │
│  3. UI (component-level — hide menu)                 │
└─────────────────────────────────────────────────────┘
```

---

## 7. BACKGROUND JOBS (INNGEST)

```
┌────────────────────────────────────────────────────────┐
│                     Inngest                            │
│                                                        │
│  Job 1: generate.rapor.bulk                           │
│  ├── Trigger: Admin publish rapor bulk                 │
│  ├── Logic: loop per siswa/santri                      │
│  ├── Puppeteer render PDF                              │
│  ├── Upload ke R2                                      │
│  └── Update status rapor                              │
│                                                        │
│  Job 2: notifikasi.wa.kirim                           │
│  ├── Trigger: event apapun (SPP, rapor, dll)           │
│  ├── Logic: queue per penerima                         │
│  ├── Call Fonnte API                                   │
│  ├── Retry jika gagal (max 3x)                        │
│  └── Log hasil                                         │
│                                                        │
│  Job 3: notifikasi.email.kirim                        │
│  ├── Trigger: event system                             │
│  ├── Call Resend API                                   │
│  └── Log hasil                                         │
│                                                        │
│  Job 4: spp.generate.bulanan                          │
│  ├── Trigger: Scheduled (tiap tgl 1)                  │
│  ├── Logic: generate tagihan semua tenant aktif        │
│  └── Trigger Job notifikasi WA ke wali                │
│                                                        │
│  Job 5: billing.reminder                              │
│  ├── Trigger: Scheduled (H-7, H-3, H-1 jatuh tempo)  │
│  └── Kirim notifikasi ke Admin Tenant                  │
└────────────────────────────────────────────────────────┘
```

---

## 8. CACHING STRATEGY

```
┌─────────────────────────────────────────────────┐
│           Upstash Redis (Cache)                  │
│                                                  │
│  Cache Level 1: Tenant Config                    │
│  Key: tenant:{subdomain}                         │
│  TTL: 5 menit                                    │
│  Isi: id, status, modules, plan                  │
│  (lookup setiap request subdomain routing)        │
│                                                  │
│  Cache Level 2: Dashboard Widgets                │
│  Key: dashboard:{tenant_id}:{widget}             │
│  TTL: 5 menit (auto-invalidate saat data berubah)│
│  Isi: aggregasi data dashboard                   │
│                                                  │
│  Cache Level 3: Permission per User              │
│  Key: permissions:{user_id}                      │
│  TTL: 30 menit                                   │
│  Invalidate: saat role berubah                   │
└─────────────────────────────────────────────────┘
```

---

## 9. FILE STORAGE (CLOUDFLARE R2)

```
┌─────────────────────────────────────────────────────┐
│              Cloudflare R2 Bucket                    │
│                                                      │
│  Struktur folder:                                    │
│  /{tenant_id}/                                       │
│    ├── /logo/                                        │
│    │     └── logo.png                               │
│    ├── /rapor/                                       │
│    │     ├── /2025/semester-1/                       │
│    │     │     └── {siswa_id}.pdf                   │
│    │     └── /2025/semester-2/                       │
│    ├── /slip-gaji/                                   │
│    │     └── /2025-01/{pegawai_id}.pdf              │
│    ├── /laporan/                                     │
│    └── /dokumen/                                     │
│                                                      │
│  Access:                                             │
│  - Private (signed URL, TTL 1 jam)                  │
│  - Generate signed URL saat user request download   │
│  - Logo → public URL (via Cloudflare CDN)           │
└─────────────────────────────────────────────────────┘
```

---

## 10. REALTIME (SERVER-SENT EVENTS)

```
Dashboard memerlukan data realtime untuk widget.
Menggunakan SSE (Server-Sent Events) — lebih ringan dari WebSocket
dan kompatibel dengan Vercel serverless.

Flow SSE:
Client buka koneksi ke /api/sse?tenant_id=xxx
          │
          ▼
Server kirim event awal (initial data)
          │
          ▼
Setiap ada perubahan data:
(insert/update via Prisma middleware)
          │
          ▼
Publish event ke SSE channel tenant
          │
          ▼
Client menerima event → update widget tanpa reload

Implementasi via Upstash Redis Pub/Sub:
- Setiap write ke DB → publish event ke Redis channel
- SSE handler subscribe ke channel tenant
- Forward event ke client
```

---

## 11. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL PLATFORM                           │
│                                                              │
│  Production:                                                 │
│  ├── eduvera.id          → Landing Page                     │
│  ├── app.eduvera.id      → Owner Panel                      │
│  ├── *.eduvera.id        → Tenant Apps (wildcard)           │
│  └── API Routes          → Serverless Functions             │
│                                                              │
│  Environment:                                                │
│  ├── Production  (main branch)                              │
│  ├── Staging     (staging branch)                            │
│  └── Preview     (per PR — auto deploy)                     │
│                                                              │
│  Edge Config (Vercel):                                       │
│  └── Feature flags global                                    │
└─────────────────────────────────────────────────────────────┘

CI/CD Pipeline:
Developer push ke GitHub
        │
        ▼
GitHub Actions:
├── Lint & Type Check
├── Unit Tests
├── Prisma Schema Check
└── Build Check
        │
        ▼
Vercel Auto Deploy
        │
        ▼
Prisma Migration (production)
        │
        ▼
App live
```
