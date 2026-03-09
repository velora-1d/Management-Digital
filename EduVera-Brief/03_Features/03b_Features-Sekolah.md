# FEATURES SEKOLAH — PER MENU
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# DASHBOARD PENDIDIKAN

---

## DATA SISWA
| # | Fitur | Detail |
|---|---|---|
| 1 | CRUD Siswa | Tambah, edit, nonaktif, arsip |
| 2 | Import Bulk Excel | Download template → upload → preview → import |
| 3 | Filter & Search | Per jenjang, tingkat, status, nama, NIS |
| 4 | Detail Siswa Multi-Tab | Profil, Data Wali, Kesehatan, Riwayat Akademik |
| 5 | Auto Generate Akun Wali | Buat akun portal wali saat tambah wali |
| 6 | Kirim Kredensial | WA / Email ke wali saat akun dibuat |
| 7 | Arsip Non-Destruktif | Data tidak dihapus, riwayat tetap ada |
| 8 | Export Excel | Export daftar siswa per filter |

## DATA GURU & STAF
| # | Fitur | Detail |
|---|---|---|
| 1 | CRUD Guru & Staf | Tambah, edit, nonaktif |
| 2 | Auto Buat Akun Login | Saat tambah guru/staf |
| 3 | Kirim Kredensial | WA / Email |
| 4 | Riwayat Mengajar | Auto-log dari penugasan kelas + mapel |
| 5 | Filter per Jenis | Guru Kelas / Mapel / Keagamaan / Produktif |

## MATA PELAJARAN
| # | Fitur | Detail |
|---|---|---|
| 1 | CRUD Mapel | Tambah, edit, arsip |
| 2 | Assign ke Jenjang & Tingkat | Multi-assign |
| 3 | Assign ke Jurusan | Khusus SMK mapel produktif |
| 4 | Arsip Non-Destruktif | Mapel arsip tetap muncul di rapor lama |

## JENJANG & TINGKAT
| # | Fitur | Detail |
|---|---|---|
| 1 | System Lock | Jenjang nasional tidak bisa dihapus |
| 2 | Toggle Aktif | Tenant aktifkan jenjang yang dimiliki |
| 3 | Kelola SMK | Tambah jurusan + kompetensi keahlian |

## MUTASI SISWA
| # | Fitur | Detail |
|---|---|---|
| 1 | Pindah Masuk | Input data + upload surat keterangan |
| 2 | Pindah Keluar | Alasan + surat pengantar + update status |
| 3 | Riwayat Mutasi | Filter per periode + export |

## KENAIKAN KELAS
| # | Fitur | Detail |
|---|---|---|
| 1 | Review Per Siswa | List siswa + status default naik |
| 2 | Set Tinggal Kelas | Override per siswa + wajib input alasan |
| 3 | Konfirmasi Massal | Preview → Konfirmasi → Lock |
| 4 | Auto Buat Kelas Baru | Kelas tahun ajaran baru ter-generate |
| 5 | Riwayat | Histori kenaikan per tahun ajaran |

---

## KELAS & PEMBELAJARAN

### Daftar Kelas
| # | Fitur | Detail |
|---|---|---|
| 1 | Buat Kelas | Per jenjang + tingkat + nama + tahun ajaran |
| 2 | Assign Wali Kelas | 1 guru = 1 kelas per tahun ajaran |
| 3 | View Daftar Siswa | Siswa terdaftar di kelas |
| 4 | Auto Lock | Kelas tahun ajaran lama → read-only |

### Jadwal Pembelajaran
| # | Fitur | Detail |
|---|---|---|
| 1 | Input Jadwal Harian | Per hari per jam per kelas |
| 2 | Deteksi Bentrok | Realtime — guru tidak bisa 2 kelas jam sama |
| 3 | Jadwal Produktif SMK | Multi-jam, assign lab/bengkel |
| 4 | Export Jadwal | PDF per kelas |

### Absensi Siswa
| # | Fitur | Detail |
|---|---|---|
| 1 | Input Massal | Default semua Hadir → klik yang tidak hadir |
| 2 | Status | Hadir / Sakit / Izin / Alpha |
| 3 | Auto Flag Alpha | Alert ke wali (opsional) |
| 4 | Rekap Otomatis | Per siswa / kelas / periode |
| 5 | Export | Excel rekap per periode |

