# FLOW PESANTREN — DASHBOARD BENDAHARA

---

## 1. MASTER KEUANGAN

### 1.1 COA / Akun

#### User Flow
```
[Bendahara / Admin]
      │
      ▼
Menu: Keuangan → Master Keuangan → COA
      │
      ▼
Lihat daftar akun (Aset, Kewajiban, Dana, Pemasukan, Pengeluaran)
      │
      ├── [Tambah Akun]
      │       │
      │       ▼
      │   Input: Nama Akun, Tipe, Kode Akun
      │       │
      │       ▼
      │   Simpan → Akun aktif
      │
      ├── [Edit Akun]
      │       │
      │       ▼
      │   Update nama/tipe → Log perubahan tercatat
      │
      └── [Nonaktifkan Akun]
              │
              ▼
          Cek: apakah akun sudah dipakai transaksi?
          ├── SUDAH → hanya bisa nonaktif (tidak bisa hapus)
          └── BELUM → bisa dihapus
```

#### System Flow
```
POST /api/keuangan/coa
      │
      ▼
Validasi: kode akun unik per tenant
      │
      ▼
Simpan ke table: coa (tenant_id, kode, nama, tipe, status)
      │
      ▼
Catat audit_trail
```

---

### 1.2 Kategori Pemasukan & Pengeluaran

#### User Flow
```
[Bendahara / Admin]
      │
      ▼
Menu: Master Keuangan → Kategori
      │
      ├── Kategori Pemasukan
      │   ├── Default: SPP, Konsumsi, Donasi, Wakaf
      │   └── [Tambah Custom] → Input nama → Simpan
      │
      └── Kategori Pengeluaran
          ├── Default: Honor, Konsumsi, Operasional, Sarpras
          └── [Tambah Custom] → Input nama → Simpan
```

---

## 2. SPP & TAGIHAN SANTRI

### User Flow
```
[Bendahara / Admin]
      │
      ▼
Menu: Keuangan → SPP & Tagihan
      │
      ▼
Lihat daftar tagihan bulan ini
      │
      ├── [Generate Tagihan Bulanan]
      │       │
      │       ▼
      │   Sistem load semua santri aktif
      │       │
      │       ▼
      │   Preview jumlah tagihan per santri
      │       │
      │       ▼
      │   Konfirmasi → Generate
      │       │
      │       ▼
      │   Tagihan tergenerate untuk semua santri
      │       │
      │       ▼
      │   Trigger notifikasi WA ke wali santri
      │
      ├── [Lihat Status Pembayaran]
      │   ├── Filter: Lunas / Sebagian / Belum Bayar
      │   ├── Filter: Per Santri / Per Asrama / Per Marhalah
      │   └── Klik santri → detail riwayat pembayaran
      │
      ├── [Konfirmasi Pembayaran Manual]
      │       │
      │       ▼
      │   Pilih santri
      │       │
      │       ▼
      │   Input: nominal, tanggal, metode (Transfer/Cash)
      │       │
      │       ▼
      │   Upload bukti (opsional)
      │       │
      │       ▼
      │   Simpan → Status: Lunas / Sebagian
      │       │
      │       ▼
      │   Notifikasi WA ke wali santri (konfirmasi lunas)
      │
      └── [Export] → PDF / Excel daftar tagihan
```

### System Flow
```
[Generate Tagihan]
      │
      ▼
Query: SELECT santri WHERE status=aktif AND tahun_ajaran=aktif
      │
      ▼
Loop per santri → buat record tagihan_spp
(tenant_id, santri_id, periode, nominal, status=BELUM)
      │
      ▼
Trigger Inngest Job: kirim WA ke wali_santri
      │
      ▼
Log aktivitas

[Konfirmasi Pembayaran]
      │
      ▼
Update tagihan_spp: status=LUNAS, tgl_bayar, metode
      │
      ▼
Insert transaksi_masuk (COA Pemasukan SPP)
      │
      ▼
Trigger Inngest Job: notifikasi WA ke wali
      │
      ▼
Catat audit_trail
```

---

## 3. PEMASUKAN

### 3.1 Donasi

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Keuangan → Pemasukan → Donasi
      │
      ▼
[Tambah Donasi]
      │
      ▼
Input:
├── Nama Donatur
├── Nominal
├── Tanggal
├── Tujuan: Bebas / Terikat (pilih program)
└── Keterangan
      │
      ▼
Simpan → Otomatis masuk ke COA Pemasukan Donasi
      │
      ▼
