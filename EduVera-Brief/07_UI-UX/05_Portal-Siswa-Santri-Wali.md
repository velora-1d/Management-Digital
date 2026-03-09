# UI / UX — PORTAL SISWA, SANTRI & WALI
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# PORTAL SISWA ([tenant].eduvera.id/siswa)

## Design Notes
- Mobile-first, sederhana, ringan
- Bottom tab navigation di mobile
- Card-based layout
- Bahasa friendly untuk pelajar

## Layout Global Portal Siswa
```
┌──────────────────────────────┐
│  EduVera Siswa               │
│  Hai, Ahmad Fauzi! 👋        │
│  SMP Negeri 1 Bandung        │
├──────────────────────────────┤
│                              │
│  [Konten per halaman]        │
│                              │
├──────────────────────────────┤
│ 🏠    📅    📊    📄    🔔  │
│Home Jadwal Absen Rapor Notif │
└──────────────────────────────┘
```

## Halaman Dashboard Siswa
```
┌──────────────────────────────┐
│ Halo, Ahmad Fauzi! 👋        │
│ Kelas VII A | Semester Ganjil│
│ 📅 Senin, 8 Maret 2026       │
├──────────────────────────────┤
│  ┌──────────┐ ┌──────────┐   │
│  │ Jadwal   │ │ Absensi  │   │
│  │ Hari ini │ │ Bulan ini│   │
│  │ 8 mapel  │ │ 95%Hadir │   │
│  └──────────┘ └──────────┘   │
├──────────────────────────────┤
│ 📢 Pengumuman Terbaru        │
│ ─────────────────────────    │
│ • UTS 18-19 Maret 2026       │
│ • Libur 27 Maret 2026        │
│ [Lihat semua]                │
├──────────────────────────────┤
│ 📋 Rapor Terbaru             │
│ Semester Ganjil 2025/2026    │
│ ● Published ✅               │
│ [Download PDF]               │
└──────────────────────────────┘
```

## Halaman Jadwal Siswa
```
┌──────────────────────────────┐
│ Jadwal Pelajaran             │
│ Kelas VII A                  │
├──────────────────────────────┤
│ [Sen] [Sel] [Rab] [Kam] [Jum]│
│  ◉                           │
├──────────────────────────────┤
│ SENIN                        │
│ ──────────────────────────── │
│ 07.00 - 08.00                │
│ 📚 Matematika                │
│ Bapak Ahmad Fauzi            │
│                              │
│ 08.00 - 09.00                │
│ 📚 Bahasa Indonesia          │
│ Ibu Sari Dewi                │
│                              │
│ 09.00 - 10.00                │
│ 📚 IPA                       │
│ Bapak Budi Santoso           │
└──────────────────────────────┘
```

## Halaman Absensi Siswa
```
┌──────────────────────────────┐
│ Riwayat Absensi              │
│ Maret 2026                   │
├──────────────────────────────┤
│ Hadir: 18  Sakit: 1  Alpha: 0│
│ ████████████████████░  95%   │
├──────────────────────────────┤
│ [Mar 2026 ▼]                 │
│                              │
│ 8 Mar  ✅ Hadir              │
│ 7 Mar  ✅ Hadir              │
│ 6 Mar  ✅ Hadir              │
│ 5 Mar  🏥 Sakit              │
│ 4 Mar  ✅ Hadir              │
│ ...                          │
└──────────────────────────────┘
```

