# UI / UX — SEKOLAH: DASHBOARD UTAMA & PENDIDIKAN
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# DASHBOARD SEKOLAH (KS / Admin)

## Layout
```
┌──────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo EduVera | [Sekolah] [Pesantren] | 🔔 | Avatar  │
├──────────────┬───────────────────────────────────────────────┤
│ SIDEBAR      │  Dashboard Sekolah                            │
│ ─────────    │  Selamat datang, [Nama KS] 📅 [Tanggal]      │
│ 📊 Dashboard │                                               │
│ ─────────    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ Pendidikan   │  │Siswa │ │ Guru │ │Staf  │ │Kelas │        │
│ Bendahara    │  │ 450  │ │  32  │ │  18  │ │  12  │        │
│ TU           │  └──────┘ └──────┘ └──────┘ └──────┘        │
└──────────────┴───────────────────────────────────────────────┘
```

## KPI Cards (4 kolom desktop, 2 tablet, 1 mobile)
```
┌────────────────────┐  ┌────────────────────┐
│ 👤 Total Siswa     │  │ 👨‍🏫 Total Guru     │
│ 450 aktif          │  │ 32 aktif           │
│ SD:120 SMP:180 ... │  │ PNS:10 Honor:22    │
└────────────────────┘  └────────────────────┘

┌────────────────────┐  ┌────────────────────┐
│ ✅ Absensi Hari Ini│  │ 💰 Saldo Kas       │
│ 92% Hadir          │  │ Rp 48.500.000      │
│ 35 Alpha  3 Sakit  │  │ ↑ SPP bulan ini    │
└────────────────────┘  └────────────────────┘

┌────────────────────┐  ┌────────────────────┐
│ 📋 Status Rapor    │  │ 💳 SPP Bulan Ini   │
│ 8/12 kelas publish │  │ 78% Lunas          │
│ 4 kelas belum      │  │ Rp 12jt tunggakan  │
└────────────────────┘  └────────────────────┘

┌────────────────────┐  ┌────────────────────┐
│ 🏫 Total Staf      │  │ ⚠️ Perlu Perhatian │
│ 18 aktif           │  │ 12 siswa alpha>5   │
│ TU:5 Keu:3 dll     │  │ 8 tunggakan > 2bln │
└────────────────────┘  └────────────────────┘
```

## Charts Section
```
┌───────────────────────────────┐  ┌───────────────────────┐
│ Tren Absensi Siswa (30 hari)  │  │ Distribusi Siswa      │
│ Line Chart                    │  │ per Jenjang           │
│ — Hadir  --- Alpha            │  │ Donut Chart           │
│                               │  │ SD 120 | SMP 180      │
└───────────────────────────────┘  └───────────────────────┘

┌───────────────────────────────┐  ┌───────────────────────┐
│ Pemasukan vs Pengeluaran      │  │ Status SPP Bulan Ini  │
│ Bar Chart 6 bulan             │  │ Donut Chart           │
│ █ Masuk  █ Keluar             │  │ Lunas/Sebagian/Belum  │
└───────────────────────────────┘  └───────────────────────┘
```

---

# DASHBOARD PENDIDIKAN

