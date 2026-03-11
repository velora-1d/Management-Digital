export type HelpFeature = {
  title: string;
  icon?: string;
  steps: string[];
};

export type HelpContent = {
  title: string;
  description: string;
  features: HelpFeature[];
  extraInfo?: string[];
};

export const HELP_CONTENTS: Record<string, HelpContent> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Pusat kendali dan ringkasan eksekutif seluruh operasional sekolah.",
    features: [
      {
        title: "KPI Akademik & SDM",
        steps: [
          "Pantau jumlah siswa aktif, guru, dan staf secara real-time.",
          "Cek rekapitulasi kehadiran harian untuk memantau kedisiplinan."
        ]
      },
      {
        title: "Statistik Keuangan & Koperasi",
        steps: [
          "Lihat grafik cash flow (pemasukan vs pengeluaran) 30 hari terakhir.",
          "Pantau omzet koperasi harian dan total piutang siswa yang masih aktif."
        ]
      },
      {
        title: "Notifikasi Administrasi",
        steps: [
          "Lihat jumlah surat masuk/keluar bulan ini dan pengumuman yang sedang aktif."
        ]
      }
    ]
  },
  "/ppdb": {
    title: "Penerimaan Siswa Baru (PPDB)",
    description: "Alur pendaftaran dan seleksi calon peserta didik baru.",
    features: [
      {
        title: "Manajemen Pendaftar",
        steps: [
          "Gunakan tombol 'Tambah Pendaftar' untuk memasukkan data calon siswa.",
          "Pantau status seleksi (Menunggu, Diterima, Ditolak)."
        ]
      },
      {
        title: "Pembayaran & Konversi",
        steps: [
          "Catat biaya pendaftaran. Sistem akan melakukan penjurnalan otomatis.",
          "Klik 'Konversi' untuk memindahkan data pendaftaran yang diterima langsung ke Data Master Siswa."
        ]
      }
    ]
  },
  "/re-registration": {
    title: "Daftar Ulang Siswa",
    description: "Proses validasi kelanjutan studi siswa lama untuk tahun ajaran baru.",
    features: [
      {
        title: "Update Status & Biaya",
        steps: [
          "Tandai siswa yang sudah melakukan daftar ulang lewat kolom Status.",
          "Input pembayaran biaya daftar ulang yang akan langsung masuk ke laporan keuangan."
        ]
      }
    ]
  },
  "/students": {
    title: "Data Master Siswa",
    description: "Pusat database identitas dan profil akademis siswa.",
    features: [
      {
        title: "Profil & Kategori SPP",
        steps: [
          "Setiap siswa wajib memiliki Kategori SPP (Reguler/Potongan/Gratis) untuk otomasi tagihan.",
          "Lengkapi NISN and NIK untuk keperluan pelaporan Dapodik/EMIS."
        ]
      },
      {
        title: "Import Massal",
        steps: [
          "Gunakan fitur Import Excel untuk memasukkan data siswa dalam jumlah banyak sekaligus."
        ]
      }
    ]
  },
  "/mutations": {
    title: "Mutasi & Kenaikan Kelas",
    description: "Modul untuk mengelola perpindahan status dan kelas siswa.",
    features: [
      {
        title: "Proses Kenaikan",
        steps: [
          "Ceklist nama siswa, pilih kelas tujuan, dan klik 'Proses Kenaikan' di akhir semester.",
          "Histori kelas lama tetap tersimpan dalam sistem."
        ]
      },
      {
        title: "Mutasi Keluar",
        steps: [
          "Gunakan untuk mencatat siswa yang pindah sekolah atau mengundurkan diri agar tagihan SPP berhenti otomatis."
        ]
      }
    ]
  },
  "/classrooms": {
    title: "Manajemen Kelas",
    description: "Pengaturan ruang kelas dan penunjukan wali kelas.",
    features: [
      {
        title: "Wali Kelas & Tingkatan",
        steps: [
          "Tentukan wali kelas untuk setiap ruangan agar fitur Catatan Wali Kelas di Rapor berfungsi.",
          "Urutkan kelas berdasarkan tingkatan untuk mempermudah navigasi."
        ]
      }
    ]
  },
  "/academic-years": {
    title: "Tahun Ajaran",
    description: "Pengaturan periode aktif dan kalender akademis.",
    features: [
      {
        title: "Aktivasi Periode",
        steps: [
          "Pilih tahun ajaran yang sedang berjalan sebagai status 'Aktif'.",
          "Semua pembuatan tagihan dan rapor akan merujuk pada tahun ajaran aktif ini."
        ]
      }
    ]
  },
  "/transaction-categories": {
    title: "Kategori Keuangan",
    description: "Master data untuk penggelompokan transaksi di Jurnal Umum.",
    features: [
      {
        title: "Klasifikasi COA",
        steps: [
          "Buat kategori seperti 'Wakaf', 'Biaya Listrik', 'Gaji Guru'.",
          "Pilih tipe Pemasukan atau Pengeluaran dengan benar untuk laporan Laba/Rugi."
        ]
      }
    ]
  },
  "/subjects": {
    title: "Mata Pelajaran",
    description: "Daftar kurikulum pelajaran yang diajarkan di sekolah.",
    features: [
      {
        title: "Input Kurikulum",
        steps: [
          "Tambahkan mata pelajaran beserta KKM (Kriteria Ketuntasan Minimal).",
          "Data ini akan muncul otomatis pada form Input Nilai."
        ]
      }
    ]
  },
  "/teaching-assignments": {
    title: "Penugasan Guru",
    description: "Pemetaan guru ke mata pelajaran dan kelas tertentu.",
    features: [
      {
        title: "Hak Akses Input Nilai",
        steps: [
          "Hanya guru yang ditugaskan di mapel dan kelas tersebut yang dapat menginput nilai siswa.",
          "Pastikan penugasan sesuai dengan jadwal mengajar riil."
        ]
      }
    ]
  },
  "/schedules": {
    title: "Jadwal Pelajaran",
    description: "Plotting waktu belajar mengajar per hari.",
    features: [
      {
        title: "Visualisasi Jadwal",
        steps: [
          "Input jam mulai dan jam selesai untuk setiap mata pelajaran per kelas.",
          "Gunakan untuk mencetak jadwal mingguan kelas atau jadwal pribadi guru."
        ]
      }
    ]
  },
  "/attendance": {
    title: "Absensi Siswa",
    description: "Pencatatan kehadiran harian siswa di kelas.",
    features: [
      {
        title: "Input Presensi",
        steps: [
          "Pilih kelas dan tanggal, lalu centang status (Hadir/Izin/Sakit/Alfa).",
          "Data absensi ini akan dikalkulasi otomatis dalam Rapor Digital di akhir semester."
        ]
      }
    ]
  },
  "/curriculum": {
    title: "Manajemen Kurikulum",
    description: "Pengaturan bobot nilai dan standar kompetensi.",
    features: [
      {
        title: "Setting Bobot",
        steps: [
          "Tentukan persentase nilai Tugas, UTS, dan UAS.",
          "Rumus nilai akhir rapor akan mengikuti settingan yang dibuat di sini."
        ]
      }
    ]
  },
  "/grades": {
    title: "Input Nilai Siswa",
    description: "Pengisian nilai akademis per mata pelajaran.",
    features: [
      {
        title: "Pengisian Massal",
        steps: [
          "Pilih kelas dan mapel, lalu input nilai pengetahuan dan keterampilan.",
          "Simpan perubahan. Nilai yang diinput akan dikonversi menjadi predikat (A/B/C/D)."
        ]
      }
    ]
  },
  "/report-cards": {
    title: "Rapor Digital",
    description: "Proses akhir evaluasi belajar dan cetak rapor.",
    features: [
      {
        title: "Catatan Wali Kelas",
        steps: [
          "Wali kelas wajib mengisi catatan perkembangan karakter siswa.",
          "Isi deskripsi prestasi dan saran untuk orang tua."
        ]
      },
      {
        title: "Cetak PDF",
        steps: [
          "Sistem menggabungkan nilai akademis, ekskul, absensi, dan catatan menjadi satu file PDF.",
          "Pastikan Profil Sekolah (Header) sudah diisi sebelum mencetak."
        ]
      }
    ]
  },
  "/extracurricular": {
    title: "Kegiatan Ekstrakurikuler",
    description: "Pengelolaan bakat dan minat siswa di luar jam pelajaran.",
    features: [
      {
        title: "Keanggotaan & Nilai",
        steps: [
          "Daftarkan siswa ke dalam ekskul tertentu (Pramuka, Futsal, dll).",
          "Input nilai predikat ekskul yang akan tampil di halaman belakang rapor."
        ]
      }
    ]
  },
  "/counseling": {
    title: "Bimbingan Konseling (BK)",
    description: "Pencatatan insiden, pelanggaran, dan prestasi perilaku siswa.",
    features: [
      {
        title: "Pencatatan Kasus",
        steps: [
          "Input detail kejadian, tanggal, dan tingkat kerawanan.",
          "Pantau status penanganan (Dalam Proses/Selesai/Sanksi)."
        ]
      }
    ]
  },
  "/calendar": {
    title: "Kalender Akademik",
    description: "Jadwal kegiatan besar sekolah selama satu tahun.",
    features: [
      {
        title: "Manajemen Event",
        steps: [
          "Input agenda seperti Libur Semester, Ujian Akhir, atau Libur Nasional.",
          "Filter kategori untuk melihat agenda spesifik (Akademik/Non-Akademik)."
        ]
      }
    ]
  },
  "/infaq-bills": {
    title: "Tagihan Infaq / SPP",
    description: "Modul penagihan iuran bulanan siswa.",
    features: [
      {
        title: "Otomasi Tagihan",
        steps: [
          "Generate tagihan dilakukan sekali setiap bulan/semester.",
          "Nominal tagihan merujuk pada Kategori SPP di Data Siswa."
        ]
      },
      {
        title: "Pembayaran & Tunggakan",
        steps: [
          "Gunakan fitur Bayar untuk mencatat uang masuk ke Akun Kas.",
          "Pantau daftar tunggakan melalui filter 'Belum Lunas'."
        ]
      }
    ],
    extraInfo: [
      "Perhatikan Kategori Siswa saat mengisi Data Master: 'Reguler' bayar full, 'Potongan' bayar nominal tertentu, 'Gratis' tidak ditagihkan."
    ]
  },
  "/tabungan": {
    title: "Tabungan Siswa",
    description: "Layanan simpan pinjam/tabungan di lingkungan sekolah.",
    features: [
      {
        title: "Setor & Tarik",
        steps: [
          "Setiap mutasi (uang masuk/keluar) akan tercatat dengan timestamp detail.",
          "Gunakan Saldo Tabungan sebagai alternatif pembayaran SPP (Integrasi Modul)."
        ]
      }
    ]
  },
  "/wakaf": {
    title: "Wakaf & Donasi",
    description: "Penerimaan bantuan dari donatur/yayasan.",
    features: [
      {
        title: "Tracking Peruntukan",
        steps: [
          "Catat sumber dana dan peruntukannya (misal: Pembangunan Lab).",
          "Tampilkan laporan khusus donasi untuk transparansi pengurus."
        ]
      }
    ]
  },
  "/journal": {
    title: "Jurnal Umum",
    description: "Buku besar utama seluruh arus keuangan sekolah.",
    features: [
      {
        title: "Integrasi Otomatis",
        steps: [
          "Semua bayar SPP, PPDB, dan Koperasi masuk otomatis sebagai Debet.",
          "Input pengeluaran operasional (Kredit) harus dilakukan di sini."
        ]
      }
    ]
  },
  "/reports": {
    title: "Laporan Keuangan",
    description: "Rekapitulasi data untuk audit dan rapat yayasan.",
    features: [
      {
        title: "Analisis Arus Kas",
        steps: [
          "Cetak laporan neraca sederhana atau arus kas per periode.",
          "Export ke Excel jika ingin melakukan pengolahan data lebih lanjut."
        ]
      }
    ]
  },
  "/teachers": {
    title: "Data Master Guru",
    description: "Manajemen SDM Tenaga Pendidik.",
    features: [
      {
        title: "Database SDM",
        steps: [
          "Simpan data pendidikan terakhir, tanggal bergabung, dan kontak.",
          "Input Gaji Pokok sebagai dasar perhitungan Payroll."
        ]
      }
    ]
  },
  "/staff": {
    title: "Data Master Staf",
    description: "Manajemen Tenaga Kependidikan.",
    features: [
      {
        title: "Jabatan & Tunjangan",
        steps: [
          "Tentukan posisi staf (Satpam, Kebersihan, Admin).",
          "Input tunjangan tetap yang akan masuk ke komponen slip gaji."
        ]
      }
    ]
  },
  "/payroll": {
    title: "Penggajian (Payroll)",
    description: "Otomasi slip gaji bulanan karyawan.",
    features: [
      {
        title: "Generate Slip",
        steps: [
          "Klik Generate bulanan. Sistem mengkombinasikan Gaji Pokok + Tunjangan - Potongan.",
          "Simpan sebagai archive dan cetak slip gaji fisik dalam hitungan detik."
        ]
      }
    ]
  },
  "/inventory": {
    title: "Inventaris Aset",
    description: "Pengelolaan aset berharga (Sarpras) sekolah.",
    features: [
      {
        title: "Lokasi & Kondisi",
        steps: [
          "Catat setiap barang ada di ruangan mana.",
          "Update kondisi barang (Baik/Rusak) secara berkala untuk keperluan pengadaan."
        ]
      }
    ]
  },
  "/coop/products": {
    title: "Produk Koperasi",
    description: "Pusat manajemen stok barang di koperasi/kantin.",
    features: [
      {
        title: "Manajemen Stok",
        steps: [
          "Warna indikator stok: Biru (Banyak), Kuning (Menipis < 10), Merah (Habis).",
          "Set Harga Beli dan Harga Jual untuk menghitung estimasi keuntungan."
        ]
      }
    ]
  },
  "/coop/transactions": {
    title: "Point of Sale (Kasir)",
    description: "Antarmuka penjualan barang koperasi.",
    features: [
      {
        title: "Proses Transaksi",
        steps: [
          "Pilih produk -> Masukkan ke Keranjang -> Klik 'Bayar'.",
          "Metode 'Bon': Piutang akan otomatis ditambahkan ke akun siswa yang dipilih."
        ]
      }
    ]
  },
  "/coop/credits": {
    title: "Piutang Siswa",
    description: "Pelacakan hutang jajan/barang siswa di kantin.",
    features: [
      {
        title: "Cicilan & Pelunasan",
        steps: [
          "Lihat total hutang per siswa. Klik 'Bayar Cicilan' jika siswa membayar sebagian.",
          "Status berubah otomatis ke 'Sudah Lunas' jika sisa tagihan Rp0."
        ]
      }
    ]
  },
  "/employee-attendance": {
    title: "Absensi Pegawai",
    description: "Perekaman kehadiran guru dan staf.",
    features: [
      {
        title: "Rekapitulasi SDM",
        steps: [
          "Input kehadiran setiap pagi/sore.",
          "Gunakan fitur 'Rekap' untuk melihat total kehadiran dalam sebulan sebagai dasar insentif."
        ]
      }
    ]
  },
  "/letters": {
    title: "Manajemen Surat (TU)",
    description: "Digitalisasi persuratan sekolah.",
    features: [
      {
        title: "Surat Masuk/Keluar",
        steps: [
          "Nomor surat otomatis akan ter-generate sesuai urutan terakhir di sistem.",
          "Simpan file pindaian (scan) surat sebagai arsip digital agar mudah dicari."
        ]
      }
    ]
  },
  "/announcements": {
    title: "Pengumuman Sekolah",
    description: "Pusat informasi berita dan agenda sekolah.",
    features: [
      {
        title: "Publish & Status",
        steps: [
          "Aktifkan pengumuman agar muncul di dashboard setiap pengguna.",
          "Gunakan banner warna berbeda (Info/Warning/Urgent) untuk mencerminkan urgensi."
        ]
      }
    ]
  },
  "/school-profile": {
    title: "Profil & Identitas",
    description: "Pengaturan dasar identitas instansi.",
    features: [
      {
        title: "Footer & Kop Surat",
        steps: [
          "Update Nama Sekolah, Alamat, dan No. Telepon.",
          "Data ini digunakan sebagai header otomatis di semua cetakan (Rapor, Surat, Kwitansi)."
        ]
      }
    ]
  },
  "/settings": {
    title: "Pengaturan Sistem",
    description: "Konfigurasi teknis dan keamanan data.",
    features: [
      {
        title: "Manajemen Backup",
        steps: [
          "Lakukan 'Download Backup' secara berkala (minimal seminggu sekali).",
          "Backup mencakup seluruh data database dalam format SQL."
        ]
      }
    ]
  }
};

export function getHelpContentByPath(pathname: string): HelpContent | null {
  // exact match
  if (HELP_CONTENTS[pathname]) return HELP_CONTENTS[pathname];
  
  // start match
  const matches = Object.keys(HELP_CONTENTS).filter(path => pathname.startsWith(path));
  if (matches.length > 0) {
    // get longest match
    return HELP_CONTENTS[matches.sort((a,b) => b.length - a.length)[0]];
  }
  
  return null;
}
