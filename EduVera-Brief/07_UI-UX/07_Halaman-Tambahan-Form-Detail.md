# UI / UX — HALAMAN TAMBAHAN (FORM & SUB-MENU DETAIL)
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# SEKOLAH — HALAMAN YANG BELUM ADA

---

## Form Mutasi Siswa — Pindah Masuk
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Mutasi Siswa — Pindah Masuk                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nama Lengkap *                                             │
│  [                                                       ]  │
│                                                              │
│  NISN                                                        │
│  [                                                       ]  │
│                                                              │
│  Sekolah Asal *                                             │
│  [                                                       ]  │
│                                                              │
│  Tanggal Masuk *                                            │
│  [08/03/2026                                          ]     │
│                                                              │
│  Kelas Tujuan *                                             │
│  [Pilih Kelas...                                     ▼]     │
│                                                              │
│  Alasan Pindah *                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Upload Surat Keterangan Pindah *                           │
│  [ 📎 Pilih file PDF/JPG... ]                              │
│                                                              │
│  [ Batal ]                            [ Simpan & Proses ]  │
└──────────────────────────────────────────────────────────────┘
```

## Form Mutasi Siswa — Pindah Keluar
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Mutasi Siswa — Pindah Keluar                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Pilih Siswa *                                              │
│  [🔍 Cari nama/NIS siswa...                          ▼]     │
│                                                              │
│  Tanggal Keluar *                                           │
│  [08/03/2026                                          ]     │
│                                                              │
│  Sekolah Tujuan                                             │
│  [                                                       ]  │
│                                                              │
│  Alasan Pindah *                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Upload Surat Permohonan Pindah (opsional)                  │
│  [ 📎 Pilih file... ]                                       │
│                                                              │
│  ⚠️ Siswa akan dinonaktifkan. Data historis tetap tersimpan  │
│                                                              │
│  [ Batal ]                            [ Konfirmasi Keluar ] │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Proses Kenaikan Kelas (Detail)
```
┌──────────────────────────────────────────────────────────────┐
│ Proses Kenaikan Kelas — 2025/2026               [Konfirmasi] │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari siswa...  [Kelas ▼]  [Status ▼]                    │
│                                                              │
│ Summary:  Naik: 420 | Tinggal: 8 | Lulus: 22 | Total: 450  │
├────────────────┬──────────┬──────────────┬──────────────────┤
│ Nama Siswa     │ Kelas    │ Status       │ Aksi            │
├────────────────┼──────────┼──────────────┼──────────────────┤
│ Ahmad Fauzi    │ VII A    │ ✅ Naik      │ [Override]      │
│ Budi Santoso   │ VII A    │ ⚠️ Tinggal  │ [Edit Alasan]   │
│ Citra Dewi     │ IX A     │ 🎓 Lulus    │ [Lihat]         │
│ Diana Putri    │ VII A    │ ✅ Naik      │ [Override]      │
└────────────────┴──────────┴──────────────┴──────────────────┘

[Override → Tinggal Kelas Modal:]
┌────────────────────────────────────┐
│  Set Tinggal Kelas                 │
│  Siswa: Ahmad Fauzi — Kelas VII A  │
│  ──────────────────────────────    │
│  Alasan Tinggal Kelas *            │
│  ┌────────────────────────────┐    │
│  │                            │    │
│  └────────────────────────────┘    │
│  [ Batal ]       [ Konfirmasi ]    │
└────────────────────────────────────┘
```

## Halaman Setup Kurikulum (Detail)
```
┌──────────────────────────────────────────────────────────────┐
│ Setup Kurikulum 2025/2026              [Simpan Konfigurasi] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Jenjang: SMP / MTs                                         │
│  Kurikulum Aktif:                                           │
│  ◉ Kurikulum Merdeka   ○ K-13   ○ Kemenag   ○ Custom       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Komponen Penilaian per Mapel:                               │
│                                                              │
│  [Matematika ▼]                                             │
│                                                              │
│  ┌──────────────────┬──────────┬──────────────────────────┐  │
│  │ Komponen         │ Bobot %  │ Keterangan               │  │
│  ├──────────────────┼──────────┼──────────────────────────┤  │
│  │ Pengetahuan      │ [60    ] │                          │  │
│  │ Keterampilan     │ [40    ] │                          │  │
│  ├──────────────────┼──────────┼──────────────────────────┤  │
│  │ Total            │ 100%    │ ✅ Valid                  │  │
│  └──────────────────┴──────────┴──────────────────────────┘  │
│                                                              │
│  [+ Tambah Komponen]                                        │
└──────────────────────────────────────────────────────────────┘
```

## Form Tambah Guru / Staf
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Tambah Data Guru                                │
├──────────────────────────────────────────────────────────────┤
│ [Data Pribadi] [Kepegawaian] [Kontak & Akun]                │
├──────────────────────────────────────────────────────────────┤
│ TAB: Data Pribadi                                           │
│                                                              │
│  Nama Lengkap *                                             │
│  [                                                       ]  │
│                                                              │
│  NIK *                                                       │
│  [                                                       ]  │
│                                                              │
│  Tempat, Tanggal Lahir *                                    │
│  [              ] [08/03/1985                          ]    │
│                                                              │
│  Jenis Kelamin *                                            │
│  ◉ Laki-laki   ○ Perempuan                                  │
│                                                              │
│  Upload Foto                                                │
│  [ 📎 Pilih foto... ]                                       │
│                                                              │
│                    [ Berikutnya → ]                         │
└──────────────────────────────────────────────────────────────┘
```

