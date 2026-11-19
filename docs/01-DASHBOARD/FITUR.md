# 📋 Menu: DASHBOARD — Daftar Fitur Lengkap

---

## 1. Statistik Ringkasan (Stats Cards)

### Fitur
- **Total Siswa Aktif** — Hitung `students` WHERE `status = 'aktif'` dan `deleted_at IS NULL`
- **Total Guru & Staf** — Hitung `employees` WHERE `status = 'aktif'` dan `deleted_at IS NULL`
- **Pemasukan Bulan Ini** — Aggregate `general_transactions.amount` WHERE `type = 'in'` dan bulan berjalan
- **Tagihan Belum Lunas** — Hitung `infaq_bills` WHERE `status = 'belum_lunas'`
- **Total Peserta PPDB** — Hitung `ppdb_registrations` aktif bulan/tahun berjalan

### Filter Tersedia
- Filter Unit (multi-lembaga)
- Filter Tahun Ajaran Aktif

---

## 2. Grafik Keuangan Bulanan

### Fitur
- Grafik Bar / Line: Pemasukan vs Pengeluaran per bulan
- Rentang: 12 bulan terakhir atau per tahun ajaran
- Tooltip detail saat hover
- Data dari `general_transactions`

### Filter
- Pilih Tahun
- Pilih Jenis Grafik (Bar / Line)

---

## 3. Ringkasan Absensi Hari Ini

### Fitur
- Tabel per kelas: total siswa, hadir, sakit, izin, alpha
- Data dari `attendances` WHERE `date = TODAY`
- Badge warna status (hijau hadir, merah alpha, kuning izin)
- Link langsung ke halaman Absensi

---

## 4. Daftar Tagihan Tertunggak

### Fitur
- Tampil top 10 siswa dengan tagihan `infaq_bills` status `belum_lunas` terlama
- Kolom: Nama Siswa, Kelas, Bulan Tertunggak, Total Tunggakan
- Tombol **Bayar Sekarang** → redirect ke halaman pembayaran infaq siswa tersebut

---

## 5. Log Aktivitas Terbaru

### Fitur
- Tampil 10 aktivitas terakhir dari `audit_logs`
- Kolom: Waktu, User, Aksi, Objek
- Filter berdasarkan jenis aksi (create, update, delete)

---

## 6. Kalender Akademik Mini

### Fitur
- Tampil kalender bulan ini
- Event dari `calendar_events` ditampilkan sebagai dot berwarna
- Hover: tooltip nama event
- Klik: detail event

---

## 7. Pengumuman Aktif

### Fitur
- Tampil pengumuman dari `announcements` WHERE `status = 'published'`
- Urut berdasarkan `scheduled_at` terbaru
- Tombol **Lihat Semua** → redirect ke halaman Pengumuman

---

## 8. Quick Actions

| Aksi | Tujuan |
|---|---|
| ➕ Tambah Siswa | Redirect `/students?action=new` |
| 💰 Input Pembayaran | Redirect `/infaq-bills?action=pay` |
| 📢 Buat Pengumuman | Redirect `/announcements?action=new` |
| 📋 Input Absensi | Redirect `/attendance?action=input` |

---

## Aksi & Tombol

| Tombol | Aksi |
|---|---|
| **Refresh Data** | Reload semua stats card |
| **Lihat Detail** | Navigasi ke halaman modul terkait |
| **Export Ringkasan** | Export summary ke PDF/Excel |
