# MENU SEKOLAH — SEMUA DASHBOARD
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# 📊 DASHBOARD SEKOLAH (KS / Admin)

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Siswa Aktif | Angka total + breakdown per jenjang |
| 2 | Total Guru Aktif | Angka total + breakdown PNS/PPPK/Honorer |
| 3 | Total Staf Aktif | Angka total + per unit kerja |
| 4 | Total Kelas Aktif | Angka total + per jenjang |
| 5 | Absensi Siswa Hari Ini | % Hadir / Sakit / Izin / Alpha |
| 6 | Absensi Pegawai Hari Ini | % Hadir / Sakit / Izin / Alpha |
| 7 | Tagihan SPP Bulan Ini | Total tagihan, sudah lunas, belum bayar |
| 8 | Saldo Kas Sekolah | Saldo saat ini |
| 9 | Status Rapor | Berapa kelas sudah publish / belum |
| 10 | Siswa Perlu Perhatian | Siswa alpha tinggi + tunggakan SPP |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Tren Absensi Siswa | Line Chart | 30 hari: Hadir vs Alpha |
| 2 | Distribusi Siswa per Jenjang | Donut Chart | PAUD/SD/SMP/SMA/SMK |
| 3 | Pemasukan vs Pengeluaran | Bar Chart | 6 bulan terakhir |
| 4 | Status SPP Bulan Ini | Donut Chart | Lunas/Sebagian/Belum |
| 5 | Rekap Absensi Pegawai | Bar Chart | Hadir/Sakit/Izin/Alpha bulan ini |

---

# 📚 DASHBOARD PENDIDIKAN

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Siswa per Jenjang | Breakdown aktif per jenjang |
| 2 | Total Kelas per Jenjang | Jumlah kelas aktif |
| 3 | Guru Belum Input Nilai | Berapa guru nilainya masih kosong |
| 4 | Rapor Selesai | Berapa kelas sudah publish |
| 5 | Rata-rata Kehadiran Siswa | % bulan ini |
| 6 | Siswa Alpha Terbanyak | Top 5 siswa alpha tertinggi |
| 7 | Ekstrakurikuler Aktif | Total ekskul + total peserta |
| 8 | Kasus BK Bulan Ini | Total kasus + status tindak lanjut |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Progres Input Nilai | Progress Bar per Kelas | % guru sudah input |
| 2 | Rata-rata Nilai per Mapel | Bar Chart Horizontal | Nilai rata-rata |
| 3 | Tren Absensi Siswa | Line Chart | 30 hari Hadir vs Alpha |
| 4 | Distribusi Nilai per Jenjang | Bar Chart | Rendah/Sedang/Tinggi |
| 5 | Kehadiran Ekskul | Bar Chart | Per ekskul bulan ini |
| 6 | Kasus BK per Kategori | Pie Chart | Akademik/Perilaku/Sosial |

---

## DATA AKADEMIK

### Data Siswa
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Siswa | List semua siswa + filter status/jenjang | View, Search, Filter, Export |
| 2 | Tambah Siswa | Form input data siswa baru | Input, Save |
| 3 | Detail Siswa | Profil, wali, kesehatan, riwayat | View, Edit per tab |
| 4 | Import Bulk | Upload Excel template | Download template, Upload, Preview, Import |
| 5 | Nonaktifkan/Arsip | Lulus/Pindah/Keluar | Update status + alasan |

### Data Wali Siswa
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Wali | List per siswa | View |
| 2 | Tambah Wali | Form input wali | Input, Assign ke siswa |
| 3 | Edit Wali | Update data wali | Edit, Save |
| 4 | Portal Wali | Kirim kredensial login | Generate, Kirim WA/Email |

### Data Guru
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Guru | List + filter status/jenis | View, Search, Filter, Export |
| 2 | Tambah Guru | Form input + auto buat akun | Input, Save, Kirim kredensial |
| 3 | Detail Guru | Profil + riwayat mengajar | View, Edit |
| 4 | Nonaktifkan | Update status | Nonaktif |

