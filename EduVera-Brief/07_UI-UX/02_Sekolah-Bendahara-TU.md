# UI / UX — SEKOLAH: BENDAHARA & TU
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# DASHBOARD BENDAHARA SEKOLAH

## Layout Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo | [Sekolah] | 🔔 | Avatar                      │
├──────────────┬───────────────────────────────────────────────┤
│ SIDEBAR      │  Dashboard Bendahara                         │
│ ─────────    │  📅 Maret 2026                               │
│ 📊 Dashboard │                                               │
│ ─────────    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ Keuangan     │  │Saldo │ │Masuk │ │Keluar│ │Surplus│       │
│ > COA        │  │48,5jt│ │32jt  │ │18jt  │ │+14jt │       │
│ > SPP        │  └──────┘ └──────┘ └──────┘ └──────┘        │
│ > Pemasukan  │                                               │
│ > Pengeluaran│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ > RAPBS      │  │Total │ │Lunas │ │Belum │ │RAPBS │        │
│ > Laporan    │  │SPP   │ │      │ │Bayar │ │78%   │        │
│              │  │42jt  │ │33jt  │ │9jt   │ │pakai │        │
└──────────────┴──└──────┘─└──────┘─└──────┘─└──────┘────────┘
```

## Halaman Status Pembayaran SPP
```
┌──────────────────────────────────────────────────────────────┐
│ SPP & Tagihan — Maret 2026        [Generate SPP] [Export]   │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari nama/NIS...  [Kelas ▼] [Status ▼]                  │
│                                                              │
│ Ringkasan: Total 450 | Lunas 351 (78%) | Belum 99 (22%)     │
├────┬────────────────┬──────────┬───────────────┬────────────┤
│ #  │ Nama Siswa     │ Kelas    │ Status        │ Aksi      │
├────┼────────────────┼──────────┼───────────────┼────────────┤
│ 1  │ Ahmad Fauzi    │ VII A    │ ✅ Lunas      │ [Detail]  │
│ 2  │ Budi Santoso   │ VIII B   │ ⚠️ Sebagian   │ [Konfirm] │
│ 3  │ Citra Dewi     │ VII A    │ 🔴 Belum Bayar│ [Konfirm] │
│ 4  │ Diana Putri    │ IX A     │ ✅ Lunas      │ [Detail]  │
└────┴────────────────┴──────────┴───────────────┴────────────┘
```

## Form Konfirmasi Pembayaran SPP
```
┌────────────────────────────────────────┐
│  Konfirmasi Pembayaran SPP             │
│  Siswa: Budi Santoso — Kelas VIII B   │
│  Tagihan: Maret 2026 — Rp 350.000     │
│  ────────────────────────────────────  │
│  Nominal Diterima *                    │
│  [Rp 350.000                      ]   │
│                                        │
│  Tanggal Bayar *                       │
│  [08/03/2026                      ]   │
│                                        │
│  Metode Pembayaran *                   │
│  ◉ Transfer   ○ Cash   ○ Lainnya      │
│                                        │
│  Upload Bukti (opsional)               │
│  [ 📎 Pilih file... ]                 │
│                                        │
│  [ Batal ]         [ ✅ Konfirmasi ]   │
└────────────────────────────────────────┘
```

## Halaman COA
```
┌──────────────────────────────────────────────────────────────┐
│ COA / Akun Keuangan                          [ + Tambah ]   │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...     [Tipe ▼]                                     │
├──────────┬───────────────────────────┬───────────┬──────────┤
│ Kode     │ Nama Akun                 │ Tipe      │ Aksi    │
├──────────┼───────────────────────────┼───────────┼──────────┤
│ 1-001    │ Kas Tunai                 │ Aset      │ [Edit]  │
│ 1-002    │ Rekening Bank BRI         │ Aset      │ [Edit]  │
│ 4-001    │ Pemasukan SPP             │ Pemasukan │ [Edit]  │
│ 4-002    │ Dana BOS                  │ Pemasukan │ [Edit]  │
│ 5-001    │ Biaya Operasional         │ Pengeluaran│ [Edit] │
│ 5-002    │ Gaji & Honor              │ Pengeluaran│ [Edit] │
└──────────┴───────────────────────────┴───────────┴──────────┘
```

## Halaman RAPBS
```
┌──────────────────────────────────────────────────────────────┐
│ RAPBS 2025/2026                       [ + Tambah Kategori ] │
├──────────────────────────────────────────────────────────────┤
│ Total Anggaran: Rp 480.000.000   Realisasi: Rp 312.000.000   │
│ ████████████████████░░░░░░░░░░  65% terpakai               │
├──────────────────┬────────────┬────────────┬────────────────┤
│ Kategori         │ Anggaran   │ Realisasi  │ Sisa / %      │
├──────────────────┼────────────┼────────────┼────────────────┤
│ Gaji & Honor     │ 240.000.000│ 180.000.000│ 60jt / 75%    │
│ Operasional      │  80.000.000│  52.000.000│ 28jt / 65%    │
│ Sarpras          │  60.000.000│  55.000.000│ ⚠️ 5jt / 8%   │
│ Kegiatan Siswa   │  40.000.000│  18.000.000│ 22jt / 45%    │
│ Dana BOS         │  60.000.000│   7.000.000│ 53jt / 12%    │
└──────────────────┴────────────┴────────────┴────────────────┘
⚠️ Sarpras hampir habis anggaran (sisa < 10%)
```

## Halaman Laporan Keuangan
```
┌──────────────────────────────────────────────────────────────┐
│ Laporan Keuangan                                            │
├──────────────────────────────────────────────────────────────┤
│ [Laporan Kas] [Laba Rugi] [Anggaran] [Audit Trail]          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Periode: [Jan 2026 ▼] s/d [Mar 2026 ▼]   [Generate]       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  LAPORAN KAS — Jan s/d Mar 2026                     │    │
│  │  Saldo Awal: Rp 35.000.000                          │    │
│  │  Total Masuk: Rp 96.000.000                         │    │
│  │  Total Keluar: Rp 72.000.000                        │    │
│  │  ──────────────────────────                         │    │
│  │  Saldo Akhir: Rp 59.000.000                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  [📄 Export PDF]   [📊 Export Excel]                        │
└──────────────────────────────────────────────────────────────┘
```

---

# DASHBOARD TU (TATA USAHA)

## Layout Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard TU                                                 │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Pegawai  │ │Absensi   │ │ Slip Gaji│ │ Inventaris│       │
│  │  50 org  │ │ Hari Ini │ │ Bulan ini│ │ 12 Rusak  │       │
│  │ Aktif    │ │ 94% Hadir│ │ Published│ │           │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Total Gaji│ │ Surat    │ │Pengumuman│ │ Alpha    │        │
│  │ Rp 85jt  │ │ 3 Pending│ │ 5 Terkirim│ │ 2 Orng  │       │
└──────────────┴─────────────┴────────────┴──────────┘        │
```

