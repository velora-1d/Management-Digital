# TECH STACK
## PROJECT: EduVera SaaS Platform

---

## 1. FRONTEND

| Teknologi | Versi | Fungsi | Alasan Dipilih |
|---|---|---|---|
| **Next.js** | 15 (App Router) | Framework utama | SSR, SSG, Server Actions, API Routes dalam 1 repo. Paling cocok untuk SaaS multi-tenant |
| **React** | 19 | UI Library | Bundled dengan Next.js 15 |
| **TypeScript** | 5.x | Type safety | Wajib untuk proyek berskala |
| **Tailwind CSS** | 4.x | Styling | Utility-first, cepat, konsisten |
| **shadcn/ui** | Latest | Component library | Accessible, customizable, tidak opinionated. Basis semua UI component |
| **Lucide React** | Latest | Icon library | Konsisten dengan shadcn/ui |
| **TanStack Query** | v5 | Data fetching & caching | Server state management: caching, refetch, optimistic update |
| **React Hook Form** | v7 | Form management | Performa tinggi, integrasi dengan Zod |
| **Zod** | v3 | Schema validation | Validasi form + API input, shared antara FE & BE |
| **Recharts** | v2 | Chart / grafik | Grafik dashboard keuangan, akademik, SDM |
| **date-fns** | v3 | Date manipulation | Ringan, tree-shakeable. Handling tanggal masehi + hijriah |
| **jsPDF / react-pdf** | Latest | Preview PDF | Preview rapor di browser (sebelum download dari R2) |

---

## 2. BACKEND

| Teknologi | Versi | Fungsi | Alasan Dipilih |
|---|---|---|---|
| **Next.js Route Handlers** | 15 | REST API endpoints | Serverless functions di Vercel, satu repo dengan frontend |
| **Next.js Server Actions** | 15 | Form mutation | Direct DB call dari Server Component, tanpa round-trip API |
| **Prisma** | 5.x | ORM | Type-safe DB client, migration, seeding. Terbaik untuk PostgreSQL |
| **NextAuth.js** | v5 (Auth.js) | Authentication | Session management, JWT, credentials provider |
| **Zod** | v3 | Input validation | Validasi semua input API sebelum masuk DB |
| **bcryptjs** | Latest | Password hashing | Hash password user |
| **Inngest** | Latest | Background jobs | PDF generate, kirim WA/email massal, SPP auto-generate, billing reminder |
| **Puppeteer** | Latest | PDF generation | Render HTML rapor & slip gaji menjadi PDF via headless Chrome |
| **Sharp** | Latest | Image processing | Compress & resize foto upload (logo, foto santri/siswa) |

---

## 3. DATABASE & STORAGE

| Teknologi | Tier | Fungsi | Alasan Dipilih |
|---|---|---|---|
| **Aiven PostgreSQL** | Startup (paid) | Database utama | Managed PostgreSQL terpercaya, support di Asia. Multi-tenant shared schema |
| **Upstash Redis** | Free/Pay-as-go | Cache + Rate limiting + Pub/Sub | Serverless Redis, cocok untuk Vercel. Tidak perlu maintain server |
| **Cloudflare R2** | Free 10GB/bln | File storage | PDF rapor, logo, dokumen. S3-compatible API, gratis egress, CDN bawaan |

---

## 4. EXTERNAL SERVICES

| Layanan | Fungsi | Tier MVP |
|---|---|---|
| **Resend** | Transactional email | Free (3.000 email/bln) |
| **Fonnte / WaBlas** | WhatsApp gateway (notifikasi) | Bayar per device |
| **Cloudflare DNS** | Domain + subdomain management | Free |
| **Midtrans** | Payment gateway langganan SaaS | Post-MVP (Sandbox dulu) |

---

## 5. INFRASTRUCTURE & DEVOPS