---

# PESANTREN — HALAMAN YANG BELUM ADA

---

## Form Mutasi Santri — Masuk
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Mutasi Santri — Pindah Masuk                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nama Lengkap *                                             │
│  [                                                       ]  │
│                                                              │
│  Pesantren Asal *                                           │
│  [                                                       ]  │
│                                                              │
│  Tanggal Masuk *                                            │
│  [08/03/2026                                          ]     │
│                                                              │
│  Marhalah yang Dituju *                                     │
│  [Pilih Marhalah...                                  ▼]     │
│                                                              │
│  Riwayat Hafalan (opsional)                                 │
│  [Misal: sudah hafal 10 Juz                          ]     │
│                                                              │
│  Alasan Pindah *                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Upload Surat Keterangan dari Pesantren Asal *              │
│  [ 📎 Pilih file... ]                                       │
│                                                              │
│  [ Batal ]                            [ Simpan & Proses ]  │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Proses Kenaikan Marhalah
```
┌──────────────────────────────────────────────────────────────┐
│ Proses Kenaikan Marhalah — 1446 H          [Konfirmasi]     │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari santri...  [Marhalah ▼]  [Status ▼]               │
│                                                              │
│ Summary: Naik: 280 | Tetap: 25 | Lulus: 15 | Total: 320    │
├────────────────┬──────────────┬──────────────┬──────────────┤
│ Nama Santri    │ Marhalah     │ Status       │ Aksi        │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Ali Hasan      │ Wustha       │ ✅ Naik Ulya │ [Override]  │
│ Basyir Ahmad   │ Ula          │ ⚠️ Tetap Ula │ [Edit]      │
│ Husain Umar    │ Ulya         │ 🎓 Lulus     │ [Lihat]     │
└────────────────┴──────────────┴──────────────┴──────────────┘
```

## Form Input Pemeriksaan Kesehatan
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Catat Pemeriksaan                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Pilih Santri *                                             │
│  [🔍 Cari nama santri...                             ▼]     │
│                                                              │
│  Tanggal Pemeriksaan *                                      │
│  [08/03/2026                                          ]     │
│                                                              │
│  Keluhan *                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Demam sejak kemarin sore...                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Diagnosis *                                                │
│  [                                                       ]  │
│                                                              │
│  Tindakan *                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Istirahat + paracetamol 3x1...                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Status *                                                   │
│  ◉ Aktif (sedang sakit)   ○ Sembuh   ○ Perlu Dirujuk       │
│                                                              │
│  [ Batal ]                                    [ Simpan ]   │
└──────────────────────────────────────────────────────────────┘
```

## Form Tambah Stok Obat
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Tambah / Update Stok Obat                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nama Obat *                                                │
│  [Paracetamol 500mg                                   ]    │
│                                                              │
│  Satuan *                                                   │
│  ○ Strip  ○ Tablet  ◉ Sachet  ○ Botol  ○ Lainnya           │
│                                                              │
│  Jumlah Masuk *                                             │
│  [50                                                  ]    │
│                                                              │
│  Stok Minimum (Warning) *                                   │
│  [10                                                  ]    │
│                                                              │
│  Keterangan                                                 │
│  [                                                       ]  │
│                                                              │
│  [ Batal ]                                    [ Simpan ]   │
└──────────────────────────────────────────────────────────────┘
```

