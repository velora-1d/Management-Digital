# SYSTEM FLOW — PESANTREN: MENU TAMBAHAN
## EduVera — Platform Manajemen Pendidikan Terpadu
## (Kesehatan Santri, Program Kegiatan, Kenaikan Marhalah, Mutasi Santri, Surat Menyurat)

---

## 1. SYSTEM FLOW — KESEHATAN SANTRI

### 1.1 Input Pemeriksaan
```
Petugas Kesehatan / Musyrif input pemeriksaan
        │
        ▼
Pilih santri → Isi form:
- Keluhan
- Diagnosis
- Tindakan
- Tanggal
        │
        ▼
Tersimpan di rekam_medis
Widget dashboard: "Santri sakit hari ini" ter-update
        │
        ▼
Jika perlu dirujuk:
Input rujukan → Nama RS + Dokter + Diagnosa
Upload surat rujukan → R2
        │
        ▼
Update tindak lanjut setelah santri kembali
```

### 1.2 Manajemen Stok Obat
```
Petugas input stok masuk:
- Nama obat + jumlah + tanggal
        │
        ▼
Stok ter-update
        │
        ▼
Setiap penggunaan obat:
Input pengeluaran stok → Stok berkurang
        │
        ▼
Sistem cek threshold minimum:
Jika stok < minimum → Warning di dashboard
Notifikasi ke Admin via WA/Email
```

---

## 2. SYSTEM FLOW — PROGRAM KEGIATAN

### 2.1 Buat Program Baru
```
Admin/Sekretaris buat program kegiatan
        │
        ▼
Isi: nama, jenis, deskripsi, tanggal, lokasi
        │
        ▼
Assign panitia dari data SDM
Assign peserta dari data santri (filter per marhalah)
        │
        ▼
Input rundown agenda per slot waktu
        │
        ▼
Program tersimpan
Event otomatis masuk ke Kalender Hijriah
Reminder otomatis terjadwal (H-7, H-3, H-1)
```

### 2.2 Dokumentasi & Laporan Kegiatan
```
Setelah kegiatan selesai:
        │
        ▼
Admin upload foto/dokumen → R2
Input evaluasi dan catatan
        │
        ▼
Status program → SELESAI
Laporan tersimpan di arsip ✅
```

---

## 3. SYSTEM FLOW — KENAIKAN MARHALAH

```
Admin/Mudir buka menu Kenaikan Marhalah
        │
        ▼
Pilih tahun hijriah yang berakhir
        │
        ▼
Sistem load semua santri aktif per marhalah
Status default: NAIK semua
        │
        ▼
Admin override per santri → TETAP DI MARHALAH
(Wajib input alasan: nilai kurang / poin pelanggaran tinggi)
        │
        ▼
Admin klik Konfirmasi Massal
        │
        ▼
DB Transaction (Atomic):
- UPDATE marhalah santri yang naik
- Santri marhalah tertinggi → status LULUS → ARSIP
- Riwayat kenaikan tersimpan
        │
        ▼
Audit trail tersimpan ✅
```

---

## 4. SYSTEM FLOW — MUTASI SANTRI

### 4.1 Santri Masuk dari Pesantren Lain
```
Admin input data mutasi masuk
        │
        ▼
Isi: data santri lengkap + asal pesantren
Upload surat keterangan dari pesantren asal
Input riwayat hafalan terakhir (opsional)
        │
        ▼
Buat data santri baru status AKTIF
Riwayat mutasi tersimpan
        │
        ▼
Admin assign marhalah + asrama
Ustadz Tahfidz bisa mulai input setoran baru ✅
```

### 4.2 Santri Keluar / Pindah Pesantren
```
Admin input mutasi keluar
        │
        ▼
Pilih santri → Input: alasan + tanggal + tujuan pesantren baru
Upload surat pengantar (opsional)
        │
        ▼
Status santri → NONAKTIF
Penempatan asrama → Tutup (tgl_keluar ter-isi)
Status kamar → ter-update (kapasitas berkurang)
Data historis tetap tersimpan ✅
```

---

## 5. SYSTEM FLOW — SURAT MENYURAT PESANTREN

### 5.1 Surat Keterangan Santri
```
Sekretaris pilih jenis surat:
- Surat Keterangan Santri Aktif
- Surat Keterangan Lulus
- Surat Keterangan Pindah
- Surat Rekomendasi
        │
        ▼
Pilih santri → Data auto-terisi:
(Nama, kode santri, marhalah, tahun masuk, dll)
        │
        ▼
Preview surat → Edit jika perlu
        │
        ▼
Generate PDF dengan TTD digital Mudir
Tersimpan di R2
Bisa didownload dan diprint ✅
```

---

## 6. SYSTEM FLOW — HONOR USTADZ (LENGKAP)

```
Akhir bulan:
        │
        ▼
Sekretaris kunci rekap absensi SDM
        │
        ▼
Sistem kalkulasi honor per ustadz:

Honor Mengajar:
- Ambil data absensi halaqah per ustadz
- Hitung jumlah pertemuan × tarif per pertemuan
- ATAU: jam mengajar × tarif per jam
- ATAU: bulanan flat (tergantung skema)

Insentif Tahfidz:
- Ambil data setoran santri per ustadz bulan ini
- Hitung total ayat/juz yang diselesaikan santri
- Terapkan insentif per capaian
        │
        ▼
Sekretaris review kalkulasi per ustadz
        │
        ▼
Klik "Approve" → Status: DISETUJUI
Data honor dikirim ke Bendahara
        │
        ▼
Bendahara review → Posting ke COA Pengeluaran
        │
        ▼
Slip honor PDF di-generate
Notifikasi WA/Email ke ustadz
Ustadz lihat & download slip di portal ✅
```

---

## 7. SYSTEM FLOW — ABSENSI ASRAMA (DETAIL)

```
Musyrif buka menu Absensi Asrama
        │
        ▼
Pilih asrama → Pilih sesi (PAGI / MALAM)
Tanggal = hari ini (default)
        │
        ▼
Sistem load semua santri di asrama tersebut
        │
        ▼
Untuk setiap santri, sistem cek:
Apakah ada izin aktif untuk tanggal ini?
        │
        ├── Ada izin → Status otomatis = IZIN (tidak bisa diubah)
        └── Tidak ada izin → Default = HADIR
                │
                ▼
        Musyrif input santri yang tidak hadir (alpha)
        Tambah keterangan jika perlu
                │
                ▼
        Simpan → Tersimpan di absensi_asrama
        UNIQUE constraint: santri + tanggal + sesi
        (tidak bisa input 2x)
                │
                ▼
        Sistem flag santri alpha:
        Notifikasi ke Admin jika alpha > X hari berturut ✅
```
