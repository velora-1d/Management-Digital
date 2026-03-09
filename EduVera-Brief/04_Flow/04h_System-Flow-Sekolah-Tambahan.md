# SYSTEM FLOW — SEKOLAH: MENU TAMBAHAN
## EduVera — Platform Manajemen Pendidikan Terpadu
## (Ekskul, BK, Mutasi Siswa, Kenaikan Kelas, Inventaris, Surat Menyurat)

---

## 1. SYSTEM FLOW — EKSTRAKURIKULER

### 1.1 Tambah Ekskul & Assign Anggota
```
Admin input data ekskul (nama, jadwal, pembina)
        │
        ▼
Validasi: pembina adalah guru aktif di tenant?
        │
        ▼
Ekskul tersimpan
        │
        ▼
Admin assign siswa ke ekskul
(siswa bisa multi-ekskul)
        │
        ▼
Data anggota tersimpan
```

### 1.2 Absensi Ekskul
```
Guru/Pembina buka absensi ekskul
        │
        ▼
Pilih ekskul + tanggal pertemuan
        │
        ▼
Sistem load daftar anggota
Default: semua HADIR
        │
        ▼
Pembina klik siswa yang tidak hadir
        │
        ▼
Simpan → Tersimpan per pertemuan
Rekap otomatis ter-update
```

### 1.3 Nilai Ekskul → Masuk Rapor
```
Guru input nilai + predikat per siswa per ekskul
        │
        ▼
Nilai tersimpan di tabel nilai_ekskul
        │
        ▼
Saat generate rapor:
Sistem baca nilai ekskul
→ Masuk ke bagian ekstrakurikuler di rapor PDF
```

---

## 2. SYSTEM FLOW — BIMBINGAN KONSELING (BK)

```
Guru BK input catatan konseling
        │
        ▼
Pilih siswa → Pilih jenis masalah → Input catatan
        │
        ▼
Tersimpan di catatan_bk
Akses: hanya Guru BK + Admin
        │
        ▼
Guru BK update status tindak lanjut:
- AKTIF → PROSES → SELESAI
        │
        ▼
Laporan kasus bisa di-export per periode
```

---

## 3. SYSTEM FLOW — MUTASI SISWA

### 3.1 Pindah Masuk
```
Admin input data mutasi masuk
        │
        ▼
Isi: nama, asal sekolah, alasan, upload dokumen
        │
        ▼
Buat data siswa baru dengan status AKTIF
Riwayat mutasi tersimpan
        │
        ▼
Admin assign ke kelas aktif
```

### 3.2 Pindah Keluar
```
Admin input mutasi keluar
        │
        ▼
Pilih siswa → Input alasan + tgl keluar → Upload dokumen
        │
        ▼
Status siswa → NONAKTIF
Riwayat mutasi tersimpan
Data historis (nilai, absensi, rapor) tetap ada (read-only)
```

---

## 4. SYSTEM FLOW — KENAIKAN KELAS

```
Admin buka menu Kenaikan Kelas
        │
        ▼
Pilih tahun ajaran yang berakhir
        │
        ▼
Sistem load semua siswa aktif per kelas
Status default: NAIK semua
        │
        ▼
Admin/Guru override → Tandai TINGGAL KELAS
(Wajib input alasan)
        │
        ▼
Admin klik Konfirmasi
        │
        ▼
DB Transaction (Atomic):
- UPDATE siswa tingkat +1 (yang naik)
- UPDATE siswa tingkat sama (tinggal)
- Siswa kelas akhir → status LULUS → ARSIP
- Kelas lama → status ARSIP (read-only)
- Generate kelas baru tahun ajaran berikutnya
        │
        ▼
Audit trail tersimpan
Notifikasi opsional ke wali
```

---

## 5. SYSTEM FLOW — INVENTARIS & PENGADAAN

```
TU input barang baru:
- Nama, kategori, jumlah, kondisi awal
        │
        ▼
Barang tersimpan di inventaris
        │
        ▼
TU update kondisi barang secara berkala
        │
        ▼
Rencana Pengadaan:
- Input kebutuhan + estimasi biaya
        │
        ▼
Pengadaan disetujui → Realisasi:
- Update stok barang
- Auto-buat draft pengeluaran di Bendahara
  (TU kirim ke Bendahara untuk diposting)
```

---

## 6. SYSTEM FLOW — SURAT MENYURAT

### 6.1 Surat Masuk
```
TU terima surat fisik/digital
        │
        ▼
Input ke sistem: pengirim, tanggal, perihal
Upload scan dokumen → Cloudflare R2
        │
        ▼
Input disposisi: ditujukan ke siapa + instruksi
        │
        ▼
Notifikasi ke penerima disposisi via Dashboard
        │
        ▼
Surat tersimpan di arsip digital
```

### 6.2 Surat Keluar
```
TU buat surat keluar
        │
        ▼
Nomor surat di-generate otomatis:
Format: [nomor_urut]/[kode_sekolah]/[bulan_romawi]/[tahun]
        │
        ▼
TU input: tujuan, perihal, isi (atau upload dokumen)
        │
        ▼
Print / PDF → Arsip di sistem
```

### 6.3 Surat Keterangan Siswa
```
TU pilih jenis surat:
- Surat Keterangan Aktif
- Surat Keterangan Lulus
- Surat Keterangan Pindah
        │
        ▼
Pilih siswa → Data auto-terisi dari DB
(Nama, NIS, kelas, tahun ajaran, dll)
        │
        ▼
Preview surat → Generate PDF
PDF tersimpan di R2
Bisa didownload dan diprint
```

---

## 7. SYSTEM FLOW — PENGUMUMAN SEKOLAH

```
TU/Admin buat pengumuman
        │
        ▼
Isi: judul, isi, target penerima, channel, jadwal
        │
        ▼
Klik Kirim / Jadwalkan
        │
        ▼
[Langsung kirim]          [Jadwalkan]
        │                       │
        ▼                       ▼
Inngest job trigger     Inngest scheduled job
        │                       │
        └──────────┬────────────┘
                   ▼
        Loop per penerima:
        - WA: Call Fonnte API
        - Email: Call Resend API
        - Dashboard: Store di notifikasi DB
                   │
                   ▼
        Retry jika gagal (max 3x)
        Log hasil per penerima
```