## Form Buat Program Kegiatan
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Buat Program Kegiatan                           │
├──────────────────────────────────────────────────────────────┤
│ [Detail] [Panitia] [Peserta] [Agenda]                       │
├──────────────────────────────────────────────────────────────┤
│ TAB: Detail                                                 │
│                                                              │
│  Nama Program *                                             │
│  [Dauroh Fikih Ramadhan 1446 H                        ]    │
│                                                              │
│  Jenis *                                                    │
│  ◉ Dauroh  ○ Haflah  ○ Khataman  ○ Wisata  ○ Lainnya       │
│                                                              │
│  Tanggal Mulai *      Tanggal Selesai *                     │
│  [15/03/2026    ]     [17/03/2026                     ]    │
│                                                              │
│  Lokasi *                                                   │
│  [Aula Utama Pesantren                                ]    │
│                                                              │
│  Deskripsi                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Program kajian fikih intensif selama bulan...        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                       [ Simpan & Lanjut → Panitia ]        │
└──────────────────────────────────────────────────────────────┘
```

## Form Assign Panitia Program
```
┌──────────────────────────────────────────────────────────────┐
│ Panitia — Dauroh Fikih Ramadhan              [Lanjut →]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [+ Tambah Panitia]                                         │
│                                                              │
│  ┌────────────────────────┬──────────────────┬─────────┐    │
│  │ Nama SDM               │ Jabatan Panitia  │ Hapus  │    │
│  ├────────────────────────┼──────────────────┼─────────┤    │
│  │ Ust. Farid Hamid       │ [Ketua    ▼]     │  [×]   │    │
│  │ Ust. Amin Fauzi        │ [Sekretaris ▼]   │  [×]   │    │
│  │ Musyrif Ali            │ [Anggota   ▼]    │  [×]   │    │
│  └────────────────────────┴──────────────────┴─────────┘    │
│                                                              │
│  Tambah SDM:                                                │
│  [🔍 Cari nama SDM...                                ▼]     │
│  [Jabatan...                                         ▼]     │
│  [ + Tambah ]                                               │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Detail Rekam Medis Santri
```
┌──────────────────────────────────────────────────────────────┐
│ ← Kembali   Rekam Medis: Ali Hasan                          │
├──────────────────────────────────────────────────────────────┤
│  Riwayat Penyakit Bawaan: Alergi debu                       │
│  Golongan Darah: A                                          │
├──────────────────────────────────────────────────────────────┤
│ Riwayat Pemeriksaan:                  [+ Catat Pemeriksaan] │
├──────────┬──────────────┬─────────────────┬─────────────────┤
│ Tgl      │ Keluhan      │ Tindakan        │ Status         │
├──────────┼──────────────┼─────────────────┼─────────────────┤
│ 8/3/26   │ Demam        │ Istirahat + obat│ ● Aktif        │
│ 1/2/26   │ Batuk pilek  │ Obat + istirahat│ ✅ Sembuh      │
│ 15/1/26  │ Sakit kepala │ Istirahat       │ ✅ Sembuh      │
└──────────┴──────────────┴─────────────────┴─────────────────┘
```

