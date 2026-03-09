# FLOW SEKOLAH — DASHBOARD PENDIDIKAN

---

## 1. DATA AKADEMIK

### 1.1 Data Siswa

#### User Flow
```
[Admin / TU]
      │
      ▼
Menu: Pendidikan → Data Akademik → Data Siswa
      │
      ▼
Lihat daftar siswa (filter: jenjang / tingkat / status)
      │
      ├── [Tambah Siswa]
      │       │
      │       ▼
      │   Input wajib:
      │   ├── NIS / NISN
      │   ├── Nama Lengkap
      │   ├── Jenis Kelamin
      │   ├── Tanggal Lahir
      │   ├── Jenjang (PAUD/TK/SD/MI/SMP/MTs/SMA/MA/SMK)
      │   └── Tingkat (kelas)
      │       │
      │       ▼
      │   Validasi: NIS unik per tenant
      │       │
      │       ▼
      │   [Lanjut isi sub-data]
      │   ├── Data Wali (Ayah, Ibu, Wali opsional)
      │   ├── Data Kesehatan (khusus PAUD/TK)
      │   └── Riwayat akademik (auto-generated)
      │
      ├── [Import Bulk via Excel]
      │       │
      │       ▼
      │   Download template Excel
      │       │
      │       ▼
      │   Upload file yang sudah diisi
      │       │
      │       ▼
      │   Preview & validasi data
      │       │
      │       ▼
      │   Konfirmasi import
      │
      └── [Nonaktifkan / Arsip Siswa]
              │
              ▼
          Input alasan: Lulus / Pindah / Keluar
              │
              ▼
          Status → Arsip (data tidak dihapus)
          └── Rapor lama tetap bisa diakses
```

#### System Flow
```
POST /api/siswa
      │
      ▼
Validasi:
├── NIS unik per tenant
├── Jenjang valid (dari master jenjang)
└── Tingkat sesuai jenjang
      │
      ▼
Generate siswa_id (UUID)
      │
      ▼
Insert: siswa (tenant_id, nis, nama, jenis_kelamin, jenjang, tingkat, status=aktif)
      │
      ▼
Jika jenjang=SMK → flag: butuh mapping jurusan
      │
      ▼
Catat audit_trail
```

---

### 1.2 Data Guru

#### User Flow
```
[Admin / TU]
      │
      ▼
Menu: Data Akademik → Data Guru
      │
      ▼
├── [Tambah Guru]
│       │
│       ▼
│   Input:
│   ├── Nama Lengkap
│   ├── NIP (opsional)
│   ├── Status Kepegawaian: PNS / PPPK / Honorer
│   ├── Jenis Guru:
│   │   ├── Guru Kelas (PAUD/TK)
│   │   ├── Guru Mapel Umum
│   │   ├── Guru Mapel Keagamaan (MI/MTs/MA)
│   │   └── Guru Produktif (SMK)
│   ├── Kontak (WA, Email)
│   └── Foto (opsional)
│       │
│       ▼
│   Simpan → Sistem buat akun login guru
│       │
│       ▼
│   Kirim kredensial via WA / Email
│
└── [Lihat Riwayat Mengajar]
        └── Auto-log dari penugasan kelas + mapel
```

---

### 1.3 Mata Pelajaran

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Data Akademik → Mata Pelajaran
      │
      ▼
├── [Tambah Mapel]
│       │
│       ▼
│   Input:
│   ├── Nama mapel
│   ├── Jenis: Umum / Keagamaan / Produktif / Aspek Perkembangan
│   ├── Assign ke jenjang + tingkat
│   └── Assign ke jurusan (jika SMK/Produktif)
│       │
│       ▼
│   Simpan → status: Aktif
│
└── [Arsip Mapel]
        │
        ▼
    Cek: apakah mapel sudah dipakai rapor?
    ├── SUDAH → arsip saja (tidak dihapus)
    └── BELUM → bisa hapus
    
    RULE: Mapel arsip tidak muncul di jadwal baru,
    tapi tetap tampil di rapor lama
```

---

### 1.4 Jenjang & Tingkat Nasional

#### User Flow
```
[Admin]
      │
      ▼
Menu: Data Akademik → Jenjang & Tingkat
      │
      ▼
