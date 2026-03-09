# FLOW SEKOLAH — DASHBOARD BENDAHARA & DASHBOARD TU

---

# BAGIAN A — DASHBOARD BENDAHARA

---

## 1. MASTER KEUANGAN

### 1.1 COA / Akun

#### User Flow
```
[Bendahara / Admin]
      │
      ▼
Menu: Bendahara → Master Keuangan → COA
      │
      ▼
Lihat daftar akun:
├── Aset (Kas, Bank, Piutang SPP)
├── Kewajiban
├── Pendapatan (SPP, BOS, Donasi)
└── Beban (Gaji, Operasional, Sarpras)
      │
      ├── [Tambah Akun]
      │       │
      │       ▼
      │   Input: Kode Akun, Nama, Tipe
      │       │
      │       ▼
      │   Simpan
      │
      ├── [Edit Akun] → Update nama (log perubahan)
      │
      └── [Nonaktifkan]
              │
              ▼
          Cek: ada transaksi? → hanya nonaktif, tidak hapus
```

---

### 1.2 Kategori Pemasukan

#### User Flow
```
[Bendahara / Admin]
      │
      ▼
Menu: Master Keuangan → Kategori Pemasukan
      │
      ▼
Default: SPP, Dana BOS, Donasi, Lainnya
      │
      ├── [Tambah Kategori Custom]
      │       └── Input nama → Simpan
      │
      └── RULE: kategori terikat ke COA terkait
```

---

### 1.3 Kategori Pengeluaran

#### User Flow
```
[Bendahara / Admin]
      │
      ▼
Default: Gaji, Operasional, Sarpras, Kegiatan
      │
      ├── [Tambah Kategori Custom] → Input nama → Simpan
      │
      └── RULE: digunakan sebagai kontrol RAPBS
```

---

## 2. SPP & TAGIHAN SISWA

### User Flow
```
[Bendahara / Admin]
      │
      ▼
Menu: Bendahara → SPP & Tagihan
      │
      ▼
├── [Generate Tagihan SPP Bulanan]
│       │
│       ▼
│   Pilih bulan & tahun ajaran
│       │
│       ▼
│   Pilih jenjang / kelas (atau semua)
│       │
│       ▼
│   Sistem load semua siswa aktif sesuai filter
│       │
│       ▼
│   Preview: jumlah siswa, nominal SPP per jenjang
│       │
│       ▼
│   Konfirmasi → Generate
│       │
│       ▼
│   Tagihan tergenerate per siswa
│       │
│       ▼
│   Trigger notifikasi WA ke wali murid
│
├── [Lihat Status Pembayaran]
│   ├── Filter: Lunas / Sebagian / Belum Bayar
│   ├── Filter: Per Kelas / Per Jenjang / Per Siswa
│   ├── Klik siswa → riwayat pembayaran detail
│   └── Statistik: total tagihan, total terkumpul, tunggakan
│
├── [Konfirmasi Pembayaran Manual]
│       │
│       ▼
│   Cari siswa
│       │
│       ▼
│   Pilih tagihan yang akan dikonfirmasi
│       │
│       ▼
│   Input:
│   ├── Nominal yang dibayar
│   ├── Tanggal pembayaran
│   ├── Metode: Transfer / Cash
│   └── Upload bukti transfer (opsional)
│       │
│       ▼
│   Simpan → Status: Lunas / Sebagian
│       │
│       ▼
│   Otomatis posting ke Pemasukan SPP (COA)
│       │
│       ▼
│   Notifikasi WA ke wali: "Pembayaran dikonfirmasi"
│
└── [Export] → PDF / Excel daftar tagihan + status
```

#### System Flow
```
[Generate Tagihan]
      │
      ▼
Query: siswa aktif sesuai filter
      │
      ▼
Loop per siswa:
└── Insert tagihan_spp (tenant_id, siswa_id, periode, nominal, status=BELUM)
      │
      ▼
Trigger Inngest Job: kirim WA massal ke wali murid
      │
      ▼
Log aktivitas

[Konfirmasi Pembayaran]
      │
      ▼
Update: tagihan_spp.status = LUNAS/SEBAGIAN
      │
      ▼
Insert: transaksi_masuk (COA Pendapatan SPP, nominal, tanggal)
      │
      ▼
Trigger Inngest: notifikasi WA ke wali
      │
      ▼
Catat audit_trail (immutable)
```

---

## 3. PEMASUKAN

### 3.1 Dana BOS

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Bendahara → Pemasukan → Dana BOS
      │
      ▼
[Catat Penerimaan BOS]
      │
      ▼
