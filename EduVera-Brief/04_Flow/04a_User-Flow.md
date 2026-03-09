# USER FLOW
## EduVera — Platform Manajemen Pendidikan Terpadu

---

## 1. REGISTRASI & ONBOARDING TENANT

```
Calon Tenant (Kepala Sekolah/Admin Yayasan)
        │
        ▼
Buka eduvera.id → Klik "Daftar Gratis"
        │
        ▼
Isi Form Registrasi:
- Nama institusi
- Jenis: Sekolah / Pesantren / Hybrid
- Nama PIC + Email + No WA
- Subdomain yang diinginkan
        │
        ▼
Submit → Notifikasi "Pendaftaran diterima, menunggu aktivasi"
        │
        ▼
Owner EduVera review & approve
        │
        ▼
Tenant menerima notifikasi WA + Email:
- URL subdomain aktif
- Kredensial login Admin Tenant
        │
        ▼
Login ke [tenant].eduvera.id
        │
        ▼
Setup Awal (Wizard Onboarding):
1. Lengkapi profil institusi + upload logo
2. Aktifkan jenjang (Sekolah) / Marhalah (Pesantren)
3. Buat tahun ajaran aktif
4. Tambah user pertama (Guru/Bendahara/TU)
        │
        ▼
Masuk Dashboard Utama ✅
```

---

## 2. LOGIN — SEMUA USER

```
User buka [tenant].eduvera.id
        │
        ▼
Halaman Login
- Input email + password
        │
        ├── Tenant tidak aktif → Halaman "Akses Ditutup"
        ├── Tenant suspend → Halaman "Akun Suspend"
        ├── Email tidak ditemukan → Error "Email tidak terdaftar"
        ├── Password salah (< 5x) → Error "Password salah"
        ├── Password salah 5x → Lock 15 menit → Notif email
        └── Berhasil →
                │
                ▼
        Generate JWT session
                │
                ▼
        Redirect sesuai role:
        - Admin/KS/Mudir → Dashboard Utama
        - Guru → Dashboard Pendidikan
        - Bendahara → Dashboard Bendahara
        - TU/Sekretaris → Dashboard TU/Sekretaris
        - Siswa → Portal Siswa
        - Santri → Portal Santri
        - Wali → Portal Wali
```

---

## 3. USER FLOW — SEKOLAH: TAMBAH SISWA BARU

```
Admin/TU buka menu Data Siswa
        │
        ▼
Klik "Tambah Siswa"
        │
        ▼
Isi form: Nama, NIS, NISN, TTL, Jenis kelamin,
         Jenjang, Tingkat, Jurusan (SMK)
        │
        ▼
Isi data wali: Nama, hubungan, no WA, email
        │
        ▼
Submit → Validasi sistem:
- NIS unik per tenant?
- Jenjang aktif di tenant?
        │
        ├── Gagal validasi → Highlight field error
        └── Berhasil →
                │
                ▼
        Siswa tersimpan
        Akun portal wali dibuat otomatis
        Kredensial wali dikirim via WA + Email
                │
                ▼
        Redirect ke Detail Siswa ✅
```

---

## 4. USER FLOW — SEKOLAH: INPUT NILAI

```
Guru login → Dashboard Pendidikan
        │
        ▼
Menu Nilai → Pilih Kelas → Pilih Mapel → Pilih Semester
        │
        ▼
Tabel inline: List siswa + kolom komponen nilai
        │
        ▼
Guru input nilai per siswa per komponen
(auto-hitung nilai akhir realtime)
        │
        ▼
Klik "Simpan Draft"
        │
        ▼
Nilai tersimpan status DRAFT
Bisa diedit kapan saja sebelum rapor published
        │
        ▼
[Setelah semua nilai lengkap]
Admin/KS review kelengkapan
        │
        ▼
Generate Rapor → Nilai ter-lock ✅
```

---

## 5. USER FLOW — SEKOLAH: GENERATE & PUBLISH RAPOR

