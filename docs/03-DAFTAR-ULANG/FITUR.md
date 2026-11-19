# 📋 Menu: DAFTAR ULANG — Daftar Fitur Lengkap

---

## 1. Daftar List Daftar Ulang

### Tampilan Tabel
| Kolom | Keterangan |
|---|---|
| Nama Siswa | Nama lengkap siswa |
| Kelas Saat Ini | Kelas aktif sebelumnya |
| Tahun Ajaran | TA yang sedang diproses daftar ulangnya |
| Status | Badge: pending / confirmed / cancelled |
| Sumber | offline / online |
| Tanggal Konfirmasi | Waktu konfirmasi daftar ulang |
| Aksi | Detail, Konfirmasi, Batalkan |

### Filter Tersedia
- Filter Status (pending / confirmed / cancelled)
- Filter Tahun Ajaran
- Filter Kelas
- Search Nama Siswa

### Pagination
- Default 20 per halaman

---

## 2. Generate Daftar Ulang Massal

- Buat record daftar ulang untuk semua siswa aktif sekaligus
- Pilih Tahun Ajaran tujuan
- Sistem otomatis generate `re_registrations` untuk setiap siswa aktif
- Tombol: **Generate Daftar Ulang untuk TA [Tahun]**

---

## 3. Konfirmasi Daftar Ulang (Per Siswa)

- Ubah status dari `pending` → `confirmed`
- Input: Catatan konfirmasi
- Catat `confirmed_at` timestamp

---

## 4. Input Pembayaran Daftar Ulang

- Sama dengan `registration_payments` namun `payable_type = 're_registration'`
- Jenis pembayaran: formulir ulang, seragam baru, dll
- Metode: tunai / transfer
- Cetak kuitansi pembayaran

---

## 5. Batalkan Daftar Ulang

- Ubah status menjadi `cancelled`
- Wajib input alasan pembatalan di catatan
- Siswa yang cancelled bisa diproses sebagai mutasi keluar

---

## 6. Export Data

- Export ke Excel daftar seluruh siswa yang daftar ulang
- Filter by status, tahun ajaran
- Kolom export: nama, kelas, status, tanggal konfirmasi

---

## 7. Notifikasi (Rencana)

- Blast WhatsApp ke orang tua yang belum konfirmasi daftar ulang
- Reminder otomatis H-7 dan H-3 sebelum batas waktu