## Halaman Absensi Pegawai
```
┌──────────────────────────────────────────────────────────────┐
│ Absensi Pegawai                          [Rekap] [Export]   │
│ Senin, 8 Maret 2026                                         │
├──────────────────────────────────────────────────────────────┤
│ [Default Semua Hadir]   Hadir: 46 | Alpha: 2 | Izin: 2     │
├────┬─────────────────┬──────────┬────────┬────────┬─────────┤
│ #  │ Nama Pegawai    │ Unit     │ Hadir  │ Izin   │ Alpha  │
├────┼─────────────────┼──────────┼────────┼────────┼─────────┤
│ 1  │ Pak Ahmad       │ Guru     │ ◉      │ ○      │ ○      │
│ 2  │ Bu Sari         │ Guru     │ ◉      │ ○      │ ○      │
│ 3  │ Pak Hasan       │ TU       │ ○      │ ◉      │ ○      │
│ 4  │ Bu Dewi         │ Keuangan │ ○      │ ○      │ ◉      │
└────┴─────────────────┴──────────┴────────┴────────┴─────────┘
                                              [Simpan Absensi]
```

## Halaman Struktur Organisasi
```
┌──────────────────────────────────────────────────────────────┐
│ Struktur Organisasi                    [Edit] [Export PDF]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌──────────────┐                          │
│                    │ Kepala Sekolah│                         │
│                    │  Drs. Suparman│                         │
│                    └──────┬───────┘                          │
│           ┌───────────────┼───────────────┐                  │
│    ┌──────┴─────┐  ┌──────┴─────┐  ┌──────┴──────┐          │
│    │Wakasek Kur.│  │Wakasek Ksis│  │ Kepala TU   │          │
│    │ Pak Budi   │  │ Bu Rina    │  │  Pak Hendra │          │
│    └────────────┘  └────────────┘  └─────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Penggajian — Generate Slip Gaji
```
┌──────────────────────────────────────────────────────────────┐
│ Generate Slip Gaji                                          │
│ Periode: Maret 2026                                         │
├──────────────────────────────────────────────────────────────┤
│ ⚠️ Pastikan rekap absensi Maret 2026 sudah dikunci          │
│ Status rekap: ✅ Sudah dikunci (31 Maret 2026)              │
├────┬────────────────┬────────────┬───────────┬──────────────┤
│ #  │ Nama Pegawai   │ Status Kep │ Total Gaji│ Status      │
├────┼────────────────┼────────────┼───────────┼──────────────┤
│ 1  │ Pak Ahmad      │ PNS        │ Rp 4.2jt  │ Draft       │
│ 2  │ Bu Sari        │ Honorer    │ Rp 2.1jt  │ Draft       │
│ 3  │ Pak Budi       │ PPPK       │ Rp 3.8jt  │ Draft       │
│ .. │ ...            │ ...        │ ...       │ ...         │
├────┴────────────────┴────────────┴───────────┴──────────────┤
│ Total Gaji: Rp 85.400.000          [Review] [Publish Semua] │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Inventaris
```
┌──────────────────────────────────────────────────────────────┐
│ Inventaris & Sarpras                       [ + Tambah ]     │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...   [Kategori ▼]  [Kondisi ▼]                     │
├──────┬────────────────┬──────────┬──────────┬───────────────┤
│ Kode │ Nama Barang    │ Jumlah   │ Kondisi  │ Aksi         │
├──────┼────────────────┼──────────┼──────────┼───────────────┤
│ K001 │ Kursi Siswa    │ 450 unit │ ✅ Baik  │ [Edit]       │
│ M001 │ Meja Guru      │ 32 unit  │ ✅ Baik  │ [Edit]       │
│ P001 │ Proyektor      │ 8 unit   │ ⚠️ Rusak │ [Edit]       │
│ K002 │ Komputer Lab   │ 40 unit  │ ✅ Baik  │ [Edit]       │
└──────┴────────────────┴──────────┴──────────┴───────────────┘
```