| Teknologi | Fungsi | Alasan Dipilih |
|---|---|---|
| **Vercel** | Hosting + Serverless Functions + Edge | Zero-config deploy Next.js, auto-scaling, preview per PR |
| **GitHub** | Version control + CI/CD trigger | Standar industri |
| **GitHub Actions** | CI pipeline | Lint, type check, test, build check sebelum deploy |
| **Vercel Edge Config** | Feature flags global | Real-time flag tanpa redeploy |
| **Sentry** | Error monitoring & alerting | Free tier cukup untuk MVP |

---

## 6. DEVELOPMENT TOOLS

| Tool | Fungsi |
|---|---|
| **ESLint** | Linting TypeScript & React |
| **Prettier** | Code formatter |
| **Husky** | Git hooks (pre-commit lint) |
| **lint-staged** | Lint hanya file yang berubah |
| **Prisma Studio** | GUI untuk manage DB di development |
| **Vitest** | Unit testing (ringan, kompatibel dengan Vite/Next) |
| **Playwright** | E2E testing (post-MVP) |

---

## 7. LIBRARY TAMBAHAN

| Library | Fungsi |
|---|---|
| **umm-al-qura** / **hijri-converter** | Konversi tanggal Hijriah ↔ Masehi |
| **qrcode** | Generate QR Code untuk verifikasi rapor |
| **nanoid** | Generate ID pendek (kode santri, referensi transaksi) |
| **clsx + tailwind-merge** | Conditional className utility |
| **sonner** | Toast notification (ringan, indah) |
| **@tanstack/react-table** | Data table dengan sort, filter, pagination |
| **next-themes** | Dark/Light mode toggle |

---

## 8. STRUKTUR MONOREPO

```
eduvera/
├── app/                        → Next.js App Router
│   ├── (landing)/              → eduvera.id (Landing Page)
│   ├── (owner)/                → app.eduvera.id (Owner Panel)
│   ├── (yayasan)/              → app.eduvera.id/yayasan
│   ├── (tenant)/               → [tenant].eduvera.id (Tenant App)
│   │   ├── sekolah/
│   │   │   ├── dashboard/
│   │   │   ├── pendidikan/
│   │   │   ├── bendahara/
│   │   │   └── tu/
│   │   └── pesantren/
│   │       ├── dashboard/
│   │       ├── pendidikan/
│   │       ├── bendahara/
│   │       └── sekretaris/
│   ├── (portal)/
│   │   ├── siswa/
│   │   ├── santri/
│   │   └── wali/
│   └── api/
│       └── v1/
│           ├── auth/
│           ├── owner/
│           ├── pesantren/
│           ├── sekolah/
│           ├── portal/
│           ├── upload/
│           ├── sse/
│           └── inngest/
│
├── components/
│   ├── ui/                     → shadcn/ui base components
│   ├── shared/                 → shared components (Sidebar, Topbar, dll)
│   ├── sekolah/                → sekolah-specific components
│   └── pesantren/              → pesantren-specific components
│
├── lib/
│   ├── prisma.ts               → Prisma client singleton
│   ├── auth.ts                 → NextAuth config
│   ├── inngest.ts              → Inngest client
│   ├── r2.ts                   → Cloudflare R2 client
│   ├── redis.ts                → Upstash Redis client
│   ├── resend.ts               → Resend email client
│   └── fonnte.ts               → WA gateway client
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── types/                      → TypeScript global types
├── hooks/                      → Custom React hooks
├── stores/                     → Zustand stores (jika ada client state)
├── middleware.ts               → Next.js edge middleware
└── inngest/
    └── functions/              → Semua Inngest job functions
        ├── generate-rapor.ts
        ├── kirim-wa.ts
        ├── kirim-email.ts
        ├── generate-spp.ts
        └── billing-reminder.ts
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="..."
NEXTAUTH_URL="https://eduvera.id"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# File Storage (Cloudflare R2)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="eduvera-files"
R2_PUBLIC_URL="https://files.eduvera.id"

# Email (Resend)
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="noreply@eduvera.id"

# WA Gateway
FONNTE_TOKEN="..."
FONNTE_DEVICE_ID="..."

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# Sentry
SENTRY_DSN="..."

# Midtrans (Post-MVP)
MIDTRANS_SERVER_KEY="..."
MIDTRANS_CLIENT_KEY="..."
```
