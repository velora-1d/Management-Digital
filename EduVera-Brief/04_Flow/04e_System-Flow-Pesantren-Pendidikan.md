# FLOW PESANTREN — DASHBOARD PENDIDIKAN

---

## 1. DATA PESANTREN

### 1.1 Data Santri

#### User Flow
```
[Admin / Mudir]
      │
      ▼
Menu: Pendidikan → Data Pesantren → Data Santri
      │
      ▼
Lihat daftar santri (filter: aktif / nonaktif / arsip)
      │
      ├── [Tambah Santri]
      │       │
      │       ▼
      │   Input wajib:
      │   ├── Nama Lengkap
      │   ├── NIK / ID Santri (opsional)
      │   ├── Jenis Kelamin
      │   ├── Tanggal Lahir
      │   ├── Marhalah awal
      │   └── Status: Mukim / Non-Mukim
      │       │
      │       ▼
      │   Sistem generate santri_id (unik per tenant)
      │       │
      │       ▼
      │   [Lanjut isi sub-data]
      │   ├── Profil (Alamat, Kontak darurat, Foto)
      │   ├── Data Wali (Ayah, Ibu, Wali opsional)
      │   ├── Data Kesehatan (Gol. darah, Alergi, Riwayat penyakit)
      │   └── Status Mukim → jika Mukim: trigger penempatan asrama
      │
      ├── [Edit Santri]
      │       │
      │       ▼
      │   Update data → histori perubahan tersimpan (audit trail)
      │
      ├── [Lihat Detail Santri]
      │       │
      │       ▼
      │   Tampilkan semua tab:
      │   ├── Profil Santri
      │   ├── Data Wali
      │   ├── Data Kesehatan
      │   ├── Riwayat Kepesantrenan
      │   │   ├── Riwayat asrama
      │   │   ├── Riwayat pelanggaran
      │   │   └── Riwayat marhalah
      │   └── Riwayat Rapor
      │
      └── [Nonaktifkan / Arsip Santri]
              │
              ▼
          Input alasan: Lulus / Pindah / Keluar
              │
              ▼
          Status → Arsip (data tidak dihapus)
```

#### System Flow
```
POST /api/santri
      │
      ▼
Validasi:
├── Nama wajib
├── Jenis kelamin valid (L/P)
└── Marhalah ada di master marhalah tenant
      │
      ▼
Generate santri_id (UUID)
      │
      ▼
Insert: santri (tenant_id, santri_id, nama, jenis_kelamin,
                marhalah_id, status_mukim, status=aktif)
      │
      ▼
Jika status_mukim=TRUE → flag "butuh penempatan asrama"
      │
      ▼
Catat audit_trail
```

---

### 1.2 Data Wali Santri

#### User Flow
```
[Admin]
      │
      ▼
Menu: Data Santri → pilih santri → tab Wali
      │
      ▼
├── [Tambah Wali]
│       │
│       ▼
│   Input:
│   ├── Nama wali
│   ├── Hubungan: Ayah / Ibu / Wali Lain
│   ├── No. WhatsApp (untuk notifikasi)
│   ├── Email
│   └── Tandai sebagai wali utama (hanya 1)
│       │
│       ▼
│   Simpan → relasi santri_id → wali_id
│       │
│       ▼
│   Sistem buat akun portal wali (role: wali_santri)
│       │
│       ▼
│   Kirim kredensial via WA / Email ke wali
│
└── [Hapus Wali]
        │
        ▼
    Cek: minimal 1 wali harus ada
    └── Jika wali utama → wajib set wali utama baru dulu
```

---

### 1.3 Marhalah & Tingkatan

#### User Flow
```
[Admin / Mudir]
      │
      ▼
Menu: Data Pesantren → Marhalah & Tingkatan
      │
      ▼
Default marhalah tersedia:
├── I'dadiyah (Pra)
├── Ula
├── Wustha
└── Ulya
      │
      ├── [Tambah Marhalah Custom]
      │       │
      │       ▼
      │   Input: Nama, Urutan, Deskripsi
      │       │
      │       ▼
      │   Simpan → mapping ke tahun ajaran / hijriah
      │
      └── [Mapping Santri ke Marhalah]
              │
              ▼
          Per tahun ajaran baru:
          ├── Konfirmasi kenaikan marhalah per santri
          ├── Atau tetap di marhalah yang sama
          └── Simpan mapping baru
```

