# 📋 Menu: PENERIMAAN PPDB — Daftar Fitur Lengkap

---

## 1. Daftar Pendaftar

### Tampilan Tabel
| Kolom | Keterangan |
|---|---|
| No. Formulir | Nomor unik pendaftaran |
| Nama Lengkap | Nama calon siswa |
| Jenis Kelamin | L / P |
| Asal Sekolah | Sekolah sebelumnya |
| Kelas Tujuan | Target kelas yang dituju |
| Sumber | Offline / Online |
| Status | Badge warna (pending/verified/accepted/rejected) |
| Tanggal Daftar | Waktu pendaftaran |
| Aksi | Tombol Detail, Edit, Hapus |

### Filter Tersedia
- Filter Status (pending / verified / interviewed / accepted / rejected)
- Filter Jenis Kelamin
- Filter Kelas Tujuan
- Filter Sumber (online / offline)
- Filter Tanggal Daftar (range)
- Search Nama / No. Formulir / NISN

### Pagination
- Default 20 data per halaman
- Pilihan: 10, 20, 50, 100

---

## 2. Tambah Pendaftar Baru (Offline)

### Seksi Form

#### A. Data Pribadi Calon Siswa
- Nomor Formulir (auto-generate atau manual)
- Nama Lengkap *
- Jenis Kelamin * (L/P)
- Tempat Lahir *
- Tanggal Lahir *
- NIK
- No. KK
- NISN
- No. HP (Orang Tua/Wali)
- Alamat *
- Agama
- Status Keluarga (yatim/piatu/yatim-piatu/lengkap)
- Jumlah Saudara
- Anak Ke-
- Desa/Kelurahan
- Kecamatan
- Jenis Tempat Tinggal
- Transportasi ke Sekolah
- No. HP Pribadi Siswa
- Tinggi Badan (cm)
- Berat Badan (kg)
- Jarak Tempuh ke Sekolah
- Waktu Tempuh (menit)

#### B. Asal Sekolah
- Nama Sekolah Asal *
- Kelas Tujuan *

#### C. Data Orang Tua — Ayah
- Nama Ayah
- Tempat Lahir Ayah
- Tanggal Lahir Ayah
- NIK Ayah
- Pendidikan Terakhir Ayah
- Pekerjaan Ayah

#### D. Data Orang Tua — Ibu
- Nama Ibu
- Tempat Lahir Ibu
- Tanggal Lahir Ibu
- NIK Ibu
- Pendidikan Terakhir Ibu
- Pekerjaan Ibu

#### E. Data Wali (Jika Berbeda)
- Nama Wali
- Tempat Lahir Wali
- Tanggal Lahir Wali
- NIK Wali
- Pendidikan Terakhir Wali
- Pekerjaan Wali
- Alamat Wali
- No. HP Wali

#### F. Penghasilan Orang Tua
- Penghasilan Gabungan (dropdown range)

#### G. Keterangan Tambahan
- Sumber Pendaftaran (online/offline)
- Catatan Admin

---

## 3. Edit Pendaftar

- Semua field form Tambah dapat diedit
- Rekam history perubahan (audit log)

---

## 4. Detail Pendaftar

- Tampil semua data dalam layout card
- Timeline status perubahan
- Histori pembayaran pendaftaran (jika ada)
- Tombol Ubah Status
- Tombol Cetak Bukti Pendaftaran

---

## 5. Ubah Status

| Dari | Ke | Keterangan |
|---|---|---|
| pending | verified | Admin telah memverifikasi data |
| verified | interviewed | Sudah tes/wawancara |
| interviewed | accepted | Diterima |
| interviewed | rejected | Tidak diterima |
| accepted | (Daftar Ulang) | Trigger ke modul Daftar Ulang |

---

## 6. Pencatatan Pembayaran Pendaftaran

- Input nominal biaya pendaftaran
- Pilih metode pembayaran (tunai / transfer)
- Status bayar (sudah / belum)
- Cetak kuitansi

---

## 7. Import Excel Massal

- Upload file `.xlsx` sesuai template
- Validasi: duplikat NISN, NIK, No. Formulir
- Preview sebelum import
- Download template Excel

---

## 8. Export Data

- Export ke Excel semua data pendaftar
- Filter export berdasarkan status
- Export ke PDF (daftar pendaftar)

---

## 9. Cetak Dokumen

| Dokumen | Keterangan |
|---|---|
| Bukti Pendaftaran | PDF dengan data lengkap + nomor formulir |
| Kartu Peserta Tes | Kartu identitas untuk mengikuti tes |
| Surat Penerimaan | PDF resmi untuk peserta accepted |
| Surat Penolakan | PDF untuk peserta rejected |
