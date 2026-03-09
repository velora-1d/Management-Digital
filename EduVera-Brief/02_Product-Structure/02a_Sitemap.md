# SITEMAP
## EduVera — Platform Manajemen Pendidikan Terpadu

---

## 1. LANDING PAGE (eduvera.id)

```
eduvera.id/
├── /                        → Hero + CTA
├── /fitur                   → Fitur unggulan
├── /sekolah                 → Fitur khusus sekolah
├── /pesantren               → Fitur khusus pesantren
├── /harga                   → Pricing plans
├── /blog                    → Blog & artikel
├── /faq                     → FAQ
├── /tentang                 → Tentang EduVera
├── /kontak                  → Kontak & demo
├── /daftar                  → Form registrasi tenant
└── /verify/[kode]           → Verifikasi QR Rapor (publik)
```

---

## 2. OWNER PANEL (app.eduvera.id)

```
app.eduvera.id/
├── /login
├── /dashboard               → Overview platform global
├── /tenant                  → Daftar semua tenant
│   ├── /[id]                → Detail tenant
│   ├── /[id]/modul          → Feature flags per tenant
│   └── /[id]/log            → Activity log tenant
├── /billing                 → Daftar pembayaran langganan
├── /wa-gateway              → Konfigurasi WA Gateway master
├── /audit                   → Audit & security log global
└── /setting                 → System settings
```

---

## 3. SUPER ADMIN — YAYASAN (app.eduvera.id/yayasan)

```
app.eduvera.id/yayasan/
├── /login
├── /dashboard               → Overview semua tenant yayasan
├── /tenant                  → List tenant milik yayasan
│   └── /[id]                → Detail per tenant (read-only)
├── /laporan                 → Laporan aggregasi lintas tenant
│   ├── /akademik
│   ├── /keuangan
│   └── /sdm
└── /setting                 → Profil yayasan
```

---

## 4. TENANT APP — SEKOLAH ([tenant].eduvera.id)

```
[tenant].eduvera.id/
├── /login
│
├── /dashboard               → Dashboard Sekolah (KS/Admin)
│
├── /pendidikan/
│   ├── /siswa               → Data Siswa
│   ├── /siswa/[id]          → Detail Siswa
│   ├── /wali-siswa          → Data Wali Siswa
│   ├── /guru                → Data Guru
│   ├── /staf                → Data Staf
│   ├── /mapel               → Mata Pelajaran
│   ├── /jenjang             → Jenjang & Tingkat
│   ├── /jurusan             → Jurusan & Kompetensi (SMK)
│   ├── /mutasi-siswa        → Mutasi Siswa
│   ├── /kenaikan-kelas      → Proses Kenaikan Kelas
│   ├── /kelas               → Daftar Kelas
│   ├── /rombel              → Rombel
│   ├── /penugasan-guru      → Penugasan Guru
│   ├── /jadwal              → Jadwal Pembelajaran
│   ├── /absensi-siswa       → Absensi Siswa
│   ├── /kurikulum           → Setup Kurikulum
│   ├── /komponen-nilai      → Komponen Penilaian
│   ├── /template-rapor      → Template Rapor
│   ├── /nilai               → Input Nilai
│   ├── /rekap-nilai         → Rekap Nilai
│   ├── /catatan-wali-kelas  → Catatan Wali Kelas
│   ├── /rapor               → Generate & Arsip Rapor
│   ├── /ekskul              → Ekstrakurikuler
│   ├── /bk                  → Bimbingan Konseling
│   └── /kalender            → Kalender Akademik
│
├── /bendahara/
│   ├── /coa                 → COA / Akun
│   ├── /kategori            → Kategori Pemasukan & Pengeluaran
│   ├── /spp                 → SPP & Tagihan
│   ├── /pemasukan           → Pemasukan (BOS, Donasi)
│   ├── /pengeluaran         → Pengeluaran
│   ├── /rapbs               → Anggaran (RAPBS)
│   └── /laporan             → Laporan Keuangan
│
├── /tu/
│   ├── /guru                → Data Guru (SDM)
│   ├── /staf                → Data Staf (SDM)
│   ├── /struktur-org        → Struktur Organisasi
│   ├── /absensi-pegawai     → Absensi Pegawai
│   ├── /komponen-gaji       → Komponen Gaji
│   ├── /slip-gaji           → Generate & Riwayat Slip Gaji
│   ├── /inventaris          → Inventaris & Sarpras
│   ├── /surat               → Surat Menyurat
│   ├── /pengumuman          → Pengumuman
│   ├── /laporan             → Laporan TU
│   └── /pengaturan          → Pengaturan Sekolah
│
└── /notifikasi              → Riwayat Notifikasi
```

---