Input:
├── Periode (Triwulan 1/2/3/4)
├── Nominal
├── Tanggal diterima
├── Sumber (BOS Reguler / BOS Kinerja / BOS Afirmasi)
└── Nomor referensi (opsional)
      │
      ▼
Simpan → posting ke COA Dana BOS
      │
      ▼
Label: bisa difilter untuk laporan khusus BOS
```

---

### 3.2 Donasi & Lainnya

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Pemasukan → Donasi & Lainnya
      │
      ▼
[Catat Pemasukan]
      │
      ▼
Input:
├── Kategori: Donasi / Lainnya
├── Keterangan sumber
├── Nominal
├── Tanggal
└── Catatan
      │
      ▼
Simpan → posting ke COA terkait
```

---

## 4. PENGELUARAN

### 4.1 Gaji (Dari SDM — Otomatis)

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Bendahara → Pengeluaran → Gaji
      │
      ▼
Notifikasi dari modul SDM: "Slip gaji siap diposting"
      │
      ▼
Review daftar slip gaji bulan ini:
├── Nama pegawai
├── Komponen gaji
└── Total nominal
      │
      ▼
[Setujui & Posting ke Keuangan]
      │
      ▼
Sistem otomatis:
├── Insert transaksi_keluar per pegawai
├── Posting ke COA: Beban Gaji
└── Sumber: Kas / Bank
      │
      ▼
RULE: gaji tidak bisa diinput manual di sini
       harus selalu via modul SDM → TU
```

---

### 4.2 Operasional / Sarpras / Kegiatan

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Pengeluaran → [pilih kategori]
      │
      ▼
[Tambah Pengeluaran]
      │
      ▼
Input:
├── Kategori: Operasional / Sarpras / Kegiatan
├── Keterangan (wajib)
├── Nominal
├── Tanggal
├── Akun (dari COA)
└── Upload bukti (foto/PDF)
      │
      ▼
Simpan
      │
      ▼
Sistem auto:
├── Posting ke COA terkait
├── Update realisasi RAPBS
└── Warning jika anggaran kategori < 10%
      │
      ▼
RULE: transaksi tidak bisa dihapus
       jika ada kesalahan → buat jurnal koreksi
```

---

## 5. ANGGARAN (RAPBS)

### User Flow
```
[Bendahara / Admin — Awal Tahun Ajaran]
      │
      ▼
Menu: Bendahara → Anggaran (RAPBS)
      │
      ▼
[Buat RAPBS]
      │
      ▼
Pilih tahun ajaran
      │
      ▼
Input alokasi per kategori pengeluaran:
├── Gaji & Honor: Rp xxx
├── Operasional: Rp xxx
├── Sarpras: Rp xxx
├── Kegiatan: Rp xxx
└── Lainnya: Rp xxx
      │
      ▼
Simpan RAPBS
      │
      ▼
[Lihat Realisasi] (ter-update otomatis)
├── Tabel: Anggaran | Realisasi | Selisih | % Terpakai
└── Grafik visual per kategori
      │
      ▼
[Export RAPBS] → PDF / Excel
```

---

## 6. LAPORAN KEUANGAN

### User Flow
```
[Bendahara / Kepala Sekolah]
      │
      ▼
Menu: Bendahara → Laporan Keuangan
      │
      ▼
├── [Laporan Kas]
│       │
│       ▼
│   Pilih periode (bulan / semester / tahun ajaran)
│       │
│       ▼
│   Tampilkan:
│   ├── Saldo awal
│   ├── Total pemasukan (breakdown per kategori)
│   ├── Total pengeluaran (breakdown per kategori)
│   └── Saldo akhir
│       │
│       └── Export PDF / Excel
│
├── [Laporan Laba Rugi]
│       │
│       ▼
│   Tampilkan:
│   ├── Total pendapatan
│   ├── Total beban
│   └── Surplus / Defisit
│
├── [Laporan Anggaran]
│       │
│       ▼
│   Tampilkan: RAPBS vs Realisasi vs Selisih
│
└── [Audit Trail]
        │
        ▼
    Filter: user, tanggal, jenis aksi
        │
        ▼
    Read-only — immutable
        │
        └── Export PDF
```

---

# BAGIAN B — DASHBOARD TATA USAHA (TU)

---

## 1. DATA SDM

### 1.1 Data Guru

#### User Flow
```
[TU / Admin]
      │
      ▼
Menu: TU → Data SDM → Data Guru
      │
      ▼
├── [Tambah Guru]
│       │
│       ▼
│   Input:
│   ├── Nama Lengkap
│   ├── NIP (opsional, khusus PNS/PPPK)
│   ├── Status Kepegawaian: PNS / PPPK / Honorer
│   ├── Jenis Guru: Kelas / Mapel Umum / Keagamaan / Produktif
│   ├── Mata pelajaran diampu
│   ├── Kontak (WA, Email)
│   └── Foto
│       │
│       ▼
│   Simpan → akun login otomatis terbuat
│       │
│       ▼
│   Kirim kredensial via WA / Email
│
├── [Edit Guru] → update data (audit trail)
│
└── [Nonaktifkan Guru]
        │
        ▼
    Cek: ada rapor publish terkait guru ini?
    └── Nonaktif saja — histori tetap ada
```

