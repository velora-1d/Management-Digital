# EduVera — PROJECT BRIEF INDEX
## Platform Manajemen Pendidikan Terpadu untuk Sekolah & Pesantren Indonesia

---

## STRUKTUR DOKUMEN

```
EduVera-Project-Brief/
│
├── 00_Project-Overview.md          ← Identitas, deskripsi, model bisnis
├── 01_User-and-Roles.md            ← 8 role, akses, matriks permission
│
├── 02_Product-Structure/
│   ├── 02a_Sitemap.md              ← URL & navigasi lengkap semua platform
│   ├── 02b_Menu-Global.md          ← Menu Owner Panel & Super Admin Yayasan
│   ├── 02c_Menu-Sekolah.md         ← Menu lengkap + KPI + Chart semua dashboard sekolah
│   └── 02d_Menu-Pesantren.md       ← Menu lengkap + KPI + Chart semua dashboard pesantren
│
├── 03_Features/
│   ├── 03a_Global-Features.md      ← Fitur yang berlaku di seluruh platform
│   ├── 03b_Features-Sekolah.md     ← Fitur detail per menu sekolah
│   └── 03c_Features-Pesantren.md   ← Fitur detail per menu pesantren
│
├── 04_Flow/
│   ├── 04a_User-Flow.md                          ← 15 user flow utama
│   ├── 04b_System-Flow-Global.md                 ← Auth, notifikasi, inngest
│   ├── 04c_System-Flow-Sekolah-Pendidikan.md     ← Flow akademik sekolah
│   ├── 04d_System-Flow-Sekolah-Bendahara-TU.md   ← Flow keuangan & TU sekolah
│   ├── 04e_System-Flow-Pesantren-Pendidikan.md   ← Flow akademik pesantren
│   ├── 04f_System-Flow-Pesantren-Bendahara.md    ← Flow keuangan pesantren
│   ├── 04g_System-Flow-Pesantren-Sekretaris.md   ← Flow sekretariat pesantren
│   ├── 04h_System-Flow-Sekolah-Tambahan.md       ← Flow ekskul, BK, mutasi, kenaikan
│   └── 04i_System-Flow-Pesantren-Tambahan.md     ← Flow kesehatan, kegiatan, kenaikan marhalah
│
├── 05_System-Design/
│   ├── 05a_Architecture.md         ← Modular monolith, multi-tenant, RBAC
│   ├── 05b_Database.md             ← Schema PostgreSQL lengkap semua modul
│   └── 05c_API.md                  ← REST API endpoints lengkap
│
├── 06_Tech-Stack.md                ← Frontend, Backend, Infra, DevOps
│
├── 07_UI-UX/
│   ├── 00_Design-System.md                         ← Warna, tipografi, komponen
│   ├── 01_Sekolah-Dashboard-Utama-Pendidikan.md    ← UI semua halaman pendidikan sekolah
│   ├── 02_Sekolah-Bendahara-TU.md                  ← UI semua halaman bendahara & TU
│   ├── 03_Pesantren-Dashboard-Utama-Pendidikan.md  ← UI semua halaman pendidikan pesantren
│   ├── 04_Pesantren-Bendahara-Sekretaris.md        ← UI semua halaman bendahara & sekretaris
│   ├── 05_Portal-Siswa-Santri-Wali.md              ← UI portal siswa, santri, wali
│   ├── 06_Owner-Panel-SuperAdmin.md                ← UI owner panel & super admin yayasan
│   └── 07_Halaman-Tambahan-Form-Detail.md          ← UI form mutasi, kenaikan, kesehatan, program kegiatan, dll
│
├── 08_Security.md                  ← Auth, isolasi tenant, audit trail, rate limit
│
└── 09_Rules/
    ├── 09a_Business-Rules.md       ← Aturan bisnis per modul
    ├── 09b_Validation-Rules.md     ← Validasi input semua field
    ├── 09c_Permission-Rules.md     ← Aturan akses per role
    └── 09d_System-Constraints.md   ← SLA, kapasitas, browser support
```

---

## RINGKASAN KONTEN

| # | Section | File | Keterangan |
|---|---|---|---|
| 0 | Project Overview | 00 | MVP v1.0 — SaaS Multi-Tenant |
| 1 | User & Roles | 01 | 8 role, 4-layer RBAC |
| 2 | Product Structure | 02a–02d | Sitemap + Menu + KPI + Chart semua dashboard |
| 3 | Features | 03a–03c | Global + Sekolah + Pesantren |
| 4 | Flow | 04a–04i | 15 user flow + 9 system flow file |
| 5 | System Design | 05a–05c | Arch + DB (PostgreSQL) + API |
| 6 | Tech Stack | 06 | Next.js 15, Prisma, PostgreSQL, Vercel |
| 7 | UI / UX | 07 (8 file) | Wireframe ASCII tiap halaman + form detail |
| 8 | Security | 08 | Defense in depth, audit trail immutable |
| 9 | Rules | 09a–09d | Business + Validation + Permission + Constraints |

---

## STATUS DOKUMEN

| Status | Keterangan |
|---|---|
| ✅ FINAL | Semua section selesai & terkunci |
| 📅 Dibuat | Maret 2026 |
| 🔄 Versi | MVP v1.0 |
| 📁 Total File | 36 file markdown |

---

## CATATAN PENTING

1. **Menu, KPI, Chart** — sudah dikunci dan final (tidak boleh diubah tanpa diskusi ulang)
2. **Database** — menggunakan PostgreSQL (via Aiven) dengan Prisma ORM
3. **Multi-tenant** — Shared DB + Row-Level Isolation (`tenant_id` di semua tabel)
4. **UI/UX** — Format wireframe ASCII, siap dijadikan referensi paper mockup
5. **Flow** — User Flow + System Flow dipisah untuk clarity implementasi
6. **Rules** — Dipecah 4 file untuk mudah dirujuk saat development
