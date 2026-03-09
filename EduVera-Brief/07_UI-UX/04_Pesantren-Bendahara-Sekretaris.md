# UI / UX — PESANTREN: BENDAHARA & SEKRETARIS
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# DASHBOARD BENDAHARA PESANTREN

## Layout Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard Bendahara Pesantren                               │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Saldo Kas│ │Saldo Wkaf│ │Pemasukan │ │Pengeluaran│       │
│  │ Rp 125jt │ │ Rp 45jt  │ │ Rp 78jt  │ │ Rp 54jt  │       │
│  │Operasional│ │TERPISAH  │ │Bulan ini │ │Bulan ini │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │SPP Lunas │ │ Tunggakan│ │ Donasi   │ │ Anggaran │        │
│  │ 82% / 256│ │ Rp 28jt  │ │ Rp 12jt  │ │ 71%      │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└──────────────────────────────────────────────────────────────┘
```

## Halaman COA Pesantren
```
┌──────────────────────────────────────────────────────────────┐
│ COA / Akun Keuangan                          [ + Tambah ]   │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...     [Tipe ▼]                                     │
├──────────┬───────────────────────────┬───────────┬──────────┤
│ Kode     │ Nama Akun                 │ Tipe      │ Aksi    │
├──────────┼───────────────────────────┼───────────┼──────────┤
│ 1-001    │ Kas Operasional           │ Aset      │ [Edit]  │
│ 1-002    │ Rekening Bank             │ Aset      │ [Edit]  │
│ 1-010    │ Dana Wakaf                │ Dana (W)  │ 🔒 Wakaf│
│ 4-001    │ Pemasukan SPP             │ Pemasukan │ [Edit]  │
│ 4-002    │ Donasi Terikat            │ Pemasukan │ [Edit]  │
│ 4-003    │ Donasi Bebas              │ Pemasukan │ [Edit]  │
│ 5-001    │ Honor Ustadz              │ Pengeluaran│ [Edit] │
│ 5-002    │ Konsumsi                  │ Pengeluaran│ [Edit] │
└──────────┴───────────────────────────┴───────────┴──────────┘
🔒 = Akun wakaf — tidak bisa dipakai untuk transaksi operasional
```

## Halaman SPP Santri
```
┌──────────────────────────────────────────────────────────────┐
│ SPP & Tagihan — Sya'ban 1446 H         [Generate] [Export] │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...  [Asrama ▼] [Marhalah ▼] [Status ▼]             │
│ Ringkasan: Lunas 256 (82%) | Sebagian 28 | Belum 36         │
├────┬────────────────┬──────────┬───────────────┬────────────┤
│ #  │ Nama Santri    │ Marhalah │ Status        │ Aksi      │
├────┼────────────────┼──────────┼───────────────┼────────────┤
│ 1  │ Ali Hasan      │ Wustha   │ ✅ Lunas      │ [Detail]  │
│ 2  │ Basyir Ahmad   │ Ula      │ ⚠️ Sebagian   │ [Konfirm] │
│ 3  │ Husain Umar    │ I'dadiyah│ 🔴 Belum Bayar│ [Konfirm] │
└────┴────────────────┴──────────┴───────────────┴────────────┘
```

## Halaman Pemasukan — Donasi & Wakaf
```
┌──────────────────────────────────────────────────────────────┐
│ Pemasukan                                                   │
├──────────────────────────────────────────────────────────────┤
│ [SPP Santri] [Donasi] [Wakaf]                               │
├──────────────────────────────────────────────────────────────┤
│ TAB: Wakaf                              [ + Catat Wakaf ]   │
│                                                              │
│ ⚠️ Dana wakaf dicatat di COA TERPISAH                       │
│    Tidak bisa digabung dengan kas operasional               │
│                                                              │
├──────────┬────────────────┬──────────────┬──────────────────┤
│ Tgl      │ Wakif (Donatur)│ Jenis        │ Nominal/Keterangan│
├──────────┼────────────────┼──────────────┼──────────────────┤
│ 5/3/26   │ H. Abdullah    │ Tunai        │ Rp 10.000.000   │
│ 1/3/26   │ Yayasan X      │ Barang       │ 10 unit AC       │
│ 28/2/26  │ Bu Siti Rahma  │ Tunai        │ Rp 5.000.000    │
└──────────┴────────────────┴──────────────┴──────────────────┘
```

## Halaman Anggaran Pesantren
```
┌──────────────────────────────────────────────────────────────┐
│ Anggaran 1446 H                       [ + Tambah Kategori ] │
├──────────────────────────────────────────────────────────────┤
│ Total Anggaran: Rp 960.000.000  |  Realisasi: Rp 681.000.000│
│ ████████████████████░░░░░░░░░  71% terpakai                 │
├──────────────────┬────────────┬────────────┬────────────────┤
│ Kategori         │ Anggaran   │ Realisasi  │ Sisa / %      │
├──────────────────┼────────────┼────────────┼────────────────┤
│ Honor Ustadz     │ 480.000.000│ 336.000.000│ 144jt / 70%   │
│ Konsumsi         │ 240.000.000│ 200.000.000│ 40jt  / 83%   │
│ Sarpras          │  96.000.000│  90.000.000│ ⚠️ 6jt / 6%   │
│ Operasional      │  72.000.000│  48.000.000│ 24jt  / 67%   │
│ Kegiatan         │  72.000.000│   7.000.000│ 65jt  / 10%   │
└──────────────────┴────────────┴────────────┴────────────────┘
⚠️ Sarpras hampir habis anggaran!
```

---

# DASHBOARD SEKRETARIS PESANTREN

## Layout Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard Sekretaris Pesantren                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Total SDM │ │Absensi   │ │ Honor    │ │Surat     │        │
│  │ 52 aktif │ │ Hari Ini │ │ Bulan Ini│ │ 3 Pending│        │
│  │          │ │ 96% Hadir│ │ Approved │ │          │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Total Honor│ │SDM Alpha │ │Pengumum. │ │Program   │        │
│  │ Rp 28jt  │ │ 1 Orang  │ │5 Terkirim│ │1 Upcoming│        │
└──────────────┴─────────────┴────────────┴──────────┘        │
```