---

### 1.2 Data Staf Sekolah

#### User Flow
```
[TU / Admin]
      │
      ▼
Menu: TU → Data SDM → Data Staf
      │
      ▼
├── [Tambah Staf]
│       │
│       ▼
│   Input:
│   ├── Nama
│   ├── Unit kerja: TU / Keuangan / Kurikulum / Kesiswaan
│   │               Sarpras / Perpustakaan / BK / IT / Keamanan
│   ├── Status kepegawaian
│   └── Kontak
│       │
│       ▼
│   Simpan → akun login sesuai unit kerja
│
└── [Edit / Nonaktifkan] → flow sama seperti guru
```

---

## 2. STRUKTUR ORGANISASI

### User Flow
```
[TU / Admin]
      │
      ▼
Menu: TU → Struktur Organisasi
      │
      ▼
Tampilkan bagan organisasi:
├── Kepala Sekolah
├── Wakil Kepala Sekolah:
│   ├── Bidang Kurikulum
│   ├── Bidang Kesiswaan
│   ├── Bidang Sarpras
│   └── Bidang Humas
└── Kepala Tata Usaha
      │
      ├── [Edit Struktur]
      │       │
      │       ▼
      │   Pilih pegawai → assign jabatan
      │       │
      │       ▼
      │   RULE: 1 jabatan utama = 1 orang
      │       │
      │       ▼
      │   Simpan → riwayat jabatan tersimpan
      │
      └── [Cetak Struktur] → Export PDF
```

---

## 3. ABSENSI PEGAWAI

### 3.1 Absensi Harian

#### User Flow
```
[TU / Admin]
      │
      ▼
Menu: TU → Absensi Pegawai → Harian
      │
      ▼
Pilih tanggal (default: hari ini)
      │
      ▼
Load daftar semua pegawai aktif (guru + staf)
      │
      ▼
Input status per pegawai:
├── Hadir ✓
├── Sakit (upload surat opsional)
├── Izin (input keterangan)
└── Alpha ✗
      │
      ▼
Simpan
      │
      ▼
Data terhubung ke:
├── Perhitungan gaji (potongan)
└── Laporan SDM
```

#### System Flow
```
POST /api/sdm/absensi
      │
      ▼
Validasi: tanggal belum punya absensi hari ini
      │
      ▼
Insert: absensi_pegawai (pegawai_id, tanggal, status, keterangan)
      │
      ▼
Jika Alpha > threshold → warning di dashboard KS
      │
      ▼
Catat audit_trail
```

---

### 3.2 Rekap Bulanan

#### User Flow
```
[TU / Bendahara]
      │
      ▼
Menu: TU → Absensi Pegawai → Rekap Bulanan
      │
      ▼
Pilih bulan & tahun
      │
      ▼
Sistem generate rekap otomatis:
├── Total hadir per pegawai
├── Total sakit
├── Total izin
├── Total alpha
└── % kehadiran
      │
      ▼
[Kunci Rekap] (akhir bulan → locked untuk gaji)
      │
      ▼
Export PDF / Excel
```

---

## 4. PENGGAJIAN

### 4.1 Komponen Gaji

#### User Flow
```
[TU / Admin — Setup awal]
      │
      ▼
Menu: TU → Penggajian → Komponen Gaji
      │
      ▼
Setup per status kepegawaian:
│
├── PNS:
│   ├── Gaji Pokok (sesuai golongan)
│   ├── Tunjangan Jabatan
│   └── Tunjangan Profesi
│
├── PPPK:
│   ├── Gaji Pokok
│   └── Tunjangan
│
└── Honorer:
    ├── Honor Jam Mengajar: [jam × tarif]
    └── (Tanpa gaji pokok)
      │
      ▼
Setup komponen khusus per jabatan (Wakasek, KTU, dll)
      │
      ▼
Simpan konfigurasi gaji
```

---

### 4.2 Hitung & Generate Slip Gaji