Audit trail tercatat
```

---

### 3.2 Wakaf

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Keuangan → Pemasukan → Wakaf
      │
      ▼
[Tambah Wakaf]
      │
      ▼
Input:
├── Nama Wakif
├── Jenis Wakaf (Tunai / Barang)
├── Nominal / Deskripsi barang
├── Tanggal
└── Peruntukan
      │
      ▼
Simpan → COA Wakaf TERPISAH dari operasional
```

#### System Flow
```
RULE KETAT:
- Dana wakaf → COA terpisah (tidak bisa mix operasional)
- Laporan wakaf → terpisah dari laporan kas umum
- Audit trail wajib
```

---

## 4. PENGELUARAN

### 4.1 Honor Ustadz (dari SDM)

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Keuangan → Pengeluaran → Honor Ustadz
      │
      ▼
Sistem auto-load data dari modul SDM:
├── Daftar ustadz aktif
├── Absensi mengajar bulan ini
└── Skema honor per ustadz
      │
      ▼
Review perhitungan honor
      │
      ▼
[Verifikasi & Setujui]
      │
      ▼
Simpan → Otomatis posting ke COA Pengeluaran Honor
      │
      ▼
Slip honor bisa dilihat oleh ustadz
```

---

### 4.2 Konsumsi / Operasional / Sarpras

#### User Flow
```
[Bendahara]
      │
      ▼
Menu: Keuangan → Pengeluaran → [pilih kategori]
      │
      ▼
[Tambah Pengeluaran]
      │
      ▼
Input:
├── Kategori (Konsumsi / Operasional / Sarpras)
├── Nominal
├── Tanggal
├── Keterangan
└── Upload bukti (foto/dokumen)
      │
      ▼
Simpan → Otomatis kurangi anggaran kategori
      │
      ▼
Warning jika anggaran hampir habis (< 10%)
```

#### System Flow
```
POST /api/keuangan/pengeluaran
      │
      ▼
Validasi: kategori valid, nominal > 0
      │
      ▼
Insert transaksi_keluar
      │
      ▼
Update realisasi_anggaran (kategori terkait)
      │
      ▼
Cek threshold anggaran → jika < 10% → trigger warning notifikasi
      │
      ▼
Catat audit_trail (immutable)
```

---

## 5. ANGGARAN PESANTREN

### User Flow
```
[Bendahara / Admin — Awal Tahun Hijriah]
      │
      ▼
Menu: Keuangan → Anggaran
      │
      ▼
[Buat Anggaran Tahun Ini]
      │
      ▼
Pilih tahun hijriah
      │
      ▼
Input alokasi per kategori:
├── Honor: Rp xxx
├── Konsumsi: Rp xxx
├── Operasional: Rp xxx
└── Sarpras: Rp xxx
      │
      ▼
Simpan → Anggaran aktif
      │
      ▼
[Lihat Realisasi] (otomatis ter-update saat ada transaksi)
├── Anggaran vs Realisasi per kategori
├── Sisa anggaran
└── Grafik progres
```

---

## 6. LAPORAN KEUANGAN

### User Flow
```
[Bendahara / Mudir / Pengasuh]
      │
      ▼
Menu: Keuangan → Laporan
      │
      ├── [Laporan Kas]
      │       │
      │       ▼
      │   Pilih periode (bulan / tahun / hijriah)
      │       │
      │       ▼
      │   Tampilkan: Saldo awal, Pemasukan, Pengeluaran, Saldo akhir
      │       │
      │       └── Export PDF / Excel
      │
      ├── [Laporan Anggaran]
      │       │
      │       ▼
      │   Tampilkan: Anggaran vs Realisasi vs Selisih per kategori
      │       │
      │       └── Export PDF / Excel
      │
      └── [Audit Trail]
              │
              ▼
          Filter: user, tanggal, jenis aksi
              │
              ▼
          Read-only — tidak bisa diedit/hapus
```

### System Flow — Laporan Kas
```
GET /api/laporan/kas?periode=2025-01
      │
      ▼
Query:
├── SUM pemasukan WHERE periode=x AND tenant=x
├── SUM pengeluaran WHERE periode=x AND tenant=x
└── Hitung saldo
      │
      ▼
Return data → render tabel
      │
      ▼
Jika export PDF → trigger Inngest job (Puppeteer generate PDF)
      │
      ▼
PDF tersimpan di Cloudflare R2 → return download URL
```
