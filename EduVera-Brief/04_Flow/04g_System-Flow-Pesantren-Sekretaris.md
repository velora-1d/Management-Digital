# FLOW PESANTREN — DASHBOARD SEKRETARIS

---

## 1. DATA SDM

### 1.1 Ustadz

#### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Data SDM → Ustadz
      │
      ▼
Lihat daftar ustadz aktif
      │
      ├── [Tambah Ustadz]
      │       │
      │       ▼
      │   Input:
      │   ├── Nama lengkap
      │   ├── NIK (opsional)
      │   ├── Bidang: Diniyah / Tahfidz
      │   ├── Marhalah yang diampu
      │   ├── Status kepegawaian: Tetap / Kontrak / Khidmah
      │   ├── Kontak (WA, Email)
      │   └── Foto (opsional)
      │       │
      │       ▼
      │   Simpan → Ustadz aktif
      │       │
      │       ▼
      │   Sistem otomatis buat akun login ustadz
      │       │
      │       ▼
      │   Kirim kredensial via WA / Email
      │
      ├── [Edit Ustadz]
      │       │
      │       ▼
      │   Update data → audit trail tercatat
      │
      ├── [Nonaktifkan Ustadz]
      │       │
      │       ▼
      │   Cek: apakah ustadz punya data historis (nilai, setoran)?
      │   ├── ADA → nonaktif saja (data tetap)
      │   └── TIDAK ADA → bisa hapus
      │
      └── [Lihat Detail Ustadz]
              ├── Profil lengkap
              ├── Riwayat mengajar (Kitab / Halaqah / Tahfidz)
              └── Rekap absensi & honor
```

#### System Flow
```
POST /api/sdm/ustadz
      │
      ▼
Validasi: nama wajib, bidang valid
      │
      ▼
Insert ke table: sdm (tenant_id, nama, bidang, status_kepegawaian)
      │
      ▼
Auto-create user account (role: ustadz_diniyah / ustadz_tahfidz)
      │
      ▼
Generate temporary password
      │
      ▼
Trigger Inngest: kirim WA + Email kredensial
      │
      ▼
Catat audit_trail
```

---

### 1.2 Musyrif

#### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Data SDM → Musyrif
      │
      ▼
├── [Tambah Musyrif]
│       │
│       ▼
│   Input:
│   ├── Nama
│   ├── Asrama tanggung jawab (pilih dari daftar asrama)
│   ├── Jadwal jaga (Pagi / Malam / Keduanya)
│   ├── Status kepegawaian
│   └── Kontak
│       │
│       ▼
│   Simpan → Musyrif terikat ke asrama
│       │
│       ▼
│   Buat akun login (role: musyrif)
│
└── [Lihat Detail Musyrif]
        ├── Asrama tanggung jawab
        ├── Jadwal jaga
        └── Rekap absensi SDM
```

---

### 1.3 Pengurus Pesantren

#### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Data SDM → Pengurus
      │
      ▼
├── [Tambah Pengurus]
│       │
│       ▼
│   Input:
│   ├── Nama
│   ├── Jabatan: Pengasuh/Kyai / Mudir / Sekretaris / Bendahara
│   │            Keamanan / Kesehatan / Konsumsi
│   ├── Periode jabatan (dari - sampai)
│   └── Kontak
│       │
│       ▼
│   Simpan → Role sistem disesuaikan jabatan
│
└── [Riwayat Jabatan]
        └── Histori pengurus per periode (read-only)
```

---

### 1.4 Staf Pesantren

#### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Data SDM → Staf
      │
      ▼
├── [Tambah Staf]
│       │
│       ▼
│   Input:
│   ├── Nama
│   ├── Unit kerja: Dapur / Kesehatan / Keamanan / Kebersihan
│   ├── Jadwal kerja
│   └── Status aktif
│       │
│       ▼
│   Simpan
│
└── [Lihat Staf Aktif] → filter per unit kerja
```

---

## 2. STRUKTUR ORGANISASI

### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Struktur Organisasi
      │
      ▼
Tampilkan bagan organisasi visual:
├── Pengasuh / Kyai (puncak)
├── Mudir
├── Sekretaris & Bendahara
└── Kepala Bidang
      │
      ├── [Edit Struktur]
      │       │
      │       ▼
      │   Pilih SDM → Assign jabatan → Simpan
      │
      └── [Cetak Struktur] → Export PDF
```

### System Flow
```
GET /api/sdm/struktur-organisasi
      │
      ▼
Query: jabatan aktif + sdm terkait
      │
      ▼
Return tree struktur
      │
      ▼
Render bagan di frontend (shadcn tree component)
```

---

## 3. ABSENSI SDM

### 3.1 Absensi Harian

#### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Absensi SDM → Absensi Harian
      │
      ▼
Pilih tanggal (default: hari ini)
      │
      ▼
Load daftar semua SDM aktif
      │
      ▼
Input status per SDM:
├── Hadir ✓
├── Izin (input keterangan)
├── Sakit (upload surat opsional)
└── Alpha
      │
      ▼
[Simpan Absensi]
      │
      ▼
Data tersimpan → terhubung ke perhitungan honor
```

#### System Flow
```
POST /api/sdm/absensi
      │
      ▼
Validasi: tanggal tidak duplikat per SDM
      │
      ▼
Insert: absensi_sdm (sdm_id, tanggal, status, keterangan)
      │
      ▼
Flag: jika alpha > threshold → warning di dashboard
      │
      ▼
Catat audit_trail
```