## 5. TENANT APP — PESANTREN ([tenant].eduvera.id)

```
[tenant].eduvera.id/
├── /login
│
├── /dashboard               → Dashboard Pesantren (Mudir/Admin)
│
├── /pendidikan/
│   ├── /santri              → Data Santri
│   ├── /santri/[id]         → Detail Santri
│   ├── /wali-santri         → Data Wali Santri
│   ├── /marhalah            → Marhalah & Tingkatan
│   ├── /tahun-ajaran        → Tahun Ajaran Hijriah
│   ├── /mutasi-santri       → Mutasi Santri
│   ├── /kenaikan-marhalah   → Proses Kenaikan Marhalah
│   ├── /asrama              → Data Asrama
│   ├── /kamar               → Data Kamar
│   ├── /penempatan          → Penempatan Santri
│   ├── /mutasi-kamar        → Mutasi Kamar
│   ├── /absensi-asrama      → Absensi Asrama
│   ├── /tata-tertib         → Tata Tertib
│   ├── /jenis-pelanggaran   → Jenis Pelanggaran
│   ├── /pelanggaran         → Riwayat Pelanggaran
│   ├── /sanksi              → Sanksi & Pembinaan
│   ├── /perizinan           → Perizinan Santri
│   ├── /catatan-musyrif     → Catatan Musyrif
│   ├── /kesehatan           → Kesehatan Santri
│   ├── /target-hafalan      → Target Hafalan
│   ├── /setoran             → Setoran Hafalan
│   ├── /murajaah            → Murajaah
│   ├── /nilai-tahfidz       → Penilaian Tahfidz
│   ├── /laporan-tahfidz     → Laporan Tahfidz
│   ├── /kitab               → Kitab & Materi
│   ├── /halaqah             → Halaqah
│   ├── /absensi-diniyah     → Absensi Diniyah
│   ├── /nilai-diniyah       → Penilaian Diniyah
│   ├── /program-kegiatan    → Program Kegiatan
│   ├── /rapor               → E-Rapor Pesantren
│   └── /kalender            → Kalender Hijriah
│
├── /bendahara/
│   ├── /coa                 → COA / Akun
│   ├── /kategori            → Kategori Pemasukan & Pengeluaran
│   ├── /spp                 → SPP & Tagihan
│   ├── /pemasukan           → Pemasukan (SPP, Donasi, Wakaf)
│   ├── /pengeluaran         → Pengeluaran
│   ├── /anggaran            → Anggaran
│   └── /laporan             → Laporan Keuangan
│
├── /sekretaris/
│   ├── /ustadz              → Data Ustadz
│   ├── /musyrif             → Data Musyrif
│   ├── /pengurus            → Data Pengurus
│   ├── /staf                → Data Staf
│   ├── /struktur-org        → Struktur Organisasi
│   ├── /absensi-sdm         → Absensi SDM
│   ├── /honor               → Honor & Insentif
│   ├── /surat               → Surat Menyurat
│   ├── /pengumuman          → Pengumuman
│   ├── /laporan             → Laporan Sekretariat
│   └── /pengaturan          → Pengaturan Pesantren
│
└── /notifikasi              → Riwayat Notifikasi
```

---

## 6. PORTAL SISWA ([tenant].eduvera.id/siswa)

```
/siswa/
├── /login
├── /dashboard               → Ringkasan
├── /profil                  → Profil diri
├── /jadwal                  → Jadwal pelajaran
├── /absensi                 → Riwayat absensi
├── /nilai                   → Nilai per mapel
├── /rapor                   → Daftar rapor
│   └── /[id]                → Download rapor
└── /pengumuman              → Pengumuman sekolah
```

---

## 7. PORTAL SANTRI ([tenant].eduvera.id/santri)

```
/santri/
├── /login
├── /dashboard               → Ringkasan
├── /profil                  → Profil diri
├── /absensi-asrama          → Riwayat absensi asrama
├── /hafalan                 → Progress tahfidz
├── /perizinan               → Ajukan & riwayat izin
├── /rapor                   → Daftar rapor
│   └── /[id]                → Download rapor
└── /pengumuman              → Pengumuman pesantren
```

---

## 8. PORTAL WALI ([tenant].eduvera.id/wali)

```
/wali/
├── /login
├── /dashboard               → Ringkasan semua anak
├── /anak/[id]/
│   ├── /profil              → Profil anak
│   ├── /absensi             → Riwayat absensi
│   ├── /tagihan             → Tagihan SPP & riwayat bayar
│   ├── /rapor               → Daftar rapor
│   │   └── /[id]            → Download rapor
│   └── /hafalan             → Progress tahfidz (pesantren)
├── /perizinan               → Ajukan izin (pesantren)
└── /pengumuman              → Pengumuman untuk wali
```