## Layout Halaman Daftar Siswa
```
┌──────────────────────────────────────────────────────────────┐
│ Data Siswa                           [ Import ] [ + Tambah ] │
│ Beranda > Pendidikan > Data Siswa                            │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari nama/NIS...  [Jenjang ▼] [Status ▼]  [Export ▼]    │
├────┬──────────────┬──────┬────────┬──────────┬──────────────┤
│ #  │ Nama         │ NIS  │ Kelas  │ Status   │ Aksi         │
├────┼──────────────┼──────┼────────┼──────────┼──────────────┤
│ 1  │ Ahmad Fauzi  │ 001  │ VII A  │ ● Aktif  │ [Detail] [⋯] │
│ 2  │ Budi Santoso │ 002  │ VIII B │ ● Aktif  │ [Detail] [⋯] │
│ 3  │ Citra Dewi   │ 003  │ VII A  │ ● Arsip  │ [Detail] [⋯] │
├────┴──────────────┴──────┴────────┴──────────┴──────────────┤
│ Menampilkan 1-20 dari 450 siswa         [ ‹ 1 2 3 ... › ]  │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Detail Siswa (Multi-Tab)
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali    Detail Siswa: Ahmad Fauzi          [Edit]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────┐  Nama: Ahmad Fauzi                             │
│ │  [Foto]  │  NIS: 001234  |  NISN: 0012345678             │
│ │  Avatar  │  Kelas: VII A  |  Jenjang: SMP                │
│ └──────────┘  Status: ● Aktif                              │
├──────────────────────────────────────────────────────────────┤
│ [Profil] [Data Wali] [Kesehatan] [Akademik] [Keuangan]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TAB AKTIF: Profil                                          │
│  TTL: Bandung, 12 Januari 2010                              │
│  Alamat: Jl. Merdeka No. 10, Bandung                        │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Input Nilai (Inline Table)
```
┌──────────────────────────────────────────────────────────────┐
│ Input Nilai                          [Simpan Draft] [Kunci] │
│ Kelas VII A | Matematika | Semester Ganjil 2025/2026         │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari siswa...              Terisi: 28/32 siswa ████░░    │
├─────────────────┬────────────┬────────────┬──────────────────┤
│ Nama Siswa      │ Pengetahuan│ Keterampilan│ Nilai Akhir     │
│                 │ (60%)      │ (40%)       │ (Auto)          │
├─────────────────┼────────────┼────────────┼──────────────────┤
│ Ahmad Fauzi     │ [85      ] │ [90      ] │  87.0           │
│ Budi Santoso    │ [78      ] │ [80      ] │  78.8           │
│ Citra Dewi      │ [        ] │ [        ] │  -              │
│ Diana Putri     │ [92      ] │ [88      ] │  90.4           │
└─────────────────┴────────────┴────────────┴──────────────────┘
```

## Halaman Generate Rapor
```
┌──────────────────────────────────────────────────────────────┐
│ Generate Rapor                                               │
│ Semester Ganjil 2025/2026                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LANGKAH:  [1 Setup] ──► [2 Cek Nilai] ──► [3 Publish]     │
│                 ✅              ✅                 ◯          │
├──────────────────────────────────────────────────────────────┤
│  Kelengkapan per Kelas:                                      │
│                                                              │
│  VII A   ████████████ 100%  ✅ Siap Generate                 │
│  VII B   ██████████░░  85%  ⚠️ 3 nilai belum diisi          │
│  VIII A  ████████████ 100%  ✅ Siap Generate                 │
│  VIII B  ████░░░░░░░░  40%  ❌ Nilai banyak kosong          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│              [Generate Kelas Siap] [Generate Semua]          │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Jadwal Pembelajaran
```
┌──────────────────────────────────────────────────────────────┐
│ Jadwal Pembelajaran                    [+ Tambah] [Export]  │
│ Kelas VII A | Semester Ganjil 2025/2026                      │
├──────────┬──────────┬──────────┬──────────┬──────────────────┤
│ Jam      │ Senin    │ Selasa   │ Rabu     │ ...             │
├──────────┼──────────┼──────────┼──────────┼──────────────────┤
│ 07.00-08│ Matematika│ B.Indo  │ IPA      │ ...             │
│          │ Pak Ahmad │ Bu Sari │ Pak Budi │                 │
├──────────┼──────────┼──────────┼──────────┼──────────────────┤
│ 08.00-09│ B.Indo   │ Mat     │ IPS      │ ...             │
│          │ Bu Sari  │ Pak Ahmd│ Bu Dewi  │                 │
└──────────┴──────────┴──────────┴──────────┴──────────────────┘
⚠️ Bentrok: Pak Ahmad — Rabu 09.00 (2 kelas)  [Lihat detail]
```