---

### 3.2 Rekap Bulanan

#### User Flow
```
[Sekretaris / Admin / Bendahara]
      │
      ▼
Menu: SDM → Absensi SDM → Rekap Bulanan
      │
      ▼
Pilih bulan & tahun
      │
      ▼
Sistem generate rekap otomatis:
├── Total hadir per SDM
├── Total izin per SDM
├── Total alpha per SDM
└── Persentase kehadiran
      │
      ▼
[Kunci Rekap] (akhir bulan → locked)
      │
      ▼
Export PDF / Excel
```

---

## 4. HONOR & INSENTIF

### 4.1 Honor Mengajar Ustadz

#### User Flow
```
[Sekretaris / Bendahara]
      │
      ▼
Menu: SDM → Honor & Insentif → Honor Mengajar
      │
      ▼
Pilih periode (bulan)
      │
      ▼
Sistem auto-kalkulasi:
├── Source data: absensi mengajar + jadwal halaqah/tahfidz
├── Hitung: jumlah pertemuan × tarif
└── Breakdown per ustadz
      │
      ▼
Review perhitungan
      │
      ▼
[Setujui & Kirim ke Bendahara]
      │
      ▼
Bendahara verifikasi → posting ke pengeluaran keuangan
      │
      ▼
Ustadz bisa lihat slip honor (portal ustadz)
```

#### System Flow
```
GET /api/sdm/honor-kalkulasi?periode=2025-01
      │
      ▼
Query absensi_sdm + jadwal_mengajar per ustadz
      │
      ▼
Kalkulasi:
├── Jika skema per-pertemuan: COUNT(hadir) × tarif
├── Jika skema per-jam: SUM(jam_mengajar) × tarif
└── Jika skema bulanan: flat rate (dikurangi potongan alpha)
      │
      ▼
Return preview honor per ustadz
      │
      ▼
Setelah approve → insert pengeluaran_keuangan
      │
      ▼
Catat audit_trail
```

---

### 4.2 Insentif Tahfidz

#### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: SDM → Honor & Insentif → Insentif Tahfidz
      │
      ▼
Pilih periode
      │
      ▼
Sistem load capaian santri per ustadz tahfidz
(dari modul Tahfidz)
      │
      ▼
Kalkulasi insentif berdasarkan:
├── Target marhalah tercapai
├── Jumlah santri berprestasi
└── Program khusus (jika ada)
      │
      ▼
Review → Setujui
      │
      ▼
Kirim ke Bendahara untuk diposting
```

---

### 4.3 Riwayat Pembayaran

#### User Flow
```
[Sekretaris / SDM — Lihat honor diri sendiri]
      │
      ▼
Menu: SDM → Honor & Insentif → Riwayat Pembayaran
      │
      ▼
Filter: Per SDM / Per Periode / Per Jenis
      │
      ▼
Tampilkan:
├── Periode
├── Jenis honor/insentif
├── Nominal
└── Status: Dibayar / Pending
      │
      ▼
[Cetak Slip Honor] → Export PDF
```

---

## 5. PENGUMUMAN & NOTIFIKASI

### User Flow
```
[Sekretaris / Admin]
      │
      ▼
Menu: Sekretaris → Pengumuman
      │
      ▼
[Buat Pengumuman]
      │
      ▼
Input:
├── Judul pengumuman
├── Isi pesan
├── Target penerima:
│   ├── Semua (Santri + Ustadz + Wali)
│   ├── Hanya Ustadz & SDM
│   ├── Hanya Wali Santri
│   └── Custom (pilih marhalah/asrama tertentu)
├── Channel: WA / Email / Dashboard (bisa multi-channel)
└── Jadwal kirim: Sekarang / Jadwalkan (tanggal & jam)
      │
      ▼
Preview pesan
      │
      ▼
[Kirim / Jadwalkan]
      │
      ▼
Inngest Job: queue pengiriman per channel
      │
      ▼
Log pengiriman tersimpan (success / failed / retry)
```

### System Flow
```
POST /api/pengumuman
      │
      ▼
Simpan ke table: pengumuman (tenant_id, judul, isi, target, channel)
      │
      ▼
Jika jadwal sekarang → Trigger Inngest Job langsung
Jika terjadwal → Inngest scheduled job (cron)
      │
      ▼
Inngest Job:
├── Query penerima berdasarkan target
├── Loop per penerima
│   ├── Kirim WA (via Fonnte)
│   └── Kirim Email (via Resend)
├── Log: success / failed
└── Retry jika gagal (max 3x)
```

---

## 6. LAPORAN SEKRETARIAT

### User Flow
```
[Sekretaris / Mudir]
      │
      ▼
Menu: Sekretaris → Laporan
      │
      ├── [Laporan SDM]
      │       │
      │       ▼
      │   Pilih periode
      │       │
      │       ▼
      │   Pilih jenis:
      │   ├── Rekap Kehadiran SDM
      │   ├── Beban Mengajar per Ustadz
      │   └── Rekap Honor
      │       │
      │       ▼
      │   Generate → tampilkan tabel
      │       │
      │       └── Export PDF / Excel
      │
      └── [Laporan Kepesantrenan]
              │
              ▼
          Source: modul Kepesantrenan
              │
              ▼
          Pilih:
          ├── Rekap pelanggaran per periode
          ├── Rekap perizinan
          └── Statistik santri
              │
              └── Export PDF / Excel
```