#### User Flow
```
[TU / Bendahara]
      │
      ▼
Menu: TU → Penggajian → Generate Slip Gaji
      │
      ▼
Pilih periode (bulan)
      │
      ▼
Sistem auto-kalkulasi:
├── Source: rekap absensi bulan ini
├── Source: jam mengajar (dari jadwal + penugasan)
├── Hitung per pegawai:
│   ├── Gaji pokok
│   ├── Tunjangan
│   ├── Honor jam mengajar
│   └── Potongan (per hari alpha)
└── Total gaji bersih
      │
      ▼
Review perhitungan per pegawai
      │
      ▼
[Publish Slip Gaji]
      │
      ▼
Efek publish:
├── Slip gaji terkunci (immutable)
├── Pegawai bisa lihat slip di portal masing-masing
├── Data dikirim ke Bendahara untuk diposting ke keuangan
└── Notifikasi ke pegawai (WA / Email)
```

#### System Flow
```
POST /api/penggajian/generate?periode=2025-01
      │
      ▼
Query: semua pegawai aktif
      │
      ▼
Loop per pegawai:
├── Ambil: rekap_absensi bulan ini
├── Ambil: jam_mengajar bulan ini (dari jadwal)
├── Kalkulasi berdasarkan komponen_gaji
└── Insert: slip_gaji (pegawai_id, periode, komponen[], total)
      │
      ▼
Setelah publish:
├── Insert ke transaksi_keluar (keuangan)
└── Trigger Inngest: notifikasi ke pegawai
      │
      ▼
Catat audit_trail
```

---

### 4.3 Lihat Slip Gaji (Portal Pegawai)

#### User Flow
```
[Guru / Staf — Login]
      │
      ▼
Menu: Data Saya → Slip Gaji
      │
      ▼
Tampilkan riwayat slip gaji:
├── Periode
├── Total gaji
└── Status: Sudah dibayar / Pending
      │
      ▼
Klik periode → lihat detail komponen
      │
      ▼
[Download PDF Slip Gaji]
```

---

## 5. PENGUMUMAN & NOTIFIKASI

### User Flow
```
[TU / Admin / Kepala Sekolah]
      │
      ▼
Menu: TU → Pengumuman
      │
      ▼
[Buat Pengumuman]
      │
      ▼
Input:
├── Judul
├── Isi pengumuman
├── Target penerima:
│   ├── Semua (Guru + Staf + Wali + Siswa)
│   ├── Hanya Guru & Staf
│   ├── Hanya Wali Murid
│   └── Per Kelas / Jenjang tertentu
├── Channel: WA / Email / Dashboard
└── Jadwal: Sekarang / Terjadwal
      │
      ▼
Preview
      │
      ▼
[Kirim / Jadwalkan]
      │
      ▼
Inngest Job: queue pengiriman per channel
      │
      ▼
Log pengiriman (success/failed/retry)
```

---

## 6. LAPORAN

### User Flow
```
[TU / Kepala Sekolah / Admin]
      │
      ▼
Menu: TU → Laporan
      │
      ├── [Laporan Akademik]
      │       │
      │       ▼
      │   Pilih jenis:
      │   ├── Nilai per siswa / per kelas / per jenjang
      │   ├── Perkembangan PAUD/TK
      │   └── Kompetensi SMK
      │       │
      │       ▼
      │   Pilih periode & filter
      │       │
      │       └── Export PDF / Excel
      │
      ├── [Laporan SDM]
      │       │
      │       ▼
      │   Pilih jenis:
      │   ├── Rekap kehadiran pegawai
      │   ├── Beban mengajar per guru
      │   └── Rekap gaji
      │       │
      │       └── Export PDF / Excel
      │
      └── [Laporan Keuangan] (Read-only dari modul Bendahara)
              │
              ▼
          Pilih jenis: Kas / Anggaran / Audit Trail
              │
              └── Export PDF / Excel
```

---

## PENGATURAN SEKOLAH

### User Flow
```
[Admin / Kepala Sekolah]
      │
      ▼
Menu: Pengaturan Sekolah
      │
      ├── [Profil Sekolah]
      │       ├── Nama, NPSN/NSM, Jenjang, Alamat, Kontak
      │       ├── Logo & Branding
      │       └── Tanda Tangan Digital (Kepala Sekolah)
      │
      ├── [Tahun Ajaran]
      │       ├── Buat tahun ajaran baru
      │       ├── Set aktif (hanya 1 aktif)
      │       └── Arsip tahun lama
      │
      ├── [Role & User]
      │       ├── Lihat semua user tenant
      │       ├── Tambah user baru
      │       ├── Assign/ubah role
      │       └── Nonaktifkan user
      │
      ├── [Modul & Fitur]
      │       ├── Toggle ON/OFF per modul
      │       └── Feature flag per fitur
      │
      └── [Notifikasi]
              ├── Setup WA Gateway (input API key)
              ├── Setup Email (via Resend)
              ├── Event yang aktif
              └── Template pesan per event
```
