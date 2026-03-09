# MENU PESANTREN — SEMUA DASHBOARD
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# 📊 DASHBOARD PESANTREN (Mudir / Pengasuh / Admin)

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Santri Aktif | Total + Mukim vs Non-Mukim |
| 2 | Total Ustadz & Musyrif | Breakdown per bidang |
| 3 | Total Asrama Aktif | Jumlah asrama + total kapasitas |
| 4 | Absensi Asrama Hari Ini | % Hadir/Izin/Alpha (Pagi & Malam) |
| 5 | Pelanggaran Hari Ini | Jumlah + level terbanyak |
| 6 | Perizinan Pending | Jumlah izin belum diproses |
| 7 | Saldo Kas Pesantren | Saldo saat ini |
| 8 | Tagihan SPP Bulan Ini | Total / Lunas / Belum |
| 9 | Progress Tahfidz Global | % capaian vs target marhalah |
| 10 | Status Rapor | Berapa santri sudah publish |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Tren Kehadiran Asrama | Line Chart | 30 hari Hadir vs Alpha |
| 2 | Distribusi Santri per Marhalah | Donut Chart | I'dadiyah/Ula/Wustha/Ulya |
| 3 | Pelanggaran per Level | Bar Chart | Ringan/Sedang/Berat 6 bulan |
| 4 | Pemasukan vs Pengeluaran | Bar Chart | 6 bulan terakhir |
| 5 | Status SPP Bulan Ini | Donut Chart | Lunas/Sebagian/Belum |
| 6 | Progress Tahfidz per Marhalah | Bar Chart Horizontal | % capaian per marhalah |

---

# 📚 DASHBOARD PENDIDIKAN PESANTREN

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Santri per Marhalah | Breakdown per marhalah |
| 2 | Kamar Penuh / Hampir Penuh | Kamar dengan kapasitas kritis |
| 3 | Santri Belum Ditempatkan | Santri mukim tanpa kamar |
| 4 | Absensi Asrama Hari Ini | Pagi & Malam — Hadir/Izin/Alpha |
| 5 | Pelanggaran Aktif | Santri dengan poin > threshold |
| 6 | Setoran Tahfidz Hari Ini | Total setoran masuk |
| 7 | Santri On-Track Tahfidz | % santri capai target |
| 8 | Nilai Belum Divalidasi | Berapa nilai masih Draft |
| 9 | Santri Sakit Hari Ini | Jumlah santri sedang sakit |
| 10 | Program Kegiatan Upcoming | Event dalam 7 hari ke depan |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Tren Absensi Asrama | Line Chart | 30 hari Hadir vs Alpha (Pagi & Malam) |
| 2 | Kapasitas Asrama | Bar Chart | Terisi vs Kosong per asrama |
| 3 | Pelanggaran per Kategori | Donut Chart | Umum/Asrama/Ibadah |
| 4 | Tren Pelanggaran | Line Chart | 3 bulan terakhir |
| 5 | Progress Setoran Tahfidz | Bar Chart Horizontal | Juz tercapai vs target per marhalah |
| 6 | Distribusi Nilai Diniyah | Bar Chart | Mumtaz/Jayyid Jiddan/Jayyid/Maqbul |
| 7 | Tren Kesehatan Santri | Line Chart | Jumlah kasus per minggu |
| 8 | Status Rapor per Marhalah | Progress Bar | % santri sudah publish |

---

## DATA PESANTREN

### Data Santri
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Santri | List + filter marhalah/status/mukim | View, Search, Filter, Export |
| 2 | Tambah Santri | Form input data santri baru | Input, Save |
| 3 | Detail Santri | Profil, wali, kesehatan, riwayat | View, Edit per tab |
| 4 | Import Bulk | Upload Excel | Download template, Upload, Import |
| 5 | Nonaktifkan/Arsip | Lulus/Pindah/Keluar | Update status + alasan |

### Data Wali Santri
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Wali | List per santri | View |
| 2 | Tambah Wali | Form input + portal wali | Input, Save, Kirim kredensial |
| 3 | Edit Wali | Update data | Edit, Save |