## Halaman Data SDM Pesantren
```
┌──────────────────────────────────────────────────────────────┐
│ Data SDM Pesantren                                          │
├──────────────────────────────────────────────────────────────┤
│ [Ustadz (28)] [Musyrif (12)] [Pengurus (8)] [Staf (4)]     │
├──────────────────────────────────────────────────────────────┤
│ TAB: Ustadz                              [ + Tambah ]       │
│ 🔍 Cari...  [Bidang ▼]                                      │
├────┬──────────────────┬──────────┬──────────────┬───────────┤
│ #  │ Nama             │ Bidang   │ Halaqah      │ Status   │
├────┼──────────────────┼──────────┼──────────────┼───────────┤
│ 1  │ Ust. Mukhlis     │ Tahfidz  │ 2 halaqah    │ ● Aktif  │
│ 2  │ Ust. Amin Fauzi  │ Fiqih    │ 3 halaqah    │ ● Aktif  │
│ 3  │ Ust. Farid Hamid │ Nahwu    │ 2 halaqah    │ ● Aktif  │
└────┴──────────────────┴──────────┴──────────────┴───────────┘
```

## Halaman Absensi SDM
```
┌──────────────────────────────────────────────────────────────┐
│ Absensi SDM                              [Rekap] [Export]   │
│ Senin, 8 Maret 2026                                         │
├──────────────────────────────────────────────────────────────┤
│ [Default Semua Hadir]  Hadir: 50 | Izin: 1 | Alpha: 1      │
├────┬──────────────────┬───────────┬────────┬────────┬───────┤
│ #  │ Nama             │ Jabatan   │ Hadir  │ Izin   │ Alpha│
├────┼──────────────────┼───────────┼────────┼────────┼───────┤
│ 1  │ Ust. Mukhlis     │ Ustadz    │ ◉      │ ○      │ ○    │
│ 2  │ Ust. Amin Fauzi  │ Ustadz    │ ◉      │ ○      │ ○    │
│ 3  │ Musyrif Ali      │ Musyrif   │ ○      │ ◉      │ ○    │
└────┴──────────────────┴───────────┴────────┴────────┴───────┘
                                              [Simpan Absensi]
```

