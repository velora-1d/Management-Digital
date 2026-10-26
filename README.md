# 🏫 Management Digital (ERP Sekolah & Madrasah Modern)

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Management%20Digital-2563eb?style=for-the-badge&logo=school&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.5.20%20(App%20Router)-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Docker](https://img.shields.io/badge/Deployment-Docker%20Swarm-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br/>

**Sistem Informasi Manajemen Sekolah Terpadu & Multi-Jenjang Berstandar Enterprise**  
*All-in-One School Enterprise Resource Planning (ERP) & Madrasah Operating System*

Didesain, Dirancang, dan Dikembangkan di Bawah Naungan Ekosistem Resmi:  
🏢 **Brand**: **Velora** ([@velora-1d](https://github.com/velora-1d))  
👨‍💻 **Lead Software Architect & Full-Stack Engineer**: **Mahin Utsman Nawawi, S.H.**

</div>

---

## 📖 1. Tentang Platform Management Digital

**Management Digital** adalah platform ERP institusi pendidikan terintegrasi yang dibangun untuk mendigitalkan seluruh siklus tata kelola sekolah, madrasah (MI, MTs, MA), dan pondok pesantren di Indonesia. Sistem ini mengintegrasikan seluruh proses operasional mulai dari penerimaan siswa baru, pembelajaran akademik, manajemen keuangan dan infaq/SPP, tabungan, koperasi, kepegawaian (HRD & Payroll), sarpras inventaris, persuratan tata usaha, hingga website portal profil madrasah (CMS) dalam satu kesatuan sistem real-time.

### 🌟 Nilai Keunggulan Utama:
1. **Multi-Jenjang Terpadu (Header Tenant Switcher)**:
   - Mendukung pergantian jenjang aktif (misal: MTs, MA, MI, Pondok Pesantren) secara instan melalui *Header Switcher* tanpa reload penuh.
   - Hak akses jenjang terproteksi dengan otorisasi 6-digit PIN keamanan.
2. **Standar Desain Modern (Clean Light Mode)**:
   - Mengusung palet warna bersih, kontras tinggi (*Slate-50* `#f8fafc`, *Card White* `#ffffff`, dan border subtil *Slate-200*).
   - Aksentuasi modern blue (`#2563eb`), bebas dari tema gelap (*zero dark mode*) dan bebas warna ungu untuk memastikan keterbacaan optimal.
3. **Right-Sliding Form Architecture (`RightDrawer`)**:
   - Seluruh formulir penambahan data, pengeditan, transaksi kasir, dan verifikasi muncul melalui **Slide-Over Drawer dari sisi KANAN** layar.
   - Menghilangkan *context switching* dan modal tengah layar yang menutupi tabel data.
4. **Pengecualian Master Data Siswa**:
   - Modul Data Siswa (`/students`) dipertahankan pada **Halaman Mandiri Lengkap** untuk memastikan pengisian puluhan atribut Dapodik/EMIS (biodata, wali, riwayat kesehatan, dan berkas KK/Akta) tetap lega dan mudah dikelola.
5. **Standarisasi Grid & Bulk Table Action**:
   - Semua tabel di 37 modul dilengkapi nomor urut (`No`), Checkbox seleksi masal (*Select All*), floating action bar untuk aksi batch, dan pagination terintegrasi.
6. **Sistem Audit Kesehatan Data Otomatis**:
   - Modul Mutasi Siswa terhubung dengan engine audit rekonsiliasi yang memantau ketidaksinkronan data kelas master dan enrollment tahun ajaran aktif dengan fitur **Sinkronkan Otomatis (1-Klik)**.

---

## 🏛️ 2. Arsitektur & Stack Teknologi

```mermaid
graph TD
    User([Pengguna: Siswa / Guru / Staf TU / Bendahara / Kepala Sekolah]) -->|HTTPS| Proxy[Traefik / Nginx Reverse Proxy]
    Proxy --> Swarm[Docker Swarm Cluster: management-digital-app]
    
    subgraph Core_App [Next.js 15 Fullstack Engine]
        AppRouter[Next.js App Router: React 19 Server & Client Components]
        API[Route Handlers / API Routes]
        RBAC[Middleware & Permission Registry Guard]
        StateMgr[TanStack React Query v5 & Context Mode]
    end

    Swarm --> Core_App

    subgraph Data_Layer [Basis Data & Penyimpanan]
        Drizzle[Drizzle ORM Engine]
        Postgres[(PostgreSQL 16 Database)]
        CloudStorage[Cloud Object Storage: Cloudflare R2 / S3]
    end

    API --> Drizzle
    Drizzle --> Postgres
    API --> CloudStorage
```

### Rincian Stack Teknologi:
* **Framework**: [Next.js](https://nextjs.org/) `15.5.20` (App Router, Server Components, Route Handlers)
* **Frontend Library**: [React](https://react.dev/) `19.0.0` & React DOM
* **Styling & Design System**: [Tailwind CSS](https://tailwindcss.com/) `v4.0`, Tailwind Animate, Lucide React Icons
* **Dialogs & Feedback**: SweetAlert2, Headless UI, Custom Left/Right Slide-Over Drawers
* **Database Engine**: [PostgreSQL](https://www.postgresql.org/) `16+`
* **Object-Relational Mapping (ORM)**: [Drizzle ORM](https://orm.drizzle.team/)
* **Client State & Caching**: TanStack Query (`@tanstack/react-query`) `v5`
* **Reporting & Export**: `jspdf`, `jspdf-autotable`, `xlsx`, `qrcode`
* **Keamanan & Autentikasi**: JSON Web Token (JWT), `bcryptjs`, RBAC Role Scoping
* **Containerization**: Docker, Docker Compose, Docker Swarm

---

## 📱 3. Cakupan Modul Sistem (37 Modul Terpadu)

### A. Kesiswaan & Penerimaan Murid
1. **Penerimaan Siswa Baru (PPDB)** (`/ppdb`): Formulir pendaftaran calon siswa dengan `RightDrawer`, verifikasi administrasi, dan seleksi penerimaan.
2. **Daftar Ulang Siswa** (`/re-registration`): Verifikasi status registrasi ulang, administrasi buku pelajaran, dan konfirmasi kelas baru.
3. **Data Master Siswa** (`/students`): Halaman mandiri detail biodata lengkap siswa, identitas NIK/NISN, data keluarga/wali, domisili, dan berkas arsip digital.
4. **Mutasi & Kenaikan Kelas** (`/mutations`):
   - Form aksi mutasi di sisi kanan: **Naik Kelas**, **Pindah Kelas**, **Kelulusan (Alumni)**, **Pindah Sekolah**, dan **Non-aktif**.
   - Audit konsistensi data real-time dengan status indikator hijau (*100% Sehat*) dan tombol rekonsiliasi otomatis 1-klik.
   - Tabel siswa kelas asal di sisi kiri dengan penomoran No urut dan Checkbox seleksi masal.

### B. Master Data Lembaga & Sarana
5. **Tingkatan Sekolah / Jenjang** (`/school-levels`): Master jenjang pendidikan (MI, MTs, MA, Ponpes) terintegrasi dengan Header Tenant Switcher.
6. **Data Ruang Kelas** (`/classrooms`): Manajemen rombel, kapasitas murid, dan penunjukan wali kelas via `RightDrawer`.
7. **Tahun Ajaran** (`/academic-years`): Penetapan tahun ajaran dan semester aktif lembaga.
8. **Kategori Keuangan** (`/transaction-categories`): Master pos anggaran penerimaan dan pengeluaran kas madrasah.

### C. Akademik & Pembelajaran
9. **Mata Pelajaran** (`/subjects`): Manajemen mapel reguler, muatan lokal, kategori keagamaan, dan KKM.
10. **Penugasan Guru** (`/teaching-assignments`): Plotting pengampu mata pelajaran per kelas dan semester.
11. **Jadwal Pelajaran** (`/schedules`): Penyusunan jam KBM, jadwal mingguan kelas, dan alokasi guru.
12. **Absensi Siswa** (`/attendance`): Presensi harian kelas, rekap kehadiran (Hadir, Izin, Sakit, Alpa), dan generator laporan cetak.
13. **Manajemen Kurikulum** (`/curriculum`): Konfigurasi bobot komponen penilaian (Formatif, Sumatif, PTS, PAS) sesuai Kurikulum Merdeka.
14. **Input Nilai Siswa** (`/grades`): Input nilai cepat berbasis drawer dengan tombol preset dan live preview predikat otomatis (A/B/C/D).
15. **Rapor Digital** (`/report-cards`): Rekap capaian kompetensi, catatan wali kelas, dan generator cetak PDF rapor siswa.
16. **Ekstrakurikuler** (`/extracurricular`): Pendaftaran cabang eskul, penunjukan pembina, dan penetapan anggota siswa.
17. **Bimbingan Konseling (BK)** (`/counseling`): Pencatatan kasus pelanggaran, poin kedisiplinan, dan histori konseling siswa.
18. **Kalender Akademik** (`/calendar`): Agenda kegiatan madrasah, jadwal ujian, dan kalender libur semester.

### D. Keuangan, SPP & Kas Madrasah
19. **Infaq / Tagihan SPP** (`/infaq-bills`): Generate tagihan massal bulanan, pencatatan loket bayar tunai, dan invoice digital.
20. **Akun Kas & Bank** (`/cash-accounts`): Rekening kas operasional, rekening bank madrasah, dan rekonsiliasi saldo.
21. **Tabungan Siswa** (`/tabungan`): Layanan simpanan pelajar, form setor dan tarik tunai cepat via drawer, serta cetak buku tabungan.
22. **Wakaf & Donasi** (`/wakaf`): Penerimaan dana wakaf, pencatatan database donatur, dan penyaluran program sosial.
23. **Jurnal Umum** (`/journal`): Pembukuan entri jurnal umum kas masuk dan kas keluar berbasis standar akuntansi.
24. **Laporan Keuangan** (`/reports`): Rekapitulasi neraca, arus kas, dan laporan penerimaan per periode.

### E. Koperasi & Kantin Digital
25. **Produk Koperasi** (`/coop/products`): Manajemen katalog inventaris dagang, harga beli/jual, dan kontrol stok barang.
26. **Kasir Transaksi (POS)** (`/coop/transactions`): Panel kasir belanjaan santri/siswa dengan drawer checkout instan dan struk penjualan.
27. **Piutang Siswa** (`/coop/credits`): Pencatatan kredit belanja santri dan fasilitas pelunasan piutang bertahap.

### F. Kepegawaian & Tata Usaha
28. **Data Guru** (`/teachers`): Database tenaga pendidik, NUPTK, riwayat pendidikan, dan berkas sertifikasi.
29. **Data Staf** (`/staff`): Manajemen tenaga kependidikan dan struktur divisi kerja.
30. **Payroll (Gaji Pegawai)** (`/payroll`): Kalkulator slip gaji otomatis, penambahan tunjangan, potongan absensi/kredit, dan cetak slip gaji.
31. **Presensi Pegawai** (`/employee-attendance`): Absensi harian pendidik/tenaga kependidikan dan pengajuan izin/cuti.
32. **Manajemen Surat** (`/letters`): Pengarsipan agenda surat masuk, penerbitan surat keluar, dan penomoran otomatis.
33. **Pengumuman Madrasah** (`/announcements`): Publikasi maklumat internal untuk siswa, wali murid, atau dewan guru.
34. **Inventaris Sarpras** (`/inventory`): Pencatatan aset gedung, sarana kelas, kondisi barang (Baik/Rusak), dan nilai aset.
35. **Profil Lembaga** (`/school-profile`): Konfigurasi identitas madrasah, NPSN, NSM, kontak, logo resmi, dan kop surat digital.

### G. CMS & Pengaturan Sistem
36. **Website Profil Madrasah (CMS)** (`/admin/cms`): Pengelolaan konten landing page publik, artikel berita, dan hero banner slideshow.
37. **Pengaturan Sistem** (`/settings`): Manajemen akun pengguna, pengaturan hak akses privilege (RBAC), backup database SQL, dan restore data.

---

## 🛠️ 4. Panduan Menjalankan Aplikasi

### Prasyarat Sistem:
- **Node.js**: Versi `20.x` atau `22.x` (LTS direkomendasikan)
- **NPM / PNPM**: Node Package Manager
- **PostgreSQL**: Versi `15+` atau `16+`
- **Docker**: (Opsional untuk deployment swarm/container)

### Langkah Instalasi Lokal:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/velora-1d/Management-Digital.git
   cd Management-Digital
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (`.env`)**:
   Salin berkas konfigurasi lingkungan dan sesuaikan kredensial basis data:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/management_digital?sslmode=disable"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Migrasi Basis Data**:
   Sinkronkan struktur tabel ke PostgreSQL menggunakan Drizzle:
   ```bash
   npm run db:push
   # atau jalankan skrip migrasi
   npm run db:migrate
   ```

5. **Menjalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban pada alamat [http://localhost:3000](http://localhost:3000).

6. **Build Produksi & Type-Check**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 5. Deployment Menggunakan Docker & Docker Swarm

Proyek ini telah dikonfigurasi dengan `Dockerfile` multi-stage build yang sangat efisien (berbasis `node:22-bookworm-slim`):

```bash
# 1. Build image container
docker build -t management-digital-app:latest .

# 2. Deploy / Update service di Docker Swarm
docker service update --image management-digital-app:latest --force management-digital-app
```

---

## 📂 6. Struktur Direktori Proyek

```plaintext
Management-Digital/
├── drizzle/                     # File migrasi & SQL generated oleh Drizzle
├── public/                      # Asset statis, logo madrasah, dan icon
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Halaman autentikasi (login, logout)
│   │   ├── (dashboard)/         # 37 Halaman modul dashboard operasional
│   │   │   ├── classrooms/      # Modul Kelas & Rombel
│   │   │   ├── infaq-bills/     # Modul Tagihan SPP
│   │   │   ├── mutations/       # Modul Mutasi & Kenaikan Kelas
│   │   │   ├── ppdb/            # Modul Penerimaan Siswa Baru
│   │   │   ├── students/        # Modul Master Data Siswa (Halaman Mandiri)
│   │   │   ├── tabungan/        # Modul Tabungan Siswa
│   │   │   ├── teachers/        # Modul Dewan Guru
│   │   │   └── ...              # Modul operasional lainnya
│   │   ├── api/                 # Route Handlers / REST API endpoint backend
│   │   ├── globals.css          # Styling global Tailwind CSS v4 & animasi drawer
│   │   └── layout.tsx           # Root layout & providers
│   ├── components/              # Komponen antarmuka pengguna
│   │   ├── ui/                  # Komponen primitif: LeftDrawer (Right slide), Card, PageHeader
│   │   ├── Header.tsx           # Global Header & TenantSwitcher integration
│   │   ├── Sidebar.tsx          # Navigasi utama vertikal aplikasi
│   │   ├── Pagination.tsx       # Komponen paginasi tabel terstandarisasi
│   │   └── TenantSwitcher.tsx   # Switcher tingkatan sekolah/madrasah (Header)
│   ├── db/                      # Koneksi database PostgreSQL & Skema Drizzle ORM
│   │   ├── index.ts             # Client connection pool PostgreSQL
│   │   └── schema.ts            # Definisi tabel-tabel ERP
│   └── lib/                     # Library utility: RBAC, tenant resolver, PDF/Excel export
├── Dockerfile                   # Multi-stage optimized Docker buildfile
├── drizzle.config.ts            # Konfigurasi Drizzle ORM kit
├── package.json                 # Daftar dependensi & npm scripts
└── tsconfig.json                # Konfigurasi compiler TypeScript
```

---

## 📄 7. Hak Cipta & Lisensi

Proyek ini dikembangkan dan dipelihara secara resmi oleh:  
🏢 **Velora Development Network** ([@velora-1d](https://github.com/velora-1d))  
Seluruh hak cipta dilindungi undang-undang. Sistem ini dilindungi di bawah lisensi komersial dan tertutup institusi terkait.
