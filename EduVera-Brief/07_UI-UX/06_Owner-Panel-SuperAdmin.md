# UI / UX — OWNER PANEL & SUPER ADMIN
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# OWNER PANEL (app.eduvera.id)

## Halaman Dashboard Owner
```
┌──────────────────────────────────────────────────────────────┐
│ TOPBAR: EduVera Admin | Owner Panel | 🔔 | Avatar            │
├──────────────┬───────────────────────────────────────────────┤
│ SIDEBAR      │  Dashboard Owner                             │
│ ─────────    │  Platform Overview                           │
│ 📊 Dashboard │                                               │
│ 🏢 Tenant    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ 💳 Billing   │  │Total │ │Aktif │ │Trial │ │Expird│        │
│ 📱 WA Gateway│  │Tenant│ │      │ │      │ │      │        │
│ 🔍 Audit Log │  │ 142  │ │ 128  │ │  10  │ │   4  │        │
│ ⚙️ Settings  │  └──────┘ └──────┘ └──────┘ └──────┘        │
└──────────────┴───────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                        │
│  │Siswa/│ │Bayar │ │WA Dev│ │Error │                        │
│  │Santri│ │Pending│ │aktif │ │Rate  │                        │
│  │48.500│ │  5   │ │ 8/10 │ │ 0.2% │                        │
│  └──────┘ └──────┘ └──────┘ └──────┘                        │
```

## Halaman Daftar Tenant
```
┌──────────────────────────────────────────────────────────────┐
│ Manajemen Tenant                          [ + Tenant Baru ] │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...  [Status ▼] [Jenis ▼] [Paket ▼]                │
├──────────────────────────────────────────────────────────────┤
│ Ringkasan: Total 142 | Aktif 128 | Trial 10 | Expired 4     │
├────┬──────────────────────┬──────────┬───────────┬──────────┤
│ #  │ Nama Institusi       │ Jenis    │ Status    │ Aksi    │
├────┼──────────────────────┼──────────┼───────────┼──────────┤
│ 1  │ SMP Negeri 1 Bandung │ Sekolah  │ ● Aktif   │ [Detail]│
│ 2  │ PP Al-Ittihad        │ Pesantren│ ● Aktif   │ [Detail]│
│ 3  │ MA Unggulan Nurul Ilm│ Hybrid   │ 🔵 Trial  │ [Detail]│
│ 4  │ SMA Global Mandiri   │ Sekolah  │ 🔴 Expired│ [Detail]│
└────┴──────────────────────┴──────────┴───────────┴──────────┘
```