### Data Staf
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Staf | List + filter unit kerja | View, Search, Filter |
| 2 | Tambah Staf | Form input + auto buat akun | Input, Save |
| 3 | Edit Staf | Update data | Edit, Save |
| 4 | Nonaktifkan | Update status | Nonaktif |

### Mata Pelajaran
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Mapel | List + filter jenjang/jenis | View, Filter |
| 2 | Tambah Mapel | Form + assign ke jenjang & tingkat | Input, Save |
| 3 | Edit Mapel | Update nama/jenis/assign | Edit, Save |
| 4 | Arsip Mapel | Nonaktifkan mapel | Arsip |

### Jenjang & Tingkat
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Jenjang | List semua jenjang sistem | View |
| 2 | Aktifkan Jenjang | Toggle jenjang yang dimiliki | Toggle ON/OFF |
| 3 | Jurusan SMK | List jurusan + kompetensi | Tambah, Edit |

### Mutasi Siswa
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Pindah Masuk | Form siswa masuk dari sekolah lain | Input data, Upload dokumen |
| 2 | Pindah Keluar | Form siswa keluar resmi | Input alasan, Update status |
| 3 | Riwayat Mutasi | Histori semua mutasi | View, Filter, Export |

### Kenaikan Kelas
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Proses Kenaikan | List siswa + status naik/tinggal | Review per siswa |
| 2 | Set Tinggal Kelas | Tandai siswa tidak naik | Input alasan |
| 3 | Konfirmasi Massal | Finalisasi semua kenaikan | Preview, Konfirmasi |
| 4 | Riwayat Kenaikan | Histori per tahun ajaran | View |

---

## KELAS & PEMBELAJARAN

### Daftar Kelas
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | List Kelas | Per jenjang + tahun ajaran | View, Filter |
| 2 | Buat Kelas | Form buat kelas baru | Input, Save |
| 3 | Assign Wali Kelas | Pilih guru sebagai wali | Assign, Save |
| 4 | Daftar Siswa Kelas | Siswa yang ada di kelas | View, Export |

### Rombel
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | List Rombel | Per kelas | View |
| 2 | Buat Rombel | Input nama rombel | Input, Save |
| 3 | Assign Siswa | Pilih siswa → rombel | Assign massal |

### Penugasan Guru
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | List Penugasan | Guru → Mapel → Kelas | View, Filter |
| 2 | Assign Guru | Pilih guru + mapel + kelas | Assign, Save |
| 3 | Hapus Penugasan | Cabut assignment | Hapus |

### Jadwal Pembelajaran
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Lihat Jadwal | Per kelas / per guru | View, Filter |
| 2 | Buat Jadwal | Input per hari per jam | Input, Validasi bentrok, Save |
| 3 | Jadwal Produktif SMK | Teori + Praktik + Teaching Factory | Input multi-jam |
| 4 | Export Jadwal | Cetak per kelas | Export PDF |

### Absensi Siswa
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Input Absensi | Per kelas per tanggal | Input massal, Save |
| 2 | Rekap Absensi | Per siswa / per kelas / periode | View, Export |
| 3 | Filter Alpha | Siswa dengan alpha tinggi | View, Flag |

---

## KURIKULUM

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Setup Kurikulum | K13/Merdeka/Kemenag/Custom per jenjang | Set aktif per tahun ajaran |
| 2 | Komponen Penilaian | Input bobot per mapel | Input, Save |
| 3 | Template Rapor | Pilih + kustomisasi template | Edit, Preview, Save |

---

## NILAI & E-RAPOR

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Input Nilai | Per mapel per kelas per komponen | Input inline, Auto-hitung, Save |
| 2 | Input Nilai PAUD/TK | Narasi + observasi per aspek | Input narasi, Upload foto |
| 3 | Rekap Nilai | Per siswa / kelas / jenjang | View, Export |
| 4 | Catatan Wali Kelas | Narasi per siswa | Input, Draft, Kunci |
| 5 | Generate Rapor | Cek kelengkapan → Preview → Publish | Single/Bulk, Preview, Publish |
| 6 | Arsip Rapor | Filter + download | View, Download PDF |

---