### Marhalah & Tingkatan
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Marhalah | List + urutan | View |
| 2 | Tambah Custom | Input marhalah baru | Input, Save |
| 3 | Mapping Santri | Santri per marhalah | View, Edit |

### Tahun Ajaran Hijriah
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Tahun Ajaran | List + status aktif | View |
| 2 | Buat Tahun Ajaran | Input periode hijriah + masehi | Input, Save |
| 3 | Set Aktif | Aktifkan tahun ajaran | Set aktif |

### Mutasi Santri
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Masuk dari Pesantren Lain | Form + upload dokumen | Input, Upload, Save |
| 2 | Keluar Resmi | Form + alasan + dokumen | Input, Save |
| 3 | Riwayat Mutasi | Histori semua mutasi | View, Filter, Export |

### Kenaikan Marhalah
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Proses Kenaikan | List santri + status naik/tetap | Review per santri |
| 2 | Set Tetap Marhalah | Tandai santri tidak naik | Input alasan |
| 3 | Konfirmasi Massal | Finalisasi semua kenaikan | Preview, Konfirmasi |
| 4 | Riwayat Kenaikan | Histori per tahun hijriah | View |

---

## ASRAMA

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Data Asrama | List + filter jenis/status | Tambah, Edit, Nonaktif |
| 2 | Data Kamar | List per asrama + kapasitas | Tambah, Edit, Update status |
| 3 | Penempatan Santri | Assign santri → kamar | Assign, Validasi, Save |
| 4 | Mutasi Kamar | Pindah kamar + alasan | Input alasan, Proses |
| 5 | Absensi Asrama | Input Pagi/Malam per kamar | Input massal, Auto-izin, Save |
| 6 | Rekap Absensi Asrama | Per santri / asrama / periode | View, Export |

---

## KEPESANTRENAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Tata Tertib | List aturan per jenis/marhalah | Tambah, Edit, Nonaktif |
| 2 | Jenis Pelanggaran | List + poin + level + rekomendasi | Tambah, Edit, Nonaktif |
| 3 | Riwayat Pelanggaran | Input + filter + update status | Input, Filter, Update |
| 4 | Sanksi & Pembinaan | Berikan sanksi + monitor progress | Input sanksi, Update progress |
| 5 | Perizinan Santri | Ajukan + approve/tolak | Submit, Approve, Tolak |
| 6 | Catatan Musyrif | Catatan harian + evaluasi | Input harian, Input evaluasi |

---

## KESEHATAN SANTRI

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Rekam Medis | Riwayat kesehatan per santri | View, Tambah, Edit |
| 2 | Pemeriksaan & Sakit | Input keluhan + diagnosis + tindakan | Input, Save |
| 3 | Stok Obat Klinik | List obat + stok + warning habis | Tambah, Update stok |
| 4 | Rujukan RS | Catat rujukan + dokumen + tindak lanjut | Input, Upload, Update |

---

## TAHFIDZ

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Target Hafalan | Per marhalah + override per santri | Input, Save |
| 2 | Setoran Hafalan | Input harian per santri | Input materi + jenis + nilai, Save |
| 3 | Murajaah | Jadwal + evaluasi murajaah | Setup jadwal, Input evaluasi |
| 4 | Penilaian Tahfidz | Kelancaran + tajwid + konsistensi + narasi | Input, Draft, Validasi |
| 5 | Laporan Tahfidz | Per santri / marhalah / ustadz | Generate, Export |

---

## DINIYAH & KITAB

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Kitab & Materi | List kitab + bidang + marhalah | Tambah, Edit, Arsip |
| 2 | Halaqah | List + assign santri + ustadz + jadwal | Buat, Assign, Edit |
| 3 | Absensi Diniyah | Input per halaqah per pertemuan | Input massal, Save |
| 4 | Penilaian Diniyah | Pemahaman + akhlak + kehadiran + narasi | Input, Draft, Validasi |

---

## PROGRAM KEGIATAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Program | List + jenis + status | Tambah, Edit, Nonaktif |
| 2 | Panitia & Peserta | Assign panitia SDM + peserta santri | Assign, Remove |
| 3 | Jadwal & Agenda | Rundown + lokasi | Input, Edit |
| 4 | Laporan Kegiatan | Dokumentasi + evaluasi + arsip | Input, Upload, Arsip |