---

## KURIKULUM

| # | Fitur | Detail |
|---|---|---|
| 1 | Multi-Kurikulum | K13, Merdeka, Kemenag, Custom per jenjang |
| 2 | 1 Aktif per Jenjang | Per tahun ajaran |
| 3 | Bobot Komponen | Total harus = 100% per mapel |
| 4 | Lock Saat Berjalan | Tidak bisa ubah setelah nilai masuk |
| 5 | Template Rapor PAUD/TK | Narasi perkembangan — bukan angka |
| 6 | Template Rapor SD–MA | Angka + deskripsi per mapel |
| 7 | Template Rapor SMK | Akademik + kompetensi produktif |
| 8 | Kustomisasi Template | Logo, nama KS, TTD digital |

---

## NILAI & E-RAPOR

| # | Fitur | Detail |
|---|---|---|
| 1 | Input Nilai Inline | Tabel langsung bisa diketik per siswa per komponen |
| 2 | Auto Hitung Nilai Akhir | Berdasarkan bobot per komponen |
| 3 | Input Narasi PAUD/TK | Deskriptif per aspek perkembangan |
| 4 | Upload Foto PAUD/TK | Dokumentasi kegiatan |
| 5 | Indikator Kelengkapan | Berapa siswa sudah diisi per mapel |
| 6 | Draft Nilai | Simpan draft kapan saja |
| 7 | Lock Nilai | Otomatis setelah rapor published |
| 8 | Bulk Generate Rapor | Semua kelas sekaligus via Inngest |
| 9 | Preview Rapor | Preview PDF sebelum publish |
| 10 | QR Code Verifikasi | Tiap rapor punya kode unik |
| 11 | Tanda Tangan Digital | Kepala Sekolah |
| 12 | Catatan Wali Kelas | Wajib diisi sebelum publish |
| 13 | Arsip Immutable | Tidak bisa dihapus setelah publish |
| 14 | Download Wali | Wali bisa download setelah published |

---

## EKSTRAKURIKULER

| # | Fitur | Detail |
|---|---|---|
| 1 | CRUD Ekskul | Tambah, edit, nonaktif |
| 2 | Assign Pembina | 1 guru bisa pegang beberapa ekskul |
| 3 | Daftar Anggota | Siswa bisa multi-ekskul |
| 4 | Absensi per Pertemuan | Input massal per ekskul |
| 5 | Nilai Ekskul | Predikat + masuk komponen rapor |

---

## BK — BIMBINGAN KONSELING

| # | Fitur | Detail |
|---|---|---|
| 1 | Catatan per Siswa | Input jenis masalah + isi catatan |
| 2 | Kategori Masalah | Akademik / Perilaku / Sosial / Keluarga |
| 3 | Status Tindak Lanjut | Aktif / Proses / Selesai |
| 4 | Akses Terbatas | Hanya Guru BK + Admin yang bisa lihat |

---

## KALENDER AKADEMIK

| # | Fitur | Detail |
|---|---|---|
| 1 | Setup Tahun Ajaran | Tanggal mulai–akhir + semester |
| 2 | Event Kalender | Ujian, libur, kegiatan + assign jenjang |
| 3 | Kalender PAUD/TK | Tema bulanan + kegiatan perkembangan |
| 4 | Reminder Otomatis | H-7, H-3, H-1 via WA/Email/Dashboard |
| 5 | Export Kalender | PDF per semester |

---

# DASHBOARD BENDAHARA

## MASTER KEUANGAN
| # | Fitur | Detail |
|---|---|---|
| 1 | COA Fleksibel | Tambah custom akun di semua tipe |
| 2 | Lock Akun Terpakai | Akun yang sudah dipakai transaksi tidak bisa dihapus |
| 3 | Kategori Custom | Tambah kategori pemasukan & pengeluaran |

## SPP & TAGIHAN
| # | Fitur | Detail |
|---|---|---|
| 1 | Generate Otomatis | 1 klik → semua siswa aktif ter-generate |
| 2 | Nominal per Jenjang | Bisa beda nominal per jenjang |
| 3 | Cegah Duplikat | Tidak bisa generate bulan yang sama 2x |
| 4 | Notifikasi WA Otomatis | Ke wali saat tagihan terbit |
| 5 | Konfirmasi Manual | Input nominal + metode + bukti |
| 6 | Status Granular | Belum / Sebagian / Lunas |
| 7 | Notifikasi Lunas | WA ke wali setelah dikonfirmasi |
| 8 | Export Tunggakan | PDF / Excel per kelas |