## Halaman Rapor Siswa
```
┌──────────────────────────────┐
│ Rapor Saya                   │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ 📋 Semester Ganjil     │  │
│  │    2025/2026            │  │
│  │    ● Published          │  │
│  │    Kelas VII A          │  │
│  │                         │  │
│  │  [👁 Preview] [⬇ Unduh]│  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📋 Semester Genap      │  │
│  │    2024/2025            │  │
│  │    ● Arsip              │  │
│  │                         │  │
│  │  [👁 Preview] [⬇ Unduh]│  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

# PORTAL SANTRI ([tenant].eduvera.id/santri)

## Design Notes
- Simple & clean, cocok dibuka di HP santri
- Tampilkan progress hafalan secara visual
- Perizinan mudah diajukan

## Halaman Dashboard Santri
```
┌──────────────────────────────┐
│ Assalamu'alaikum,            │
│ Ali Hasan 👋                 │
│ Wustha | PP Al-Ittihad       │
│ 1 Sya'ban 1446 H             │
├──────────────────────────────┤
│  ┌──────────┐ ┌──────────┐   │
│  │ Progress │ │ Absensi  │   │
│  │ Tahfidz  │ │ Asrama   │   │
│  │18.5 Juz  │ │ 96%Hadir │   │
│  └──────────┘ └──────────┘   │
├──────────────────────────────┤
│ 📖 Progress Hafalan          │
│ Target: 20 Juz               │
│ ████████████████████░  92%  │
│ 18.5 / 20 Juz               │
├──────────────────────────────┤
│ 📢 Pengumuman Terbaru        │
│ • Dauroh Fikih 15 Maret      │
│ • Haflah Akhirusanah 1 April │
│ [Lihat semua]                │
└──────────────────────────────┘
```

## Halaman Progress Hafalan Santri
```
┌──────────────────────────────┐
│ Progress Hafalan Saya        │
│ Ali Hasan | Wustha           │
├──────────────────────────────┤
│ Total Hafalan: 18.5 Juz      │
│ Target Semester: 20 Juz      │
│ ████████████████████░  92%   │
├──────────────────────────────┤
│ Setoran Terakhir:            │
│ Al-Hasyr 1-24 (Baru)        │
│ Senin, 8 Maret 2026          │
├──────────────────────────────┤
│ Riwayat Setoran:             │
│ ──────────────────────────── │
│ 8/3 Al-Hasyr 1-24   ✅ Lancar│
│ 7/3 Al-Mujadilah 1-22✅ Lancar│
│ 6/3 Al-Hadid 1-29  ⚠️ Kurang │
│ 5/3 Murajaah Juz 27 ✅ Lancar│
└──────────────────────────────┘
```

## Halaman Perizinan Santri
```
┌──────────────────────────────┐
│ Perizinan                    │
│            [ + Ajukan Izin ] │
├──────────────────────────────┤
│ Status Izin Aktif: ⬜ Tidak ada│
├──────────────────────────────┤
│ Riwayat Izin:                │
│ ──────────────────────────── │
│ ✅ 1-2 Mar  Pulang           │
│    Disetujui Musyrif Ali     │
│                              │
│ ❌ 15 Feb   Keluar           │
│    Ditolak: Tanpa keterangan │
└──────────────────────────────┘
```

## Form Ajukan Izin Santri
```
┌──────────────────────────────┐
│ Ajukan Izin                  │
├──────────────────────────────┤
│ Jenis Izin *                 │
│ ○ Pulang    ○ Keluar         │
│ ○ Sakit     ○ Lainnya       │
│                              │
│ Tanggal Mulai *              │
│ [09/03/2026              ]  │
│                              │
│ Tanggal Kembali *            │
│ [10/03/2026              ]  │
│                              │
│ Alasan *                     │
│ ┌──────────────────────────┐ │
│ │ Ada acara keluarga...    │ │
│ └──────────────────────────┘ │
│                              │
│       [ Kirim Permohonan ]   │
└──────────────────────────────┘
```

## Halaman Rapor Santri
```
┌──────────────────────────────┐
│ Rapor Saya                   │
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │ 📋 Semester Ganjil     │  │
│  │    1446 H               │  │
│  │    ● Published          │  │
│  │    Marhalah Wustha      │  │
│  │                         │  │
│  │  [👁 Preview] [⬇ Unduh]│  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📋 Semester Genap      │  │
│  │    1445 H               │  │
│  │    ● Arsip              │  │
│  │  [👁 Preview] [⬇ Unduh]│  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

# PORTAL WALI ([tenant].eduvera.id/wali)

## Design Notes
- Bisa kelola beberapa anak sekaligus
- Informasi tagihan SPP jelas dan mudah dipahami
- Perizinan santri bisa diajukan langsung