Tampilkan semua jenjang (SYSTEM LOCK — tidak bisa dihapus):
├── PAUD/TK (KB, TK A, TK B)
├── SD / MI (Kelas 1–6)
├── SMP / MTs (VII–IX)
├── SMA / MA (X–XII)
└── SMK (X–XII + Jurusan + Kompetensi)
      │
      ▼
├── [Aktifkan / Nonaktifkan Jenjang]
│       └── Hanya jenjang yang dimiliki sekolah yang diaktifkan
│
└── [Kelola SMK — Jurusan & Kompetensi]
        │
        ▼
    [Tambah Jurusan]: RPL, TKJ, Akuntansi, dst
        │
        ▼
    [Tambah Kompetensi] per jurusan
        │
        ▼
    Mapping ke: kelas, guru produktif, mapel produktif
```

---

## 2. KELAS & PEMBELAJARAN

### 2.1 Daftar Kelas

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Pendidikan → Kelas & Pembelajaran → Daftar Kelas
      │
      ▼
Filter per jenjang
      │
      ▼
├── [Buat Kelas Baru]
│       │
│       ▼
│   Pilih jenjang
│       │
│       ▼
│   Pilih tingkat
│       │
│       ▼
│   Input nama kelas (misal: VII A, X RPL 1)
│       │
│       ▼
│   Jika SMK → pilih jurusan
│       │
│       ▼
│   Simpan → kelas terikat tahun ajaran aktif
│
├── [Assign Wali Kelas]
│       │
│       ▼
│   Pilih guru (dari data guru aktif)
│       │
│       ▼
│   RULE: 1 guru hanya bisa jadi wali 1 kelas per tahun ajaran
│       │
│       ▼
│   Simpan
│
└── [Lihat Kelas] → daftar siswa, wali kelas, jadwal
```

#### System Flow
```
POST /api/kelas
      │
      ▼
Validasi:
├── Jenjang + tingkat valid
├── Tahun ajaran aktif ada
└── Nama kelas unik per jenjang per tahun ajaran
      │
      ▼
Insert: kelas (tenant_id, tahun_ajaran_id, jenjang, tingkat, nama)
      │
      ▼
RULE: kelas lama (tahun ajaran tidak aktif) → read-only otomatis
```

---

### 2.2 Rombel

#### User Flow
```
[Admin]
      │
      ▼
Menu: Kelas → Rombel
      │
      ▼
Pilih kelas
      │
      ▼
[Buat Rombel]
      │
      ▼
Input nama rombel (A, B, C)
      │
      ▼
Assign siswa ke rombel (pilih dari daftar siswa kelas)
      │
      ▼
Simpan → dipakai untuk absensi & laporan
```

---

### 2.3 Penugasan Guru

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Kelas → Penugasan Guru
      │
      ▼
├── [Tugaskan Guru Mapel]
│       │
│       ▼
│   Pilih guru
│       │
│       ▼
│   Pilih mapel
│       │
│       ▼
│   Pilih kelas (bisa multi-kelas)
│       │
│       ▼
│   Validasi: guru sesuai jenis mapel
│       │
│       ▼
│   Simpan → riwayat mengajar auto-created
│
└── [Wali Kelas]
        │
        ▼
    Pilih kelas
        │
        ▼
    Pilih guru (dari daftar guru aktif)
        │
        ▼
    Validasi: guru belum jadi wali di kelas lain
        │
        ▼
    Simpan
```

---

### 2.4 Jadwal Pembelajaran

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Kelas → Jadwal Pembelajaran
      │
      ▼
Pilih jenjang & kelas
      │
      ▼
[Buat Jadwal Harian] (SD–MA)
      │
      ▼
Pilih hari (Senin–Sabtu)
      │
      ▼
Per jam pelajaran → assign:
├── Mapel
├── Guru
└── Jam (mulai–selesai)
      │
      ▼
Validasi real-time:
├── Guru tidak bentrok di kelas lain jam yang sama
└── Kelas tidak punya 2 mapel di jam yang sama
      │
      ▼
Simpan jadwal
      │
      ▼
[Jadwal Produktif SMK]
├── Teori: flow sama seperti di atas
├── Praktik: bisa multi-jam, assign lab/bengkel
└── Teaching Factory: bisa lintas hari
```

---

### 2.5 Absensi Siswa