## EKSTRAKURIKULER

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Ekskul | List + status aktif | View, Tambah, Edit, Nonaktif |
| 2 | Pembina & Anggota | Assign pembina + siswa | Assign, Remove |
| 3 | Absensi Ekskul | Input per pertemuan | Input massal, Save |
| 4 | Nilai Ekskul | Input nilai + predikat | Input, Save → Masuk rapor |

---

## BK — BIMBINGAN KONSELING

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Catatan Konseling | Input per siswa + jenis masalah | Input, Save |
| 2 | Laporan Kasus | List kasus + status tindak lanjut | View, Update status |
| 3 | Riwayat BK | Histori per siswa | View (terbatas per role) |

---

## KALENDER AKADEMIK

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Setup Kalender | Tahun ajaran, semester, periode | Input, Save |
| 2 | Tambah Event | Ujian, libur, kegiatan | Input, Assign jenjang |
| 3 | Kalender PAUD/TK | Tema bulanan + kegiatan | Input per bulan |
| 4 | Reminder | H-7/H-3/H-1 per event | Set, Pilih target & channel |

---

# 💰 DASHBOARD BENDAHARA SEKOLAH

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Saldo Kas Saat Ini | Angka realtime |
| 2 | Total Pemasukan Bulan Ini | SPP + BOS + Donasi |
| 3 | Total Pengeluaran Bulan Ini | Gaji + Operasional + dll |
| 4 | Surplus / Defisit Bulan Ini | Selisih otomatis |
| 5 | Total Tagihan SPP Bulan Ini | Nominal total |
| 6 | SPP Sudah Lunas | Nominal + jumlah siswa |
| 7 | SPP Belum Bayar | Nominal tunggakan + jumlah siswa |
| 8 | Realisasi Anggaran | % terpakai dari RAPBS |
| 9 | Anggaran Hampir Habis | Kategori < 10% sisa |
| 10 | Transaksi Hari Ini | Jumlah transaksi masuk & keluar |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Pemasukan vs Pengeluaran | Bar Chart | 12 bulan terakhir |
| 2 | Tren Saldo Kas | Line Chart | Per bulan tahun ini |
| 3 | Komposisi Pemasukan | Donut Chart | SPP/BOS/Donasi/Lainnya |
| 4 | Komposisi Pengeluaran | Donut Chart | Gaji/Operasional/Sarpras/Kegiatan |
| 5 | Status SPP Bulan Ini | Donut Chart | Lunas/Sebagian/Belum |
| 6 | Realisasi vs Anggaran | Bar Chart Horizontal | % per kategori RAPBS |
| 7 | Tunggakan SPP per Kelas | Bar Chart | Nominal per kelas |

---

## MASTER KEUANGAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | COA / Akun | List + filter tipe | Tambah, Edit, Nonaktif |
| 2 | Kategori Pemasukan | Default + custom | Tambah, Edit |
| 3 | Kategori Pengeluaran | Default + custom | Tambah, Edit |

## SPP & TAGIHAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Generate Tagihan | Pilih periode + jenjang | Preview, Generate, Notif WA |
| 2 | Status Pembayaran | Filter lunas/sebagian/belum | View, Filter, Export |
| 3 | Konfirmasi Pembayaran | Input nominal + metode + bukti | Konfirmasi, Update status |
| 4 | Riwayat Pembayaran | Per siswa / per periode | View, Export |

## PEMASUKAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Dana BOS | Catat penerimaan + triwulan | Input, Save |
| 2 | Donasi & Lainnya | Catat donasi + kategori | Input, Save |

## PENGELUARAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Gaji (dari SDM) | Review slip gaji SDM | Setujui & Posting |
| 2 | Operasional | Input + upload bukti | Input, Save |
| 3 | Sarpras | Input + upload bukti | Input, Save |
| 4 | Kegiatan | Input + upload bukti | Input, Save |

## ANGGARAN (RAPBS)

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Buat Anggaran | Per tahun ajaran + per kategori | Input, Save |
| 2 | Realisasi Anggaran | Anggaran vs realisasi | View, Export |

## LAPORAN KEUANGAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Laporan Kas | Per periode | Generate, Export PDF/Excel |
| 2 | Laporan Laba Rugi | Pendapatan vs beban | Generate, Export |
| 3 | Laporan Anggaran | RAPBS vs realisasi vs selisih | Generate, Export |
| 4 | Audit Trail | Filter user/tanggal/aksi | View, Filter, Export |