---

## 2. ASRAMA

### 2.1 Data Asrama & Kamar

#### User Flow
```
[Admin / Musyrif]
      │
      ▼
Menu: Pendidikan → Asrama → Data Asrama
      │
      ├── [Tambah Asrama]
      │       │
      │       ▼
      │   Input: Nama, Jenis (Putra/Putri/Campuran), Status
      │       │
      │       ▼
      │   Simpan
      │
      ├── [Tambah Kamar]
      │       │
      │       ▼
      │   Pilih asrama → klik [Tambah Kamar]
      │       │
      │       ▼
      │   Input: Nomor/Nama Kamar, Kapasitas Maksimal
      │       │
      │       ▼
      │   Simpan → status auto: Kosong
      │
      └── [Lihat Status Kamar]
              ├── Kosong (hijau)
              ├── Terisi (kuning)
              ├── Penuh (merah)
              └── Nonaktif (abu)
```

---

### 2.2 Penempatan Santri

#### User Flow
```
[Admin / Musyrif]
      │
      ▼
Menu: Asrama → Penempatan Santri
      │
      ▼
[Tambah Penempatan]
      │
      ▼
Pilih Santri (filter: mukim, belum ditempatkan)
      │
      ▼
Sistem auto-cek:
├── Jenis kelamin santri
└── Jenis asrama yang tersedia
      │
      ▼
Pilih Asrama (sesuai jenis kelamin)
      │
      ▼
Pilih Kamar (tampilkan kapasitas tersisa)
      │
      ▼
Validasi:
├── Kapasitas tidak melebihi batas
└── Jenis kelamin sesuai jenis asrama
      │
      ▼
Simpan
      │
      ▼
Efek sistem:
├── Status santri → Mukim Aktif
├── Status kamar ter-update (Terisi/Penuh)
└── Riwayat penempatan tercatat
```

#### System Flow
```
POST /api/asrama/penempatan
      │
      ▼
Validasi:
├── santri.status_mukim = TRUE
├── kamar.kapasitas_terisi < kamar.kapasitas_maks
└── jenis_kelamin match jenis_asrama
      │
      ▼
Insert: penempatan (santri_id, asrama_id, kamar_id, tgl_masuk)
      │
      ▼
Update: kamar.kapasitas_terisi += 1
      │
      ▼
Update: kamar.status (Terisi/Penuh berdasarkan kapasitas)
      │
      ▼
Catat audit_trail
```

---

### 2.3 Mutasi Kamar

#### User Flow
```
[Musyrif / Admin]
      │
      ▼
Menu: Asrama → Mutasi Kamar
      │
      ▼
Pilih Santri (yang sudah ada penempatan)
      │
      ▼
Pilih Kamar Baru
      │
      ▼
Pilih Alasan Mutasi:
├── Penyesuaian
├── Pelanggaran
├── Kesehatan
├── Permintaan Musyrif
└── Lainnya (custom)
      │
      ▼
Konfirmasi
      │
      ▼
Sistem:
├── Tutup penempatan lama (tgl_keluar = hari ini)
├── Buat penempatan baru
├── Update status kamar lama & baru
└── Riwayat mutasi tercatat
```

---

### 2.4 Absensi Asrama

#### User Flow
```
[Musyrif]
      │
      ▼
Menu: Asrama → Absensi Asrama
      │
      ▼
Pilih sesi: Pagi / Malam
      │
      ▼
Sistem load santri per kamar yang dikelola musyrif
      │
      ▼
Input status per santri:
├── Hadir ✓
├── Izin (auto dari perizinan aktif)
└── Tidak Hadir ✗
      │
      ▼
Simpan absensi
      │
      ▼
Rule otomatis:
├── Santri izin resmi → auto status Izin
└── Santri pelanggaran berat → flag notifikasi
```