## Halaman Surat Menyurat
```
┌──────────────────────────────────────────────────────────────┐
│ Surat Menyurat                                              │
├──────────────────────────────────────────────────────────────┤
│ [Surat Masuk] [Surat Keluar] [Surat Keterangan]             │
├──────────────────────────────────────────────────────────────┤
│ TAB: Surat Masuk                  [+ Catat Surat Masuk]     │
│                                                              │
│ 🔍 Cari...    [Disposisi ▼]                                 │
├────────┬───────────────────────────┬──────────┬────────────┤
│ Tgl    │ Perihal                   │ Pengirim │ Status    │
├────────┼───────────────────────────┼──────────┼────────────┤
│ 8/3/26 │ Undangan Rapat Dinas      │ Disdik   │ Terdispos │
│ 5/3/26 │ Pemberitahuan UN 2026     │ Kemendik │ ✅ Selesai │
│ 1/3/26 │ Tagihan Listrik           │ PLN      │ ⏳ Pending│
└────────┴───────────────────────────┴──────────┴────────────┘
```

## Halaman Pengaturan Sekolah
```
┌──────────────────────────────────────────────────────────────┐
│ Pengaturan Sekolah                                          │
├──────────────────────────────────────────────────────────────┤
│ [Profil] [Tahun Ajaran] [Role & User] [Modul] [Notifikasi] │
├──────────────────────────────────────────────────────────────┤
│ TAB: Profil Sekolah                                         │
│                                                              │
│  ┌──────────┐  Nama Sekolah                                 │
│  │  [Logo]  │  [SMP Negeri 1 Bandung              ]        │
│  │  Upload  │                                               │
│  └──────────┘  NPSN                                         │
│               [20200001                         ]           │
│                                                              │
│               Kepala Sekolah                                 │
│               [Drs. Suparman, M.Pd.             ]           │
│                                                              │
│               Tanda Tangan Digital                          │
│               [ 📎 Upload file TTD... ]                    │
│                                                              │
│                             [Simpan Perubahan]              │
└──────────────────────────────────────────────────────────────┘
```