## Halaman Agenda Program Kegiatan
```
┌──────────────────────────────────────────────────────────────┐
│ Agenda — Dauroh Fikih Ramadhan 1446 H    [+ Tambah Agenda] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  HARI 1 — Sabtu, 15 Maret 2026                             │
│  ─────────────────────────────────────────────────────────  │
│  08.00 – 09.30  Pembukaan & Tilawah Quran                   │
│                 PJ: Ust. Farid Hamid                        │
│  09.30 – 12.00  Kajian Fikih Thaharah                       │
│                 PJ: Ust. Amin Fauzi                         │
│  12.00 – 13.00  Ishoma                                      │
│  13.00 – 15.00  Kajian Fikih Shalat                         │
│                 PJ: Ust. Mukhlis                            │
│                                                              │
│  HARI 2 — Ahad, 16 Maret 2026                              │
│  ─────────────────────────────────────────────────────────  │
│  08.00 – 12.00  Kajian Lanjutan                             │
│  13.00 – 15.30  Diskusi & Tanya Jawab                       │
│  16.00 – 17.00  Penutupan                                   │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Struktur Rapor Pesantren (Setup)
```
┌──────────────────────────────────────────────────────────────┐
│ Struktur Rapor Pesantren             [Simpan Konfigurasi]   │
│ Tahun: 1446 H | Semester: Ganjil                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Komponen yang Aktif di Rapor:                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ✅ Tahfidz Al-Quran           [ON  ●──────]          │   │
│  │ ✅ Diniyah & Kitab             [ON  ●──────]          │   │
│  │ ✅ Akhlak & Kepesantrenan      [ON  ●──────]          │   │
│  │ ✅ Absensi Asrama              [ON  ●──────]          │   │
│  │ ☐  Kesehatan                   [OFF ──────○]          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Skema Nilai:                                               │
│  ◉ Angka (0-100) + Predikat otomatis                        │
│  ○ Predikat langsung (Mumtaz/Jayyid/Maqbul)                 │
│  ○ Narasi saja                                              │
│                                                              │
│  Predikat Mapping:                                          │
│  Mumtaz     : [90] – 100                                    │
│  Jayyid Jdn : [80] – 89                                     │
│  Jayyid     : [70] – 79                                     │
│  Maqbul     : [60] – 69                                     │
│  Dun        :   0  – 59                                     │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Konfigurasi Notifikasi (Sekolah & Pesantren)
```
┌──────────────────────────────────────────────────────────────┐
│ Pengaturan Notifikasi                                       │
├──────────────────────────────────────────────────────────────┤
│ [WA Gateway] [Email] [Template Pesan]                       │
├──────────────────────────────────────────────────────────────┤
│ TAB: WA Gateway                                             │
│                                                              │
│  Provider:                                                   │
│  ◉ Fonnte   ○ WaBlas   ○ Lainnya                            │
│                                                              │
│  API Key *                                                  │
│  [••••••••••••••••••••••••••••••••    ] [👁 Tampilkan]      │
│                                                              │
│  Nomor WA Pengirim *                                        │
│  [+6281234567890                                      ]    │
│                                                              │
│  Status: 🟢 Terhubung                                       │
│                                                              │
│  [ Test Kirim WA ]                    [ Simpan Config ]     │
├──────────────────────────────────────────────────────────────┤
│ TAB: Template Pesan                                         │
│                                                              │
│  [SPP Terbit ▼]                                             │
│                                                              │
│  Template WA:                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Yth. {nama_wali},                                    │   │
│  │ Tagihan SPP {nama_siswa} bulan {bulan}               │   │
│  │ sebesar Rp {nominal} telah diterbitkan.              │   │
│  │ Harap segera melakukan pembayaran.                   │   │
│  │ - {nama_sekolah}                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Variabel tersedia: {nama_wali} {nama_siswa} {bulan}        │
│  {nominal} {nama_sekolah} {subdomain}                       │
└──────────────────────────────────────────────────────────────┘
```

## Halaman Riwayat Notifikasi
```
┌──────────────────────────────────────────────────────────────┐
│ Riwayat Notifikasi                                          │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari...  [Channel ▼] [Status ▼] [Periode ▼]  [Export]  │
├──────────┬────────────┬───────────────┬──────────┬──────────┤
│ Waktu    │ Penerima   │ Event         │ Channel  │ Status  │
├──────────┼────────────┼───────────────┼──────────┼──────────┤
│ 08:30    │ Bpk. Hasan │ SPP Terbit    │ WA       │ ✅ Sent │
│ 08:30    │ Ibu Sari   │ SPP Terbit    │ WA       │ ✅ Sent │
│ 08:29    │ Bpk. Ahmad │ SPP Terbit    │ WA       │ ❌ Gagal│
│ 07:00    │ Guru VII A │ Reminder UTS  │ WA+Email │ ✅ Sent │
└──────────┴────────────┴───────────────┴──────────┴──────────┘
```

## Halaman Verifikasi QR Rapor (Publik)
```
┌──────────────────────────────────────────────────────────────┐
│  🏫 EduVera — Verifikasi Dokumen                            │
│  eduvera.id/verify/[kode]                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ DOKUMEN VALID                                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📋 RAPOR PESERTA DIDIK                              │   │
│  │                                                      │   │
│  │  Nama      : Ahmad Fauzi                            │   │
│  │  NIS/NISN  : 001234 / 0012345678                    │   │
│  │  Kelas     : VII A                                  │   │
│  │  Semester  : Ganjil 2025/2026                       │   │
│  │  Sekolah   : SMP Negeri 1 Bandung                   │   │
│  │                                                      │   │
│  │  Diterbitkan: 8 Maret 2026                          │   │
│  │  Kode Verifikasi: EDVR-2026-XXXXX                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Dokumen ini resmi diterbitkan oleh EduVera                 │
│  dan dapat dipertanggungjawabkan keabsahannya.              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