---

## E-RAPOR PESANTREN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Setup Kurikulum | Komponen aktif + skema nilai | Set aktif, Save |
| 2 | Struktur Rapor | Marhalah + semester + bobot | Input, Save |
| 3 | Input Nilai | Per santri per komponen | Input, Draft, Validasi |
| 4 | Generate Rapor | Cek kelengkapan → Preview → Publish | Single/Bulk, Preview, Publish |
| 5 | Arsip Rapor | Filter + download | View, Download PDF |

---

## KALENDER HIJRIAH

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Kalender Aktif | Tahun hijriah + mapping masehi | Set aktif |
| 2 | Kegiatan & Event | List event per bulan | Tambah, Edit |
| 3 | Reminder | H-7/H-3/H-1 per event | Set, Target & channel |

---

# 💰 DASHBOARD BENDAHARA PESANTREN

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Saldo Kas Saat Ini | Angka realtime |
| 2 | Saldo Dana Wakaf | Terpisah dari kas operasional |
| 3 | Total Pemasukan Bulan Ini | SPP + Donasi + Wakaf |
| 4 | Total Pengeluaran Bulan Ini | Honor + Konsumsi + Operasional |
| 5 | Surplus / Defisit Bulan Ini | Selisih otomatis |
| 6 | SPP Sudah Lunas | Nominal + jumlah santri |
| 7 | SPP Belum Bayar | Nominal tunggakan + jumlah santri |
| 8 | Donasi Masuk Bulan Ini | Total nominal |
| 9 | Realisasi Anggaran | % terpakai dari anggaran hijriah |
| 10 | Anggaran Hampir Habis | Kategori < 10% sisa |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Pemasukan vs Pengeluaran | Bar Chart | 12 bulan terakhir |
| 2 | Tren Saldo Kas | Line Chart | Per bulan tahun hijriah |
| 3 | Komposisi Pemasukan | Donut Chart | SPP/Donasi/Wakaf/Lainnya |
| 4 | Komposisi Pengeluaran | Donut Chart | Honor/Konsumsi/Operasional/Sarpras |
| 5 | Status SPP Bulan Ini | Donut Chart | Lunas/Sebagian/Belum |
| 6 | Realisasi vs Anggaran | Bar Chart Horizontal | % per kategori |
| 7 | Tren Donasi & Wakaf | Line Chart | 12 bulan terakhir |
| 8 | Tunggakan SPP per Asrama | Bar Chart | Nominal per asrama |

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
| 1 | Generate Tagihan | Pilih periode + santri | Preview, Generate, Notif WA |
| 2 | Status Pembayaran | Filter lunas/sebagian/belum per asrama | View, Filter, Export |
| 3 | Konfirmasi Pembayaran | Input nominal + metode + bukti | Konfirmasi, Update status |
| 4 | Riwayat Pembayaran | Per santri per periode | View, Export |

## PEMASUKAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | SPP Santri | Terhubung dari tagihan | View |
| 2 | Donasi | Catat donatur + tujuan terikat/bebas | Input, Save |
| 3 | Wakaf | COA terpisah + jenis tunai/barang | Input, Save |

## PENGELUARAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Honor Ustadz (dari SDM) | Review + verifikasi | Setujui & Posting |
| 2 | Konsumsi | Input + upload bukti | Input, Save |
| 3 | Operasional | Input + upload bukti | Input, Save |
| 4 | Sarpras | Input + upload bukti | Input, Save |

## ANGGARAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Buat Anggaran | Per tahun hijriah + per kategori | Input, Save |
| 2 | Realisasi Anggaran | Anggaran vs realisasi + warning | View, Export |

## LAPORAN KEUANGAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Laporan Kas | Per periode hijriah/masehi | Generate, Export PDF/Excel |
| 2 | Laporan Anggaran | Anggaran vs realisasi vs selisih | Generate, Export |
| 3 | Audit Trail | Filter user/tanggal/aksi | View, Filter, Export |

---