#### System Flow
```
POST /api/asrama/absensi
      │
      ▼
Validasi: sesi belum diisi hari ini (tidak duplikat)
      │
      ▼
Cek perizinan aktif per santri
(santri dengan izin aktif → override status jadi Izin)
      │
      ▼
Insert: absensi_asrama (santri_id, tanggal, sesi, status)
      │
      ▼
Jika Tidak Hadir tanpa izin → flag di kepesantrenan
      │
      ▼
Catat audit_trail
```

---

## 3. KEPESANTRENAN

### 3.1 Tata Tertib

#### User Flow
```
[Admin / Mudir]
      │
      ▼
Menu: Kepesantrenan → Tata Tertib
      │
      ▼
├── [Tambah Aturan]
│       │
│       ▼
│   Input:
│   ├── Judul aturan
│   ├── Deskripsi
│   ├── Jenis: Umum / Asrama / Ibadah
│   └── Berlaku untuk: Semua / Marhalah tertentu
│       │
│       ▼
│   Simpan → aturan aktif
│
├── [Edit Aturan] → update (jika belum dipakai pelanggaran)
│
└── [Nonaktifkan Aturan]
        │
        ▼
    Cek: apakah sudah dipakai di riwayat pelanggaran?
    ├── SUDAH → nonaktif saja (tidak hapus)
    └── BELUM → bisa hapus
```

---

### 3.2 Pelanggaran

#### User Flow
```
[Musyrif / Admin]
      │
      ▼
Menu: Kepesantrenan → Pelanggaran
      │
      ▼
├── [Master Jenis Pelanggaran] (Admin)
│       │
│       ▼
│   Tambah/edit jenis:
│   ├── Nama pelanggaran
│   ├── Kategori: Umum / Asrama / Ibadah
│   ├── Level: Ringan / Sedang / Berat
│   ├── Poin (integer positif)
│   └── Rekomendasi sanksi default
│
├── [Input Pelanggaran Santri]
│       │
│       ▼
│   Pilih Santri
│       │
│       ▼
│   Pilih Jenis Pelanggaran
│       │
│       ▼
│   Input: Tanggal, Keterangan tambahan
│       │
│       ▼
│   Sistem auto:
│   ├── Assign poin sesuai jenis
│   ├── Update total akumulasi poin santri
│   └── Cek threshold → rekomendasikan sanksi
│       │
│       ▼
│   Simpan → riwayat pelanggaran tercatat
│
└── [Riwayat Pelanggaran]
        │
        ▼
    Filter: per santri / per level / per periode
        │
        ▼
    Tampilkan:
    ├── Tanggal, Jenis, Level, Poin
    ├── Musyrif penanggung jawab
    └── Status: Aktif / Diselesaikan
```

#### System Flow
```
POST /api/kepesantrenan/pelanggaran
      │
      ▼
Validasi:
├── santri_id valid dan aktif
└── jenis_pelanggaran_id valid
      │
      ▼
Insert: riwayat_pelanggaran
      │
      ▼
Update: santri.total_poin_pelanggaran += poin
      │
      ▼
Cek threshold poin:
├── Level 1 (misal >10 poin) → rekomendasikan teguran tertulis
├── Level 2 (misal >25 poin) → rekomendasikan pembinaan
└── Level 3 (misal >50 poin) → rekomendasikan pemanggilan wali
      │
      ▼
Jika BERAT → Trigger notifikasi ke Admin & Mudir
      │
      ▼
Catat audit_trail
```

---

### 3.3 Sanksi & Pembinaan

#### User Flow
```
[Musyrif / Admin / Mudir]
      │
      ▼
Menu: Kepesantrenan → Sanksi & Pembinaan
      │
      ▼
[Berikan Sanksi]
      │
      ▼
Pilih santri (dari riwayat pelanggaran)
      │
      ▼
Pilih jenis sanksi:
├── Teguran (Lisan / Tertulis)
├── Hafalan Tambahan (input jumlah ayat/juz + deadline)
├── Kerja Sosial (input jenis tugas + durasi)
└── Pembinaan Khusus (Konseling / Pemanggilan wali / Pembinaan pengasuh)
      │
      ▼
Input detail sanksi & durasi
      │
      ▼
Simpan → status: Aktif
      │
      ▼
[Monitor Progress Sanksi]
├── Status: Aktif / Dalam Proses / Selesai / Gagal
└── Update status setelah selesai
```