## Halaman Absensi Siswa
```
┌──────────────────────────────────────────────────────────────┐
│ Absensi Siswa                           [Simpan] [Rekap]    │
│ Kelas VII A | Senin, 8 Maret 2026                           │
├──────────────────────────────────────────────────────────────┤
│ Hadir: 29 | Sakit: 1 | Izin: 1 | Alpha: 1  (Total: 32)     │
├────┬─────────────────┬────────┬────────┬────────┬────────────┤
│ #  │ Nama            │ Hadir  │ Sakit  │ Izin   │ Alpha     │
├────┼─────────────────┼────────┼────────┼────────┼────────────┤
│ 1  │ Ahmad Fauzi     │ ◉      │ ○      │ ○      │ ○         │
│ 2  │ Budi Santoso    │ ○      │ ◉      │ ○      │ ○         │
│ 3  │ Citra Dewi      │ ◉      │ ○      │ ○      │ ○         │
└────┴─────────────────┴────────┴────────┴────────┴────────────┘
[Default Semua Hadir]    [Simpan Absensi]
```

## Halaman Ekstrakurikuler
```
┌──────────────────────────────────────────────────────────────┐
│ Ekstrakurikuler                              [ + Tambah ]   │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...            [Status ▼]                            │
├──────┬─────────────┬──────────┬───────────┬────────┬────────┤
│ #    │ Nama        │ Pembina  │ Anggota   │ Status │ Aksi  │
├──────┼─────────────┼──────────┼───────────┼────────┼────────┤
│ 1    │ Pramuka     │ Pak Andi │ 45 siswa  │ ● Aktif│ [⋯]  │
│ 2    │ Basket      │ Pak Rudi │ 20 siswa  │ ● Aktif│ [⋯]  │
│ 3    │ PMR         │ Bu Sari  │ 30 siswa  │ ● Aktif│ [⋯]  │
└──────┴─────────────┴──────────┴───────────┴────────┴────────┘
```

## Halaman Kalender Akademik
```
┌──────────────────────────────────────────────────────────────┐
│ Kalender Akademik 2025/2026            [ + Tambah Event ]   │
├──────────────────────────────────────────────────────────────┤
│  ‹ Maret 2026 ›                                             │
│  Sen   Sel   Rab   Kam   Jum   Sab   Min                    │
│   2     3     4     5     6     7     8                      │
│   9    10    11    12    13    14    15                      │
│  16    17   [18]  [19]   20    21    22  ← [18-19] UTS       │
│  23    24    25    26   [27]   28    29  ← [27] Libur        │
│  30    31                                                    │
├──────────────────────────────────────────────────────────────┤
│ Upcoming Events:                                             │
│ 📝 18-19 Mar — Ulangan Tengah Semester (Semua Jenjang)      │
│ 🏖️ 27 Mar   — Libur Nasional                               │
│ 📚 5 Apr    — Penerimaan Rapor Semester Ganjil              │
└──────────────────────────────────────────────────────────────┘
```

## Halaman BK (Bimbingan Konseling)
```
┌──────────────────────────────────────────────────────────────┐
│ Bimbingan Konseling                     [ + Catatan Baru ]  │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari siswa...    [Kategori ▼]  [Status ▼]               │
├──────┬────────────┬──────────────┬─────────────┬────────────┤
│ Tgl  │ Siswa      │ Kategori     │ Status      │ Aksi      │
├──────┼────────────┼──────────────┼─────────────┼────────────┤
│ 5/3  │ Ahmad F.   │ Akademik     │ ● Proses    │ [Detail]  │
│ 3/3  │ Budi S.    │ Perilaku     │ ● Aktif     │ [Detail]  │
│ 1/3  │ Citra D.   │ Keluarga     │ ✅ Selesai  │ [Detail]  │
└──────┴────────────┴──────────────┴─────────────┴────────────┘
```