# 🗂️ DASHBOARD SEKRETARIS PESANTREN

## KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total SDM Aktif | Ustadz + Musyrif + Pengurus + Staf |
| 2 | Absensi SDM Hari Ini | Hadir/Sakit/Izin/Alpha |
| 3 | SDM Alpha Bulan Ini | Jumlah + nama |
| 4 | Status Honor | Draft/Disetujui/Diposting bulan ini |
| 5 | Total Honor Bulan Ini | Nominal total semua SDM |
| 6 | Surat Masuk Pending | Jumlah belum disposisi |
| 7 | Pengumuman Terkirim | Bulan ini + success rate |
| 8 | Program Kegiatan Aktif | Sedang berjalan / Upcoming |

## Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Rekap Absensi SDM | Grouped Bar Chart | Hadir/Izin/Alpha per minggu |
| 2 | Tren Kehadiran SDM | Line Chart | % kehadiran 6 bulan |
| 3 | Distribusi SDM per Bidang | Donut Chart | Diniyah/Tahfidz/Musyrif/Staf |
| 4 | Beban Mengajar per Ustadz | Bar Chart Horizontal | Halaqah/jam per ustadz |
| 5 | Honor per Jenis | Bar Chart | Mengajar/Tahfidz/Insentif bulan ini |
| 6 | Rekap Pelanggaran Santri | Bar Chart | Ringan/Sedang/Berat bulan ini |

---

## DATA SDM

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Data Ustadz | List + filter bidang/status | Tambah, Edit, Nonaktif |
| 2 | Data Musyrif | List + asrama tanggung jawab | Tambah, Edit, Assign asrama |
| 3 | Data Pengurus | List + jabatan + periode | Tambah, Edit |
| 4 | Data Staf | List + unit kerja | Tambah, Edit, Nonaktif |

## STRUKTUR ORGANISASI

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Bagan Organisasi | Visual: Pengasuh → Mudir → Sekretaris → Bendahara | View |
| 2 | Edit Struktur | Assign jabatan | Edit, Save |
| 3 | Riwayat Jabatan | Histori per periode | View |
| 4 | Cetak Struktur | Export bagan | Export PDF |

## ABSENSI SDM

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Absensi Harian | Input status per SDM | Input massal, Save |
| 2 | Rekap Bulanan | Auto-kalkulasi | View, Kunci, Export |

## HONOR & INSENTIF

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Honor Mengajar | Kalkulasi otomatis per ustadz | Review, Approve, Kirim ke bendahara |
| 2 | Insentif Tahfidz | Berdasarkan capaian santri | Review, Approve |
| 3 | Riwayat Pembayaran | Per SDM per periode | View, Download slip honor PDF |

## SURAT MENYURAT

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Surat Masuk | Catat + upload + disposisi | Input, Upload, Disposisi |
| 2 | Surat Keluar | Buat + nomor otomatis + arsip | Buat, Nomor auto, Arsip |
| 3 | Surat Keterangan Santri | Generate (Aktif/Lulus/Pindah/Rekomendasi) | Pilih jenis, Generate PDF |

## PENGUMUMAN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Buat Pengumuman | Target + channel + jadwal | Input, Preview, Kirim/Jadwal |
| 2 | Riwayat Pengumuman | List + status kirim | View, Log per penerima |

## LAPORAN SEKRETARIAT

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Laporan SDM | Kehadiran/Beban Mengajar/Honor | Generate, Export |
| 2 | Laporan Kepesantrenan | Pelanggaran/Perizinan/Statistik | Generate, Export |
| 3 | Laporan Program Kegiatan | Rekap per program + evaluasi | Generate, Export |

## PENGATURAN PESANTREN

| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Profil Pesantren | Nama, NSM, Logo, TTD Digital Mudir | Edit, Upload |
| 2 | Tahun Ajaran Hijriah | Buat, Set aktif, Arsip | Buat, Set aktif |
| 3 | Role & User | List user + role | Tambah, Assign, Nonaktif |
| 4 | Modul & Fitur | Toggle per modul | Toggle ON/OFF |
| 5 | Notifikasi | WA Gateway + Email + Template | Config, Test |