---

### 3.4 Perizinan Santri

#### User Flow
```
[Santri / Musyrif / Wali — mengajukan izin]
      │
      ▼
Menu: Kepesantrenan → Perizinan
      │
      ▼
[Ajukan Izin]
      │
      ▼
Pilih jenis: Izin Keluar / Izin Pulang / Izin Sakit
      │
      ▼
Input:
├── Tanggal mulai
├── Tanggal kembali
└── Alasan / keterangan
      │
      ▼
Submit → Status: Pending

─────────────────────────────────────
[Musyrif / Admin — Approval]
      │
      ▼
Notifikasi izin masuk
      │
      ▼
Review pengajuan
      │
      ▼
├── [Setujui] → Status: Disetujui
│               └── Absensi asrama auto: Izin
│
└── [Tolak] → Status: Ditolak
              └── Notifikasi ke santri/wali
```

#### System Flow
```
POST /api/kepesantrenan/izin
      │
      ▼
Insert: perizinan (santri_id, jenis, tgl_mulai, tgl_kembali, status=PENDING)
      │
      ▼
Trigger notifikasi ke Musyrif/Admin (WA + dashboard)

─────────────────────────────────────
PATCH /api/kepesantrenan/izin/:id/approve
      │
      ▼
Update: perizinan.status = DISETUJUI
      │
      ▼
Insert: exception di absensi_asrama
(tanggal range izin → auto Izin)
      │
      ▼
Notifikasi ke wali santri (WA)
      │
      ▼
Catat audit_trail
```

---

### 3.5 Catatan Musyrif

#### User Flow
```
[Musyrif]
      │
      ▼
Menu: Kepesantrenan → Catatan Musyrif
      │
      ▼
├── [Catatan Harian]
│       │
│       ▼
│   Pilih santri (dari asrama yang dikelola)
│       │
│       ▼
│   Input tanggal (default hari ini)
│       │
│       ▼
│   Tulis catatan:
│   ├── Perilaku hari ini
│   ├── Kedisiplinan
│   ├── Interaksi dengan santri lain
│   └── Catatan khusus
│       │
│       ▼
│   Simpan
│
└── [Evaluasi Santri] (Bulanan / Semester)
        │
        ▼
    Pilih santri & periode
        │
        ▼
    Input evaluasi:
    ├── Sikap umum
    ├── Kedisiplinan
    ├── Kepatuhan aturan
    └── Rekomendasi pembinaan
        │
        ▼
    Simpan → terintegrasi ke E-Rapor Pesantren
```

---

## 4. TAHFIDZ

### 4.1 Target Hafalan

#### User Flow
```
[Admin / Mudir — Setup awal tahun]
      │
      ▼
Menu: Pendidikan → Tahfidz → Target Hafalan
      │
      ▼
├── [Target Per Marhalah]
│       │
│       ▼
│   Pilih marhalah
│       │
│       ▼
│   Input target:
│   ├── Juz / Surah / Ayat
│   └── Periode: Per semester / Per tahun
│       │
│       ▼
│   Simpan → berlaku sebagai default
│
├── [Target Per Santri] (Override khusus)
│       │
│       ▼
│   Pilih santri
│       │
│       ▼
│   Input target override (akselerasi/remedial)
│       │
│       ▼
│   Input alasan override
│       │
│       ▼
│   Simpan (tidak menghapus target marhalah)
│
└── [Lihat Target Tahunan]
        └── KPI tahfidz per marhalah (read-only)
```

---

### 4.2 Setoran Hafalan