#### User Flow
```
[Guru Mapel / Guru Kelas / Wali Kelas]
      │
      ▼
Menu: Kelas → Absensi
      │
      ▼
Pilih kelas (yang diajar/dikelola)
      │
      ▼
Pilih tanggal (default: hari ini)
      │
      ▼
Load daftar siswa kelas
      │
      ▼
Input status per siswa:
├── Hadir ✓
├── Sakit (input keterangan)
├── Izin (input keterangan)
└── Alpha ✗
      │
      ▼
Simpan
      │
      ▼
Jika Alpha → flag notifikasi di dashboard
(opsional: kirim WA ke wali)
```

---

## 3. KURIKULUM

### 3.1 Setup Kurikulum Per Jenjang

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Pendidikan → Kurikulum
      │
      ▼
Pilih jenjang
      │
      ▼
[Set Kurikulum Aktif]
      │
      ▼
Pilih jenis: K13 / Kurikulum Merdeka / Kemenag / Custom
      │
      ▼
Tentukan tahun ajaran berlaku
      │
      ▼
RULE: 1 jenjang hanya 1 kurikulum aktif per tahun ajaran
      │
      ▼
Simpan → kurikulum lama otomatis jadi arsip
```

---

### 3.2 Komponen Penilaian

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Kurikulum → Komponen Penilaian
      │
      ▼
Pilih jenjang & mapel
      │
      ▼
Aktifkan komponen sesuai jenjang:

PAUD/TK:
├── Observasi
├── Catatan Guru
└── Portofolio

SD/MI/SMP/MTs/SMA/MA:
├── Pengetahuan
├── Keterampilan
└── Sikap

SMK (tambahan):
└── Kompetensi Produktif
      │
      ▼
Set bobot per komponen:
├── Pengetahuan: 40%
├── Keterampilan: 40%
└── Sikap: 20%
(Total wajib = 100%)
      │
      ▼
Simpan
      │
      ▼
RULE: bobot tidak bisa diubah setelah nilai masuk
```

---

### 3.3 Template Rapor

#### User Flow
```
[Admin / Kurikulum]
      │
      ▼
Menu: Kurikulum → Template Rapor
      │
      ▼
Pilih jenjang
      │
      ▼
Pilih template dasar sesuai jenjang:
├── PAUD/TK → Narasi Perkembangan
├── SD/MI → Naratif + Angka
├── SMP/MTs/SMA → Angka + Deskripsi
├── MA → Rapor Umum + Rapor Keagamaan
└── SMK → Akademik + Kompetensi
      │
      ▼
Kustomisasi:
├── Logo sekolah
├── Nama sekolah
├── Nama Kepala Sekolah
├── Tanda tangan digital
├── Urutan section
└── Field yang ditampilkan
      │
      ▼
Simpan template
      │
      ▼
Preview template → konfirmasi
```

---

## 4. NILAI & E-RAPOR

### 4.1 Input Nilai

#### User Flow — Guru Mapel (SD–MA)
```
[Guru Mapel]
      │
      ▼
Menu: Nilai & E-Rapor → Input Nilai
      │
      ▼
Sistem filter otomatis:
├── Hanya mapel yang diajar guru ini
├── Hanya kelas yang diampu
└── Semester aktif
      │
      ▼
Pilih mapel & kelas
      │
      ▼
Sistem load:
├── Daftar siswa
├── Komponen penilaian aktif
└── Bobot per komponen
      │
      ▼
Input nilai per siswa per komponen:
├── Pengetahuan: [angka]
├── Keterampilan: [angka]
└── Sikap: [predikat]
      │
      ▼
Sistem auto-hitung nilai akhir mapel
      │
      ▼
Simpan
      │
      ▼
RULE: Nilai terkunci saat rapor dipublish
```

#### User Flow — Guru Kelas PAUD/TK
```
[Guru Kelas PAUD/TK]
      │
      ▼
Menu: Nilai & E-Rapor → Input Nilai
      │
      ▼
Pilih kelas
      │
      ▼
Pilih siswa
      │
      ▼
Input observasi per aspek perkembangan:
├── Nilai Agama & Moral
├── Fisik Motorik
├── Kognitif
├── Bahasa
├── Sosial Emosional
└── Seni
      │
      ▼
Input narasi perkembangan (deskriptif, bukan angka)
      │
      ▼
Upload dokumentasi (foto kegiatan) opsional
      │
      ▼
Simpan
```