## Halaman Dashboard Wali
```
┌──────────────────────────────┐
│ Halo, Bpk. Hasan Ibrahim 👋  │
│ Portal Wali Murid             │
├──────────────────────────────┤
│ Anak Saya:                   │
│                              │
│  ┌────────────────────────┐  │
│  │ 👤 Ali Hasan            │  │
│  │    Wustha | PP Al-Ittihad│ │
│  │    SPP: ✅ Lunas        │  │
│  │    [Lihat Detail]       │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 👤 Hasan Ali            │  │
│  │    Kelas VII A | SMP N 1│  │
│  │    SPP: ⚠️ Belum Bayar  │  │
│  │    [Lihat Detail]       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## Halaman Detail Anak — Wali
```
┌──────────────────────────────┐
│ ← Kembali  Ali Hasan         │
│ Wustha | PP Al-Ittihad       │
├──────────────────────────────┤
│ [Info] [SPP] [Rapor] [Izin]  │
├──────────────────────────────┤
│ TAB: Info                    │
│                              │
│ Absensi Bulan Ini: 96% Hadir │
│ ██████████████████████░ 96% │
│                              │
│ Progress Tahfidz:            │
│ 18.5 / 20 Juz — 92% ✅       │
│ ████████████████████░        │
│                              │
│ Pelanggaran Bulan Ini: 0     │
│                              │
│ Kondisi: ✅ Sehat             │
└──────────────────────────────┘
```

## Halaman SPP — Wali
```
┌──────────────────────────────┐
│ ← SPP Ali Hasan              │
├──────────────────────────────┤
│ Tagihan Aktif:               │
│ ──────────────────────────── │
│ Sya'ban 1446 H               │
│ Rp 400.000                   │
│ ✅ LUNAS — 5 Mar 2026        │
├──────────────────────────────┤
│ Riwayat Pembayaran:          │
│ ──────────────────────────── │
│ Rajab  1446 ✅ Rp 400.000   │
│ Jumadil Akhir ✅ Rp 400.000 │
│ Jumadil Awal  ✅ Rp 400.000 │
│ Rabi'ul Akhir ⚠️ Sebagian   │
│ [Lihat semua]                │
└──────────────────────────────┘
```

## Halaman Rapor — Wali
```
┌──────────────────────────────┐
│ ← Rapor Ali Hasan            │
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │ 📋 Semester Ganjil     │  │
│  │    1446 H               │  │
│  │    ● Published          │  │
│  │    Wustha               │  │
│  │                         │  │
│  │  [👁 Buka] [⬇ Unduh]   │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## Halaman Perizinan — Wali Santri
```
┌──────────────────────────────┐
│ Perizinan Ali Hasan          │
│              [ + Ajukan Izin]│
├──────────────────────────────┤
│ Izin Aktif: ⬜ Tidak ada     │
├──────────────────────────────┤
│ Riwayat:                     │
│ ──────────────────────────── │
│ 1-2 Mar  ✅ Pulang (Setujui) │
│ 15 Feb   ❌ Keluar (Tolak)   │
│ 10 Feb   ✅ Sakit (Setujui)  │
└──────────────────────────────┘
```

## Form Ajukan Izin — Wali
```
┌──────────────────────────────┐
│ Ajukan Izin                  │
│ untuk: Ali Hasan             │
├──────────────────────────────┤
│ Jenis Izin *                 │
│ ○ Pulang    ○ Keluar         │
│ ○ Sakit     ○ Lainnya       │
│                              │
│ Tanggal Mulai *              │
│ [09/03/2026              ]  │
│                              │
│ Tanggal Kembali *            │
│ [10/03/2026              ]  │
│                              │
│ Alasan *                     │
│ ┌──────────────────────────┐ │
│ │ Ada acara keluarga...    │ │
│ └──────────────────────────┘ │
│                              │
│       [ Kirim Permohonan ]   │
└──────────────────────────────┘
```

## Halaman Pengumuman — Wali
```
┌──────────────────────────────┐
│ Pengumuman                   │
├──────────────────────────────┤
│ 📢 Dauroh Fikih Ramadhan     │
│    Pondok Pesantren Al-Ittihad│
│    15 Maret 2026             │
│    Untuk: Seluruh Santri     │
│    [Baca selengkapnya]       │
├──────────────────────────────┤
│ 📢 Libur Akhir Semester      │
│    20 Mar - 5 Apr 2026       │
│    Untuk: Seluruh Wali       │
│    [Baca selengkapnya]       │
└──────────────────────────────┘
```