#### User Flow
```
[Ustadz Tahfidz]
      │
      ▼
Menu: Tahfidz → Setoran Hafalan
      │
      ▼
Pilih tanggal (default: hari ini)
      │
      ▼
Load daftar santri binaan (per marhalah ustadz)
      │
      ▼
Per santri → [Input Setoran]
      │
      ▼
Input:
├── Jenis: Hafalan Baru / Murajaah
├── Materi: Nama Surah, Ayat mulai - Ayat akhir
└── Penilaian awal: Lancar / Kurang / Perlu Ulang
      │
      ▼
Simpan
      │
      ▼
Sistem auto:
├── Update log setoran harian
├── Hitung progres hafalan santri
└── Update capaian vs target
```

#### System Flow
```
POST /api/tahfidz/setoran
      │
      ▼
Validasi:
├── ustadz_id valid dan diampu santri ini
├── materi (surah, ayat) dalam range Al-Quran yang valid
└── tanggal tidak di masa depan
      │
      ▼
Insert: setoran_hafalan (santri_id, ustadz_id, tanggal, jenis, materi, nilai_awal)
      │
      ▼
Update: progres_hafalan santri
├── Jika Hafalan Baru → tambah ke total hafalan
└── Jika Murajaah → catat ke log murajaah
      │
      ▼
Recalculate: capaian vs target marhalah
      │
      ▼
Catat audit_trail
```

---

### 4.3 Murajaah

#### User Flow
```
[Ustadz Tahfidz]
      │
      ▼
Menu: Tahfidz → Murajaah
      │
      ▼
├── [Setup Jadwal Murajaah]
│       │
│       ▼
│   Pilih marhalah / santri
│       │
│       ▼
│   Input frekuensi: Harian / Pekanan
│       │
│       ▼
│   Pilih metode: Mandiri / Dipimpin Ustadz
│       │
│       ▼
│   Simpan → reminder otomatis terjadwal
│
└── [Input Evaluasi Murajaah]
        │
        ▼
    Pilih santri
        │
        ▼
    Input materi murajaah hari ini
        │
        ▼
    Input penilaian:
    ├── Lancar
    ├── Kurang Lancar
    └── Perlu Penguatan
        │
        ▼
    Simpan → masuk ke komponen nilai konsistensi
```

---

### 4.4 Penilaian Tahfidz

#### User Flow
```
[Ustadz Tahfidz]
      │
      ▼
Menu: Tahfidz → Penilaian Tahfidz
      │
      ▼
Pilih santri & semester aktif
      │
      ▼
Input komponen penilaian:
├── Kelancaran (Makharij, kelancaran ayat): angka / predikat
├── Tajwid (hukum bacaan, panjang pendek): angka / predikat
└── Konsistensi (rutin setor, disiplin murajaah): angka / predikat
      │
      ▼
Input narasi (WAJIB)
      │
      ▼
Simpan → status: Draft
      │
      ▼
Admin/Mudir validasi → status: Valid
      │
      ▼
Nilai siap ditarik ke E-Rapor
```

---

### 4.5 Laporan Tahfidz

#### User Flow
```
[Mudir / Pengasuh / Admin]
      │
      ▼
Menu: Tahfidz → Laporan Tahfidz
      │
      ▼
Pilih jenis laporan:
├── Per Santri: target vs capaian, total hafalan, catatan
├── Per Marhalah: rata-rata capaian, distribusi, santri unggulan
└── Per Ustadz: jumlah santri binaan, progres setoran
      │
      ▼
Pilih periode
      │
      ▼
Generate laporan
      │
      ▼
Export PDF / Excel
```

---

## 5. DINIYAH & KITAB

### 5.1 Kitab & Materi

#### User Flow
```
[Admin / Ustadz Diniyah]
      │
      ▼
Menu: Pendidikan → Diniyah & Kitab → Kitab & Materi
      │
      ▼
├── [Tambah Kitab Kuning]
│       │
│       ▼
│   Input:
│   ├── Nama kitab
│   ├── Pengarang
│   ├── Bidang: Fiqih / Aqidah / Akhlak / Tafsir / Hadits / Nahwu
│   ├── Tingkat kesulitan
│   └── Marhalah target
│       │
│       ▼
│   Simpan → bisa dipakai lintas marhalah
│
├── [Tambah Kitab Modern] → Input nama, kurikulum, referensi
│
└── [Tambah Materi Tambahan] → Judul, deskripsi, terkait kitab
```

