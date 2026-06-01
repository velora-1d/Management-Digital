# ERP Sekolah (Management Digital)

## Deskripsi
Sistem Informasi Manajemen Sekolah Terpadu (ERP) yang mencakup modul akademik, penugasan guru, keuangan, dan administrasi siswa. Proyek ini disinkronkan dengan database ERP Sekolah pusat.

## Stack Teknologi
- Frontend: Next.js 16.1.6 (App Router)
- Backend: Next.js API Routes (Route Handlers)
- Database: PostgreSQL (Regular/Standard)
- ORM: Drizzle ORM
- UI/UX: Tailwind CSS v4, SweetAlert2, Lucide React
- State Management: TanStack Query (React Query) v5
- Export/Reporting: jsPDF, XLSX

## Mode Arsitektur
[x] Next.js Fullstack
[ ] Laravel 13 API + Next.js Frontend
[ ] Lainnya: ___

## Target Platform
[x] Web only
[ ] Mobile only
[ ] Web + Mobile

## Multi-tenant
[x] Ya — strategi: single DB dengan tenant_id (tba)
[ ] Tidak

## Skala User
[ ] Kecil (< 100 user)
[x] Menengah (< 10.000 user)
[ ] Besar (> 10.000 user)

## Tim
[x] Solo developer
[ ] Tim — jumlah: ___

## Hosting & Infra
- Development: Local
- Production: Vercel

## Catatan Khusus
- Menggunakan soft delete (`deletedAt`) di sebagian besar tabel.
- Validasi data menggunakan logika kustom dan Zod (di beberapa tempat).
- Integrasi RBAC melalui middleware dan permission registry.
- Berbagi database `erp_sekolah_db` secara lokal agar sinkron dengan proyek ERP-Sekolah.

## Progress Terakhir
- Setup awal proyek Management-Digital setelah kloning baru.
- Konfigurasi environment `.env`, `.env.local`, dan `.env.production` terhubung ke database `erp_sekolah_db`.
- Instalasi dependensi npm (`npm install`).
- Sinkronisasi dengan konfigurasi ERP-Sekolah pusat.
- Sinkronisasi penuh dengan proyek ERP-Sekolah (source code `src/`, schema `drizzle/`, public assets `public/`, config, dan dependensi `package.json`).
- Verifikasi build (`npm run build`) berjalan sukses 100% setelah sinkronisasi.

## Last Updated
2026-06-01