```
Admin/KS buka menu Rapor
        │
        ▼
Pilih Kelas + Semester + Tahun Ajaran
        │
        ▼
Sistem cek kelengkapan:
- Semua nilai sudah diisi?
- Catatan wali kelas sudah diisi?
- Template rapor sudah dikonfigurasi?
        │
        ├── Ada yang kurang → Tampil checklist warning
        └── Lengkap →
                │
                ▼
        Klik "Generate Rapor"
        [Single: 1 siswa | Bulk: semua siswa di kelas]
                │
                ▼
        Inngest job berjalan:
        - Render HTML rapor per siswa
        - Puppeteer → PDF
        - Generate QR Code unik
        - Upload ke Cloudflare R2
        - Update status rapor
                │
                ▼
        Notifikasi in-app: "Rapor selesai dibuat"
                │
                ▼
        Admin Preview PDF
                │
                ▼
        Klik "Publish"
        Konfirmasi modal: "Rapor tidak bisa di-unpublish"
                │
                ▼
        Status → PUBLISHED
        Nilai ter-lock permanen
        Notifikasi WA ke semua wali murid
        Wali bisa download di portal ✅
```

---

## 6. USER FLOW — SEKOLAH: KONFIRMASI PEMBAYARAN SPP

```
Wali transfer SPP → Konfirmasi ke sekolah
        │
        ▼
Bendahara buka menu SPP → Status Pembayaran
        │
        ▼
Cari siswa (nama/kelas/NIS)
        │
        ▼
Klik "Konfirmasi Bayar"
        │
        ▼
Isi form:
- Nominal diterima
- Tanggal bayar
- Metode (Transfer/Cash)
- Upload bukti (opsional)
        │
        ▼
Submit → Update status tagihan
        │
        ▼
Transaksi ter-posting ke COA
Notifikasi WA ke wali: "SPP [bulan] telah dikonfirmasi" ✅
```

---

## 7. USER FLOW — SEKOLAH: GENERATE SLIP GAJI

```
TU buka menu Penggajian
        │
        ▼
Pastikan rekap absensi bulan ini sudah dikunci
        │
        ▼
Klik "Generate Slip Gaji" → Pilih Periode
        │
        ▼
Sistem kalkulasi otomatis:
- Ambil data absensi yang sudah dikunci
- Hitung jam mengajar dari jadwal
- Terapkan komponen gaji per pegawai
        │
        ▼
Preview total per pegawai
        │
        ▼
TU review → Klik "Publish"
        │
        ▼
Slip Gaji status PUBLISHED (immutable)
Notifikasi WA/Email ke semua pegawai
Data gaji dikirim ke Bendahara untuk diposting ✅
```

---

## 8. USER FLOW — SEKOLAH: PROSES KENAIKAN KELAS

```
Admin/KS buka menu Kenaikan Kelas
        │
        ▼
Pilih Tahun Ajaran yang akan berakhir
        │
        ▼
Sistem load semua siswa aktif per kelas
Default: semua siswa = NAIK KELAS
        │
        ▼
Admin/Guru review per siswa
Override: tandai siswa "Tinggal Kelas" + wajib input alasan
        │
        ▼
Preview hasil kenaikan:
- X siswa naik ke kelas [berikutnya]
- Y siswa tinggal kelas
- Z siswa lulus (kelas akhir)
        │
        ▼
Klik "Konfirmasi Kenaikan"
Modal: "Proses ini tidak bisa dibatalkan"
        │
        ▼
Sistem eksekusi:
- Update tingkat semua siswa yang naik
- Generate kelas baru tahun ajaran berikutnya
- Kelas lama → read-only
- Notifikasi ke wali ✅
```

---

## 9. USER FLOW — PESANTREN: PENEMPATAN SANTRI DI ASRAMA

```
Admin/Musyrif buka menu Penempatan Santri
        │
        ▼
Pilih santri (filter: belum ditempatkan / mukim)
        │
        ▼
Pilih Asrama → Pilih Kamar
        │
        ▼
Sistem validasi:
- Jenis kelamin santri = jenis asrama?
- Kapasitas kamar belum penuh?
        │
        ├── Tidak valid → Error spesifik
        └── Valid →
                │
                ▼
        Konfirmasi penempatan
                │
                ▼
        Santri ditempatkan
        Status kamar ter-update (kapasitas terisi +1)
        Riwayat penempatan tersimpan ✅
```

---

## 10. USER FLOW — PESANTREN: INPUT SETORAN TAHFIDZ

```
Ustadz Tahfidz login → Dashboard Pendidikan
        │
        ▼
Menu Setoran Hafalan
        │
        ▼
Pilih Santri (dari binaan ustadz)
        │
        ▼
Isi form setoran:
- Jenis: Baru / Murajaah
- Surah + Ayat mulai
- Surah + Ayat akhir
- Nilai awal: Lancar / Kurang / Ulang
        │
        ▼
Sistem validasi:
- Surah 1–114?
- Ayat valid untuk surah tersebut?
        │
        ▼
Simpan → Progress hafalan santri ter-update
Rekap pekanan & bulanan otomatis ter-kalkulasi ✅
```