## Halaman Detail Tenant
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   SMP Negeri 1 Bandung                            │
├──────────────────────────────────────────────────────────────┤
│ [Info] [Modul] [Billing] [Log Aktivitas]                    │
├──────────────────────────────────────────────────────────────┤
│ TAB: Info                                                   │
│                                                              │
│ Subdomain: smpn1bandung.eduvera.id                          │
│ Jenis: Sekolah | Status: ● Aktif                            │
│ Paket: Pro | Mulai: 1 Jan 2026                              │
│ Kadaluarsa: 31 Des 2026                                     │
│                                                              │
│ PIC: Drs. Suparman | suparman@smpn1.sch.id                  │
│                                                              │
│ Statistik:                                                   │
│ Siswa: 450 | Guru: 32 | Staf: 18                            │
│                                                              │
│ [Suspend Tenant]  [Edit Paket]  [Extend Trial]              │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Modul per Tenant
```
┌──────────────────────────────────────────────────────────────┐
│ ← SMP Negeri 1 Bandung — Konfigurasi Modul                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ MODUL SEKOLAH:                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ ✅ Akademik & E-Rapor            [ON  ●──────]       │    │
│ │ ✅ Keuangan & SPP                [ON  ●──────]       │    │
│ │ ✅ SDM & Penggajian              [ON  ●──────]       │    │
│ │ ✅ Inventaris & Sarpras          [ON  ●──────]       │    │
│ │ ✅ Surat Menyurat                [ON  ●──────]       │    │
│ │ ✅ Ekskul & BK                   [ON  ●──────]       │    │
│ │ ☐ Modul Pesantren               [OFF ──────○]       │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│                             [Simpan Konfigurasi]            │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Billing & Konfirmasi
```
┌──────────────────────────────────────────────────────────────┐
│ Billing & Pembayaran                                        │
├──────────────────────────────────────────────────────────────┤
│ [Pending (5)] [Terkonfirmasi] [Semua]                       │
├──────────────────────────────────────────────────────────────┤
│ TAB: Pending                                                │
├────────────────────────┬──────────┬────────────┬────────────┤
│ Tenant                 │ Nominal  │ Tgl Klaim  │ Aksi      │
├────────────────────────┼──────────┼────────────┼────────────┤
│ PP Al-Ittihad          │ Rp 499k  │ 7 Mar 2026 │ [✅] [❌] │
│ MA Unggulan Nurul Ilm  │ Rp 299k  │ 6 Mar 2026 │ [✅] [❌] │
│ SMA Global Mandiri     │ Rp 499k  │ 5 Mar 2026 │ [✅] [❌] │
└────────────────────────┴──────────┴────────────┴────────────┘
```

## Halaman WA Gateway
```
┌──────────────────────────────────────────────────────────────┐
│ WA Gateway                             [ + Tambah Device ]  │
├──────────────────────────────────────────────────────────────┤
│ Device Aktif: 8/10                                          │
├───────┬──────────────┬──────────┬────────────┬─────────────┤
│ #     │ Nomor WA     │ Status   │ Tenant     │ Aksi       │
├───────┼──────────────┼──────────┼────────────┼─────────────┤
│ 1     │ +6281234...  │ 🟢 Online│ General    │ [Detail]   │
│ 2     │ +6282345...  │ 🟢 Online│ General    │ [Detail]   │
│ 3     │ +6283456...  │ 🔴 Offline│ General   │ [Reconnect]│
└───────┴──────────────┴──────────┴────────────┴─────────────┘
```

## Halaman Audit Log
```
┌──────────────────────────────────────────────────────────────┐
│ Audit & Activity Log                                        │
├──────────────────────────────────────────────────────────────┤
│ [Activity Log] [Security Log] [Error Log]                   │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...  [Tenant ▼] [Aksi ▼] [Periode ▼]  [Export]     │
├──────────┬─────────────────┬──────────────┬─────────────────┤
│ Waktu    │ User / Tenant   │ Aksi         │ Detail         │
├──────────┼─────────────────┼──────────────┼─────────────────┤
│ 08:32:01 │ Admin / SMPN1   │ PUBLISH_RAPOR│ Kelas VII A    │
│ 08:28:15 │ Bendahara / PPAl│ KONFIRM_SPP  │ Santri #PS-001 │
│ 08:15:44 │ Owner           │ AKTIFKAN_TENA│ MA Unggulan    │
└──────────┴─────────────────┴──────────────┴─────────────────┘
```

---

# SUPER ADMIN — YAYASAN

## Halaman Dashboard Yayasan
```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard Yayasan Al-Ittihad                                │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Tenant   │ │Siswa/Santr│ │Guru/Ustdz│ │Rapor     │        │
│  │ 5 aktif  │ │  1.850   │ │   125    │ │ 3/5 done │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│ Tenant Saya:                                                │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────┐  ┌────────────────────┐              │
│ │ 🏫 SMP Al-Ittihad  │  │ 🕌 PP Al-Ittihad   │              │
│ │ 450 Siswa ● Aktif  │  │ 320 Santri ● Aktif │              │
│ │ [Akses Dashboard]  │  │ [Akses Dashboard]  │              │
│ └────────────────────┘  └────────────────────┘              │
│                                                              │
│ ┌────────────────────┐  ┌────────────────────┐              │
│ │ 🏫 SMA Al-Ittihad  │  │ 🏫 MA Al-Ittihad   │              │
│ │ 380 Siswa ● Aktif  │  │ 310 Siswa ● Aktif  │              │
│ │ [Akses Dashboard]  │  │ [Akses Dashboard]  │              │
│ └────────────────────┘  └────────────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Laporan Lintas Tenant
```
┌──────────────────────────────────────────────────────────────┐
│ Laporan Yayasan Al-Ittihad                                  │
├──────────────────────────────────────────────────────────────┤
│ [Akademik] [Keuangan] [SDM] [Perbandingan Tenant]           │
├──────────────────────────────────────────────────────────────┤
│ TAB: Perbandingan Tenant              [Export PDF] [Excel]  │
│ Periode: [Jan-Mar 2026 ▼]                                   │
├──────────────────┬──────────┬──────────┬──────────┬─────────┤
│ Indikator        │ SMP      │ SMA      │ MA       │ PP     │
├──────────────────┼──────────┼──────────┼──────────┼─────────┤
│ Total Siswa      │ 450      │ 380      │ 310      │ 320    │
│ Kehadiran (%)    │ 95%      │ 92%      │ 94%      │ 96%    │
│ SPP Lunas (%)    │ 78%      │ 82%      │ 80%      │ 85%    │
│ Rapor Published  │ ✅ Done  │ ✅ Done  │ ⏳ Proses│ ✅ Done│
│ Pemasukan        │ 96jt     │ 120jt    │ 95jt     │ 78jt   │
└──────────────────┴──────────┴──────────┴──────────┴─────────┘
```