---

### 5.2 Halaqah

#### User Flow
```
[Admin / Ustadz Diniyah]
      │
      ▼
Menu: Diniyah & Kitab → Halaqah
      │
      ▼
├── [Buat Halaqah Kitab]
│       │
│       ▼
│   Input:
│   ├── Nama halaqah
│   ├── Kitab yang dipelajari
│   ├── Marhalah
│   ├── Jadwal (hari & jam)
│   └── Kapasitas santri
│       │
│       ▼
│   Simpan
│       │
│       ▼
│   [Assign Santri ke Halaqah]
│   └── Pilih santri dari marhalah terkait
│
│   [Assign Ustadz ke Halaqah]
│   └── Pilih ustadz diniyah
│
├── [Halaqah Akhlak]
│       └── Flow sama, khusus pembinaan karakter
│
└── [Lihat Semua Halaqah]
        └── Filter: per marhalah / per kitab / per ustadz
```

---

### 5.3 Absensi Diniyah

#### User Flow
```
[Ustadz Diniyah]
      │
      ▼
Menu: Diniyah & Kitab → Absensi Diniyah
      │
      ▼
Pilih halaqah (yang diampu)
      │
      ▼
Pilih tanggal pertemuan
      │
      ▼
Load daftar santri halaqah
      │
      ▼
Input status per santri:
├── Hadir ✓
├── Izin
└── Alpha
      │
      ▼
Input catatan (opsional per santri)
      │
      ▼
Simpan → terhitung ke nilai kehadiran
      │
      ▼
[Absensi Ustadz] (dicatat oleh Admin/Sekretaris)
├── Input status ustadz per pertemuan
└── Terhitung ke rekap SDM & honor
```

---

### 5.4 Penilaian Diniyah

#### User Flow
```
[Ustadz Diniyah]
      │
      ▼
Menu: Diniyah & Kitab → Penilaian
      │
      ▼
Pilih santri & halaqah & semester
      │
      ▼
Input komponen:
├── Pemahaman:
│   ├── Penguasaan materi kitab
│   └── Kemampuan membaca kitab
├── Akhlak:
│   ├── Adab kepada guru
│   └── Sikap di halaqah
└── Kehadiran: (otomatis dari absensi)
      │
      ▼
Pilih format nilai:
├── Angka (opsional)
└── Predikat: Mumtaz / Jayyid Jiddan / Jayyid / Maqbul
      │
      ▼
Input narasi (WAJIB)
      │
      ▼
Simpan → status: Draft
      │
      ▼
RULE: Admin tidak boleh edit nilai ustadz
      │
      ▼
Admin/Mudir validasi → status: Valid
```

---

## 6. E-RAPOR PESANTREN

### 6.1 Setup Kurikulum & Struktur

#### User Flow
```
[Admin — Setup awal / per tahun ajaran]
      │
      ▼
Menu: E-Rapor Pesantren → Referensi Kurikulum
      │
      ▼
Aktifkan komponen:
├── Kurikulum Tahfidz
├── Kurikulum Diniyah / Kitab
├── Kurikulum Kepesantrenan
└── Kurikulum Custom (tambah sendiri)
      │
      ▼
Setup Struktur Rapor:
├── Pilih Marhalah aktif
├── Pilih Semester (Hijriah / Masehi / Custom)
└── Pilih Tahun Ajaran
      │
      ▼
Setup Skema Nilai:
├── Angka
├── Predikat (mapping angka → predikat)
├── Narasi
└── Status Lulus Marhalah
      │
      ▼
Simpan → TERKUNCI saat semester berjalan
```

---

### 6.2 Input Nilai E-Rapor