---

## 11. USER FLOW — PESANTREN: PERIZINAN SANTRI

```
Wali Santri login ke Portal Wali
        │
        ▼
Menu Perizinan → Ajukan Izin
        │
        ▼
Isi form:
- Jenis: Keluar / Pulang / Sakit
- Tanggal mulai → Tanggal kembali
- Alasan izin
        │
        ▼
Submit → Status: PENDING
Notifikasi ke Musyrif via WA + Dashboard
        │
        ▼
Musyrif login → Menu Perizinan
        │
        ▼
Review pengajuan izin
        │
        ├── Tolak → Input alasan → Notifikasi ke wali
        └── Setujui →
                │
                ▼
        Status: DISETUJUI
        Absensi asrama tanggal terkait → auto status IZIN
        Notifikasi WA ke wali ✅
```

---

## 12. USER FLOW — PESANTREN: PELANGGARAN & SANKSI

```
Musyrif observasi pelanggaran santri
        │
        ▼
Menu Pelanggaran → Input Pelanggaran
        │
        ▼
Pilih santri → Pilih jenis pelanggaran
(poin otomatis ter-isi dari master jenis)
        │
        ▼
Input keterangan → Submit
        │
        ▼
Sistem:
- Tambah poin ke akumulasi santri
- Cek apakah poin > threshold?
        │
        ├── Poin < threshold → Tersimpan biasa
        └── Poin > threshold ATAU level BERAT →
                │
                ▼
        Rekomendasi sanksi otomatis muncul
        Notifikasi ke Admin + Mudir
                │
                ▼
        Admin buka menu Sanksi
        Pilih jenis sanksi → Assign ke santri
        Set deadline progress
                │
                ▼
        Monitor progress hingga selesai ✅
```

---

## 13. USER FLOW — PESANTREN: E-RAPOR PUBLISH

```
Admin/Mudir buka menu E-Rapor
        │
        ▼
Pilih Marhalah + Tahun Hijriah + Semester
        │
        ▼
Cek kelengkapan nilai:
- Penilaian Tahfidz semua sudah VALID?
- Penilaian Diniyah semua sudah VALID?
- Catatan Musyrif sudah ada?
        │
        ├── Belum lengkap → Tampil checklist per item
        └── Lengkap →
                │
                ▼
        Preview rapor 1 santri sample
                │
                ▼
        Klik "Generate Semua" (Bulk)
        Inngest job berjalan background
                │
                ▼
        Notifikasi in-app: "Rapor selesai"
                │
                ▼
        Mudir review random beberapa rapor
                │
                ▼
        Klik "Publish Semua"
        Konfirmasi modal
                │
                ▼
        Status PUBLISHED (immutable)
        Notifikasi WA ke semua wali santri ✅
```

---

## 14. USER FLOW — PORTAL WALI: LIHAT & DOWNLOAD RAPOR

```
Wali buka [tenant].eduvera.id/wali
        │
        ▼
Login dengan akun yang dikirim via WA/Email
        │
        ▼
Dashboard Wali:
- Tampil semua anak yang terdaftar
        │
        ▼
Klik nama anak → Tab "Rapor"
        │
        ▼
Daftar rapor yang sudah published
        │
        ▼
Klik "Download PDF"
        │
        ▼
Sistem generate signed URL (TTL 1 jam)
Browser download PDF ✅
```

---

## 15. USER FLOW — OWNER: MONITORING TENANT

```
Owner login ke app.eduvera.id
        │
        ▼
Dashboard: Overview semua tenant
        │
        ▼
Filter tenant: Trial / Aktif / Akan Expired / Suspend
        │
        ▼
Klik tenant tertentu → Detail tenant:
- Info institusi
- Modul aktif
- Statistik penggunaan
- Log aktivitas
        │
        ├── Perlu suspend → Klik Suspend → Konfirmasi
        ├── Perlu extend trial → Edit tanggal trial
        ├── Perlu ubah modul → Toggle feature flags
        └── Perlu konfirmasi bayar →
                │
                ▼
        Menu Billing → Daftar Pending
        Review bukti bayar → Konfirmasi
        Status tenant → AKTIF ✅
```