---

### 4.2 Generate E-Rapor Sekolah

#### User Flow
```
[Admin / Wali Kelas]
      │
      ▼
Menu: Nilai & E-Rapor → Generate Rapor
      │
      ▼
Cek kelengkapan per kelas:
├── Semua guru sudah input nilai ✓
├── Wali kelas sudah isi catatan ✓
└── Kurikulum & template aktif ✓
      │
      ▼
Jika ada yang belum → tampilkan warning detail
(mapel mana yang belum diisi oleh guru mana)
      │
      ▼
Pilih mode:
├── Per Siswa
└── Bulk Per Kelas / Semua Kelas
      │
      ▼
[Preview Rapor] → cek tampilan
      │
      ▼
[Simpan Draft]
      │
      ▼
[Publish]
│
├── Efek publish:
│   ├── Nilai semua guru → TERKUNCI
│   ├── Catatan wali kelas → TERKUNCI
│   ├── Kurikulum → TERKUNCI
│   ├── Akses wali murid/siswa → DIBUKA
│   └── Notifikasi WA + Email ke wali murid
│
└── [Export PDF] → per siswa atau per kelas
```

#### System Flow (Bulk Generate)
```
[Admin klik Bulk Generate]
      │
      ▼
Validasi: semua nilai kelas lengkap
      │
      ▼
Trigger Inngest Job: generate_rapor_sekolah_bulk
      │
      ▼
Loop per siswa:
├── Ambil nilai semua mapel
├── Hitung nilai akhir & rata-rata
├── Ambil catatan wali kelas
├── Ambil template rapor jenjang
├── Render PDF (Puppeteer)
│   ├── Inject: logo sekolah, nama KS
│   ├── Inject: QR Code verifikasi
│   └── Inject: tanda tangan digital
├── Upload PDF → Cloudflare R2
└── Simpan URL ke table rapor
      │
      ▼
Update status rapor → PUBLISHED
      │
      ▼
Trigger notifikasi massal ke wali murid
      │
      ▼
Log job selesai
```

---

### 4.3 Arsip Rapor

#### User Flow
```
[Admin / Wali Murid / Siswa]
      │
      ▼
Menu: Nilai & E-Rapor → Arsip Rapor
      │
      ▼
Filter:
├── Per siswa
├── Per kelas
├── Per jenjang
└── Per semester / tahun ajaran
      │
      ▼
Klik rapor → preview PDF
      │
      ▼
[Download PDF]
      │
      ▼
RULE:
├── Arsip immutable (tidak bisa diedit/hapus)
├── Akses wali hanya rapor anak sendiri
└── Bisa dicetak ulang kapan saja
```

---

## 5. KALENDER AKADEMIK

### User Flow
```
[Admin]
      │
      ▼
Menu: Pendidikan → Kalender Akademik
      │
      ▼
├── [Setup Kalender Tahun Ajaran]
│       │
│       ▼
│   Input:
│   ├── Tahun ajaran (misal: 2025/2026)
│   ├── Tanggal mulai
│   ├── Tanggal akhir
│   ├── Semester 1: mulai–akhir
│   └── Semester 2: mulai–akhir
│       │
│       ▼
│   Simpan → hanya 1 kalender aktif per tahun ajaran
│
├── [Tambah Event Kalender]
│       │
│       ▼
│   Input:
│   ├── Nama event: Ujian / Libur / Kegiatan
│   ├── Tanggal mulai–akhir
│   ├── Jenjang berlaku (semua / tertentu)
│   └── Keterangan
│       │
│       ▼
│   Simpan
│
├── [Kalender PAUD/TK] (khusus)
│       │
│       ▼
│   Input per bulan:
│   ├── Tema bulan (misal: "Keluargaku")
│   ├── Kegiatan perkembangan
│   └── Libur
│
└── [Setup Reminder]
        │
        ▼
    Pilih event → set reminder H-7, H-3, H-1
        │
        ▼
    Target: Guru / Siswa / Wali / Semua
        │
        ▼
    Channel: WA / Email / Dashboard
        │
        ▼
    Inngest scheduled job
```