#### User Flow
```
[Ustadz Tahfidz → input nilai tahfidz]
[Ustadz Kitab → input nilai diniyah]
[Musyrif → input kepesantrenan]
      │
      ▼
Menu: E-Rapor → Input Nilai
      │
      ▼
Sistem filter otomatis:
├── Santri binaan saja
├── Marhalah aktif
└── Semester aktif
      │
      ▼
Input nilai per santri per komponen
      │
      ▼
Simpan → status: DRAFT
      │
      ▼
Admin/Mudir validasi → status: VALID
      │
      ▼
RULE: nilai hanya bisa diinput oleh role yang sesuai
```

---

### 6.3 Generate E-Rapor

#### User Flow
```
[Admin / Mudir]
      │
      ▼
Menu: E-Rapor → Generate Rapor
      │
      ▼
Cek kelengkapan:
├── Nilai Tahfidz: VALID ✓
├── Nilai Diniyah: VALID ✓
├── Catatan Musyrif: ada ✓
└── Catatan Pengasuh: ada ✓
      │
      ▼
Jika ada yang belum lengkap → STOP + tampilkan warning
      │
      ▼
Pilih mode:
├── Per Santri (pilih santri tertentu)
└── Bulk Semua Santri (background job)
      │
      ▼
[Preview Rapor] → tampilkan preview PDF
      │
      ▼
[Simpan Draft] → wali belum bisa akses
      │
      ▼
[Publish] → FINAL
      │
      ▼
Efek publish:
├── Semua nilai TERKUNCI (tidak bisa diedit)
├── Akses wali santri dibuka
├── Notifikasi WA + Email ke wali: "Rapor sudah bisa dilihat"
└── Rapor otomatis diarsip
```

#### System Flow (Bulk Generate)
```
[Admin klik Bulk Generate]
      │
      ▼
Validasi semua santri: nilai lengkap?
      │
      ▼
Trigger Inngest Job: generate_rapor_bulk
      │
      ▼
Loop per santri:
├── Ambil semua nilai valid
├── Ambil catatan musyrif + pengasuh
├── Render PDF (Puppeteer)
│   ├── Inject: logo pesantren, nama KS/Mudir
│   ├── Inject: QR Code (link verifikasi)
│   └── Inject: tanda tangan digital
├── Upload PDF ke Cloudflare R2
└── Simpan URL ke table rapor
      │
      ▼
Update status rapor → PUBLISHED
      │
      ▼
Trigger notifikasi massal ke wali santri
      │
      ▼
Log job selesai
```

---

### 6.4 Arsip Rapor

#### User Flow
```
[Admin / Mudir / Wali Santri]
      │
      ▼
Menu: E-Rapor → Arsip Rapor
      │
      ▼
Filter:
├── Per santri
├── Per marhalah
└── Per semester / tahun
      │
      ▼
Klik rapor → tampilkan preview PDF
      │
      ▼
[Download PDF] → unduh dari Cloudflare R2
      │
      ▼
RULE:
├── Arsip read-only (tidak bisa diedit)
├── Tidak bisa dihapus
└── Bisa dicetak ulang kapan saja
```

---

## 7. KALENDER HIJRIAH

### User Flow
```
[Admin / Sekretaris]
      │
      ▼
Menu: Pendidikan → Kalender Hijriah
      │
      ▼
├── [Set Tahun Hijriah Aktif]
│       │
│       ▼
│   Input tahun hijriah
│       │
│       ▼
│   Simpan → berlaku sebagai referensi semua modul
│
├── [Tambah Kegiatan]
│       │
│       ▼
│   Input:
│   ├── Nama kegiatan: Pengajian / Dauroh / Haflah / Custom
│   ├── Tanggal hijriah
│   ├── Mapping ke tanggal masehi (opsional)
│   ├── Lokasi
│   └── Penanggung jawab
│       │
│       ▼
│   Simpan → muncul di kalender
│
└── [Setup Reminder]
        │
        ▼
    Pilih event
        │
        ▼
    Set reminder: H-7, H-3, H-1
        │
        ▼
    Pilih target: Santri / Ustadz / Wali / Semua
        │
        ▼
    Pilih channel: WA / Email / Dashboard
        │
        ▼
    Inngest scheduled job akan mengirim notifikasi
```