---

# 🗂️ DASHBOARD TU (TATA USAHA)

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Pegawai Aktif | Guru + Staf |
| 2 | Absensi Pegawai Hari Ini | Hadir/Sakit/Izin/Alpha |
| 3 | Pegawai Alpha Bulan Ini | Jumlah + nama |
| 4 | Status Slip Gaji | Draft / Published bulan ini |
| 5 | Total Gaji Bulan Ini | Nominal total |
| 6 | Surat Masuk Belum Disposisi | Jumlah pending |
| 7 | Inventaris Rusak | Jumlah barang kondisi rusak |
| 8 | Pengumuman Terkirim | Bulan ini + success rate |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Rekap Absensi Pegawai | Grouped Bar Chart | Hadir/Izin/Alpha per minggu |
| 2 | Tren Kehadiran Pegawai | Line Chart | % kehadiran 6 bulan |
| 3 | Distribusi Pegawai | Donut Chart | PNS/PPPK/Honorer |
| 4 | Beban Mengajar per Guru | Bar Chart Horizontal | Jam mengajar per guru |
| 5 | Kondisi Inventaris | Donut Chart | Baik/Rusak Ringan/Rusak Berat/Hilang |
| 6 | Rekap Gaji per Status | Bar Chart | Nominal per kelompok pegawai |

---

## DATA SDM

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Data Guru | List + filter status/jenis | Tambah, Edit, Nonaktif, Export |
| 2 | Data Staf | List + filter unit kerja | Tambah, Edit, Nonaktif, Export |

## STRUKTUR ORGANISASI

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Bagan Organisasi | Visual tree KS → Wakasek → KTU | View |
| 2 | Edit Struktur | Assign jabatan ke pegawai | Edit, Save |
| 3 | Riwayat Jabatan | Histori jabatan per periode | View |
| 4 | Cetak Struktur | Export bagan | Export PDF |

## ABSENSI PEGAWAI

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Absensi Harian | Input status per pegawai | Input massal, Save |
| 2 | Rekap Bulanan | Auto-kalkulasi kehadiran | View, Kunci, Export |

## PENGGAJIAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Komponen Gaji | Setup per status kepegawaian | Input, Save |
| 2 | Generate Slip Gaji | Kalkulasi otomatis → review | Generate, Review, Publish |
| 3 | Riwayat Slip Gaji | Per pegawai per periode | View, Download PDF |

## INVENTARIS & SARPRAS

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Inventaris | List + filter kategori/kondisi | Tambah, Edit, Export |
| 2 | Kondisi Barang | Update kondisi | Update status |
| 3 | Pengadaan | Rencana + realisasi | Input, Terhubung ke keuangan |

## SURAT MENYURAT

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Surat Masuk | Catat + upload + disposisi | Input, Upload, Disposisi |
| 2 | Surat Keluar | Buat + nomor otomatis + arsip | Buat, Nomor auto, Arsip |
| 3 | Surat Keterangan Siswa | Generate surat keterangan | Pilih jenis, Generate PDF |

## PENGUMUMAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Buat Pengumuman | Target + channel + jadwal | Input, Preview, Kirim/Jadwal |
| 2 | Riwayat Pengumuman | List + status kirim | View, Log per penerima |

## LAPORAN TU

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Laporan Akademik | Nilai/PAUD/SMK | Generate, Export |
| 2 | Laporan SDM | Kehadiran/Beban Mengajar/Gaji | Generate, Export |
| 3 | Laporan Keuangan | Read-only dari bendahara | View, Export |

## PENGATURAN SEKOLAH

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Profil Sekolah | Nama, NPSN, Logo, TTD Digital | Edit, Upload |
| 2 | Tahun Ajaran | Buat, Set aktif, Arsip | Buat, Set aktif |
| 3 | Role & User | List user + role | Tambah, Assign, Nonaktif |
| 4 | Modul & Fitur | Toggle per modul | Toggle ON/OFF |
| 5 | Notifikasi | WA Gateway + Email + Template | Config, Test |