## PEMASUKAN & PENGELUARAN
| # | Fitur | Detail |
|---|---|---|
| 1 | Catat Dana BOS | Per triwulan + sumber |
| 2 | Donasi Fleksibel | Catat donatur + tujuan |
| 3 | Pengeluaran Gaji | Selalu dari modul SDM — tidak bisa input manual |
| 4 | Upload Bukti | Setiap transaksi bisa upload foto/PDF |
| 5 | Immutable Transaksi | Tidak bisa dihapus — koreksi via jurnal baru |
| 6 | Warning RAPBS | Alert jika kategori < 10% sisa anggaran |

## LAPORAN KEUANGAN
| # | Fitur | Detail |
|---|---|---|
| 1 | Laporan Kas | Saldo awal + pemasukan + pengeluaran + saldo akhir |
| 2 | Laporan Laba Rugi | Surplus / defisit per periode |
| 3 | Laporan Anggaran | RAPBS vs realisasi vs selisih |
| 4 | Audit Trail | Immutable, filter user/tanggal/aksi |
| 5 | Export PDF & Excel | Semua jenis laporan |

---

# DASHBOARD TU

## STRUKTUR ORGANISASI
| # | Fitur | Detail |
|---|---|---|
| 1 | Visual Tree | Bagan interaktif di browser |
| 2 | 1 Jabatan 1 Orang | Validasi tidak bisa 2 orang di jabatan utama sama |
| 3 | Riwayat Jabatan | Histori per periode |
| 4 | Export PDF | Cetak bagan |

## ABSENSI PEGAWAI
| # | Fitur | Detail |
|---|---|---|
| 1 | Input Massal | Semua pegawai dalam 1 halaman |
| 2 | Validasi Duplikat | Tidak bisa input 2x per hari per pegawai |
| 3 | Kunci Rekap | Rekap dikunci akhir bulan → tidak bisa diubah |
| 4 | Export | PDF / Excel rekap bulanan |

## PENGGAJIAN
| # | Fitur | Detail |
|---|---|---|
| 1 | Kalkulasi Otomatis | Dari absensi + jam mengajar + komponen gaji |
| 2 | Komponen Fleksibel | Gaji pokok, tunjangan, honor jam, potongan |
| 3 | Review Sebelum Publish | Admin review sebelum slip dikirim |
| 4 | Slip Immutable | Setelah published tidak bisa diedit |
| 5 | Portal Pegawai | Pegawai lihat & download slip sendiri |
| 6 | Notifikasi | WA / Email ke pegawai saat slip published |

## INVENTARIS & SARPRAS
| # | Fitur | Detail |
|---|---|---|
| 1 | Daftar Inventaris | Kategori barang + kondisi |
| 2 | Update Kondisi | Baik / Rusak Ringan / Rusak Berat / Hilang |
| 3 | Rencana Pengadaan | Input kebutuhan + estimasi biaya |
| 4 | Terhubung Keuangan | Realisasi pengadaan auto-link ke pengeluaran |

## SURAT MENYURAT
| # | Fitur | Detail |
|---|---|---|
| 1 | Nomor Surat Otomatis | Format: [nomor]/[kode institusi]/[bulan]/[tahun] |
| 2 | Upload Dokumen | Scan surat masuk |
| 3 | Disposisi | Arahkan surat ke pihak terkait |
| 4 | Generate Surat Keterangan | Aktif / Lulus / Pindah — auto isi data siswa |
| 5 | Arsip Digital | Semua surat tersimpan + bisa dicari |

## PENGUMUMAN
| # | Fitur | Detail |
|---|---|---|
| 1 | Multi-Channel | WA + Email + Dashboard sekaligus |
| 2 | Target Spesifik | Per jenjang / kelas / role / semua |
| 3 | Jadwal Kirim | Bisa dijadwalkan tanggal & jam tertentu |
| 4 | Preview | Preview pesan sebelum kirim |
| 5 | Log Pengiriman | Status per penerima (success/failed) |
| 6 | Retry Otomatis | Gagal kirim diretry 3x via Inngest |
