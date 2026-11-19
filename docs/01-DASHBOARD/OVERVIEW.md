# 📊 Menu: DASHBOARD — Overview

> **Route:** `/dashboard`  
> **Akses:** Semua Role (Super Admin, Admin, Guru, Staf)  
> **Modul:** Ringkasan sistem, statistik real-time

---

## Deskripsi Umum

Dashboard adalah halaman utama setelah login. Menampilkan ringkasan seluruh data penting sistem secara agregat dan real-time. Berfungsi sebagai command center untuk kepala sekolah, admin, dan guru.

---

## Komponen Halaman

| Komponen | Deskripsi |
|---|---|
| **Header Stats Cards** | Kartu ringkasan: total siswa aktif, total guru, total pemasukan bulan ini, tagihan belum lunas |
| **Grafik Keuangan** | Chart bulanan pemasukan vs pengeluaran (bar chart / line chart) |
| **Absensi Hari Ini** | Tabel ringkasan absensi siswa hari ini per kelas |
| **Tagihan Jatuh Tempo** | Daftar 5 siswa dengan tagihan infaq tertunggak terlama |
| **Aktivitas Terbaru** | Log aktivitas sistem (audit log) terbaru |
| **Kalender Mini** | Tampilan bulan ini dengan event akademik |
| **Pengumuman Aktif** | Daftar pengumuman yang sedang aktif |

---

## Filter & Parameter

| Filter | Nilai |
|---|---|
| **Unit / Lembaga** | Dropdown pilih unit (untuk Super Admin multi-unit) |
| **Tahun Ajaran** | Otomatis menggunakan tahun ajaran aktif |

---

## Navigasi Cepat (Quick Actions)

- Tambah Siswa Baru
- Input Pembayaran Infaq
- Buat Pengumuman
- Input Absensi

---

## Status Implementasi

| Item | Status |
|---|---|
| Stats Cards | ✅ Implemented |
| Grafik Keuangan | ✅ Implemented |
| Absensi Hari Ini | ✅ Implemented |
| Quick Actions | ⚠️ Partial |
| Kalender Mini | ❌ Belum |