## Halaman Honor & Insentif
```
┌──────────────────────────────────────────────────────────────┐
│ Honor & Insentif                                            │
├──────────────────────────────────────────────────────────────┤
│ [Honor Mengajar] [Insentif Tahfidz] [Riwayat]              │
├──────────────────────────────────────────────────────────────┤
│ TAB: Honor Mengajar — Sya'ban 1446 H   [Generate Kalkulasi] │
│                                                              │
│ Status rekap absensi: ✅ Sudah dikunci                       │
├────┬──────────────────┬───────────┬───────────┬────────────┤
│ #  │ Nama Ustadz      │ Pertemuan │ Total Honor│ Aksi      │
├────┼──────────────────┼───────────┼───────────┼────────────┤
│ 1  │ Ust. Mukhlis     │ 24 ptm    │ Rp 2.400k │ [Review]  │
│ 2  │ Ust. Amin Fauzi  │ 36 ptm    │ Rp 3.600k │ [Review]  │
│ 3  │ Ust. Farid Hamid │ 28 ptm    │ Rp 2.800k │ [Review]  │
├────┴──────────────────┴───────────┴───────────┴────────────┤
│ Total: Rp 28.400.000                [Approve Semua]         │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Insentif Tahfidz
```
┌──────────────────────────────────────────────────────────────┐
│ Insentif Tahfidz — Sya'ban 1446 H                          │
├──────────────────────────────────────────────────────────────┤
│ Insentif dihitung dari capaian santri binaan                │
├────┬──────────────────┬───────────┬───────────┬────────────┤
│ #  │ Nama Ustadz      │ Santri    │ Capaian   │ Insentif  │
├────┼──────────────────┼───────────┼───────────┼────────────┤
│ 1  │ Ust. Mukhlis     │ 12 santri │ 85% target│ Rp 1.200k │
│ 2  │ Ust. Yahya       │ 10 santri │ 92% target│ Rp 1.380k │
└────┴──────────────────┴───────────┴───────────┴────────────┘
```

## Halaman Surat Menyurat Pesantren
```
┌──────────────────────────────────────────────────────────────┐
│ Surat Menyurat                                              │
├──────────────────────────────────────────────────────────────┤
│ [Surat Masuk] [Surat Keluar] [Surat Keterangan Santri]      │
├──────────────────────────────────────────────────────────────┤
│ TAB: Surat Keterangan Santri         [ + Generate Surat ]   │
│                                                              │
│ Pilih Jenis Surat:                                          │
│ ◉ Surat Keterangan Aktif                                    │
│ ○ Surat Keterangan Lulus                                    │
│ ○ Surat Keterangan Pindah                                   │
│ ○ Surat Rekomendasi                                         │
│                                                              │
│ Pilih Santri:                                               │
│ [🔍 Cari nama santri...          ▼]                         │
│                                                              │
│              [ Preview ] [ Generate PDF ]                   │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Struktur Organisasi Pesantren
```
┌──────────────────────────────────────────────────────────────┐
│ Struktur Organisasi                    [Edit] [Export PDF]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              ┌──────────────────────┐                        │
│              │     Pengasuh / Kyai  │                        │
│              │   KH. Ahmad Mustofa  │                        │
│              └──────────┬───────────┘                        │
│        ┌────────────────┴───────────────┐                    │
│  ┌─────┴─────┐                  ┌───────┴──────┐             │
│  │   Mudir   │                  │  Sekretaris  │             │
│  │ Ust. Hasan│                  │  Ust. Farid  │             │
│  └─────┬─────┘                  └───────┬──────┘             │
│        │                                │                    │
│  ┌─────┴────┐                   ┌───────┴──────┐             │
│  │Kepala    │                   │  Bendahara   │             │
│  │Pendidikan│                   │  Ust. Malik  │             │
│  └──────────┘                   └──────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Pengaturan Pesantren
```
┌──────────────────────────────────────────────────────────────┐
│ Pengaturan Pesantren                                        │
├──────────────────────────────────────────────────────────────┤
│ [Profil] [Tahun Ajaran] [Role & User] [Modul] [Notifikasi] │
├──────────────────────────────────────────────────────────────┤
│ TAB: Profil Pesantren                                       │
│                                                              │
│  ┌──────────┐  Nama Pesantren                               │
│  │  [Logo]  │  [Pondok Pesantren Al-Ittihad           ]    │
│  │  Upload  │                                               │
│  └──────────┘  NSM                                          │
│               [512320001001                          ]      │
│                                                              │
│               Nama Mudir / Pengasuh                         │
│               [KH. Ahmad Mustofa                     ]      │
│                                                              │
│               Tanda Tangan Digital                          │
│               [ 📎 Upload TTD Mudir... ]                   │
│                                                              │
│               Kalender Aktif                                │
│               Tahun Hijriah: 1446 H                         │
│                                                              │
│                             [Simpan Perubahan]              │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Role & User
```
┌──────────────────────────────────────────────────────────────┐
│ Role & User                         [ + Tambah User ]       │
├──────────────────────────────────────────────────────────────┤
│ [Semua User] [per Role]                                     │
├────┬───────────────────┬─────────────────┬──────┬───────────┤
│ #  │ Nama              │ Email           │ Role │ Status   │
├────┼───────────────────┼─────────────────┼──────┼───────────┤
│ 1  │ Ust. Farid Hamid  │ farid@...       │ Admin│ ● Aktif  │
│ 2  │ Ust. Mukhlis      │ mukhlis@...     │ Ustdz│ ● Aktif  │
│ 3  │ Musyrif Ali       │ ali@...         │ Musrf│ ● Aktif  │
│ 4  │ Bendahara Malik   │ malik@...       │ Bendh│ ● Aktif  │
└────┴───────────────────┴─────────────────┴──────┴───────────┘
```
