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
    description: "Menampilkan ringkasan data utama sekolah dan statistik keuangan bulan berjalan.",
    features: [
      {
        title: "Kartu Statistik",
        steps: [
          "Lihat total siswa aktif, jumlah guru, total tagihan yang belum lunas, dan saldo tabungan keseluruhan.",
          "Angka akan otomatis terupdate setiap ada perubahan data."
        ]
      },
      {
        title: "Grafik Keuangan",
        steps: [
          "Menampilkan perbandingan total pemasukan dan pengeluaran dalam 30 hari terakhir.",
          "Bergeser kursor ke atas grafik untuk melihat angka pastinya."
        ]
      }
    ]
  },
  "/ppdb": {
    title: "Penerimaan PPDB",
    description: "Modul pendaftaran Calon Peserta Didik Baru (PPDB).",
    features: [
      {
        title: "Tambah Pendaftar",
        steps: [
          "Klik tombol 'Tambah Pendaftar Baru'.",
          "Isi form yang tersedia (Nama, Asal Sekolah, Alamat, dll).",
          "Klik 'Simpan'. Pendaftar akan masuk dengan status 'Menunggu'."
        ]
      },
      {
        title: "Terima/Tolak Pendaftar",
        steps: [
          "Cari nama pendaftar di tabel.",
          "Untuk menerima, klik ikon centang hijau (Terima).",
          "Untuk menolak, klik ikon silang merah (Tolak) dan masukkan alasannya."
        ]
      },
      {
        title: "Pembayaran PPDB",
        steps: [
          "Di kolom Pembayaran, klik toggle untuk menandai 'Sudah Bayar'.",
          "Masukkan nominal secara manual jika ada perubahan.",
          "Pilih Akun Kas penerima.",
          "Klik 'Simpan'. Pemasukan otomatis tercatat di Jurnal Umum."
        ]
      },
      {
        title: "Konversi ke Siswa Aktif",
        steps: [
          "Pastikan status pendaftar adalah 'Diterima'.",
          "Klik ikon panah (Konversi ke Siswa).",
          "Pilih Kelas tujuan.",
          "Siswa akan otomatis ditambahkan ke Data Master Siswa."
        ]
      }
    ]
  },
  "/re-registration": {
    title: "Daftar Ulang",
    description: "Pencatatan daftar ulang siswa lama untuk tahun ajaran baru.",
    features: [
      {
        title: "Tandai Sudah Daftar Ulang",
        steps: [
          "Filter tabel berdasarkan Kelas jika diperlukan.",
          "Cari nama siswa.",
          "Klik toggle di kolom 'Status' untuk mengubah menjadi 'Sudah Daftar Ulang'."
        ]
      },
      {
        title: "Pembayaran Daftar Ulang",
        steps: [
          "Klik toggle di kolom 'Pembayaran'.",
          "Sesuaikan nominal jika perlu.",
          "Pilih Akun Kas.",
          "Klik 'Simpan'. Otomatis tercatat di jurnal."
        ]
      }
    ]
  },
  "/students": {
    title: "Data Master Siswa",
    description: "Pengelolaan seluruh data siswa aktif di sekolah.",
    features: [
      {
        title: "Tambah Siswa",
        steps: [
          "Klik 'Tambah Siswa'.",
          "Isi semua field wajib (NISN, Nama Lengkap, Tahun Ajaran, Kelas, Kategori SPP).",
          "Kategori SPP akan menentukan besaran tagihan SPP per bulan (Reguler = bayar penuh, Potongan = disesuaikan, Gratis = Rp0).",
          "Klik 'Simpan'."
        ]
      },
      {
        title: "Edit & Soft Delete",
        steps: [
          "Klik ikon pensil untuk mengubah data siswa yang ada.",
          "Klik ikon tempat sampah untuk menghapus siswa. (Siswa tidak benar-benar dihapus dari database demi integritas data keuangan, hanya ditandai nonaktif)."
        ]
      },
      {
        title: "Import dari Excel",
        steps: [
          "Klik 'Import Data' -> Download Format Template yang disediakan.",
          "Isi data siswa di file Excel tersebut sesuai format.",
          "Pilih file Excel dan klik 'Upload & Proses'.",
          "Data akan divalidasi dan diimpor massal."
        ]
      }
    ]
  },
  "/mutations": {
    title: "Mutasi & Kenaikan",
    description: "Proses mutasi keluar/masuk dan kenaikan kelas siswa.",
    features: [
      {
        title: "Kenaikan Kelas",
        steps: [
          "Pilih siswa yang akan dinaikkan kelasnya.",
          "Pilih Kelas Tujuan di menu dropdown.",
          "Klik konfirmasi. Siswa akan dipindahkan ke kelas baru."
        ]
      },
      {
        title: "Mutasi Keluar",
        steps: [
          "Pilih siswa yang keluar/pindah sekolah.",
          "Masukkan alasan mutasi (misal: Pindah ikut orang tua, Drop out).",
          "Siswa tersebut tidak akan muncul lagi di tagihan berikutnya."
        ]
      }
    ]
  },
  "/classrooms": {
    title: "Data Kelas",
    description: "Pengelolaan tingkatan kelas dan wali kelas.",
    features: [
      {
        title: "Manajemen Kelas",
        steps: [
          "Klik 'Tambah Kelas' untuk membuat ruang kelas baru.",
          "Anda dapat menetapkan Wali Kelas untuk setiap kelas.",
          "Kelas yang digunakan untuk filter di berbagai modul berasal dari sini."
        ]
      }
    ]
  },
  "/transaction-categories": {
    title: "Kategori Keuangan",
    description: "Pengklasifikasian jenis transaksi pemasukan dan pengeluaran.",
    features: [
      {
        title: "Membuat Kategori Baru",
        steps: [
          "Klik 'Tambah Kategori'.",
          "Isi nama kategori.",
          "Tentukan Tipenya: 'Pemasukan' atau 'Pengeluaran'.",
          "Kategori ini nantinya digunakan saat mencatat Jurnal Umum."
        ]
      }
    ]
  },
  "/infaq-bills": {
    title: "Tagihan Infaq / SPP",
    description: "Modul paling penting untuk keuangan siswa.",
    features: [
      {
        title: "1. Setting Biaya (Wajib)",
        steps: [
          "Klik tombol 'Setting / Lihat Biaya Kelas'.",
          "Masukkan nominal SPP/Infaq per kelas.",
          "Klik 'Simpan Semua'. Tagihan tidak bisa di-generate jika nominal belum diset."
        ]
      },
      {
        title: "2. Generate Tagihan",
        steps: [
          "Klik 'Generate Tagihan'.",
          "Pilih Tahun Ajaran dan Tipe Periode (Bulanan/Semester/Tahunan).",
          "Kamu bisa generate untuk 1 kelas tertentu, atau biarkan kosong untuk seluruh kelas.",
          "Klik tombol proses. Tagihan akan dibuat otomatis sesuai Kategori SPP masing-masing siswa."
        ]
      },
      {
        title: "3. Bayar Tagihan",
        steps: [
          "Di daftar tagihan belum lunas, klik tombol dompet (Bayar).",
          "Pilih Akun Kas tujuan penerimaan.",
          "Pilih Metode Pembayaran (Tunai atau menggunakan Saldo Tabungan siswa).",
          "Klik 'Proses Pembayaran'."
        ]
      },
      {
        title: "Void / Revert",
        steps: [
          "Tagihan bisa di-void (batalkan) jika salah buat.",
          "Tagihan lunas bisa di-revert (kembalikan ke belum lunas) jika ada kesalahan pencatatan bayar."
        ]
      }
    ],
    extraInfo: [
      "Perhatikan Kategori Siswa saat mengisi Data Master: 'Reguler' bayar full, 'Potongan' bayar nominal tertentu, 'Gratis' tidak ditagihkan."
    ]
  },
  "/tabungan": {
    title: "Tabungan Siswa",
    description: "Pengelolaan dana simpanan/tabungan siswa.",
    features: [
      {
        title: "Setor Tabungan",
        steps: [
          "Pilih filter kelas, lalu cari siswa.",
          "Klik tombol panah atas (Setor).",
          "Masukkan jumlah setoran, tanggal, dan keterangan.",
          "Klik 'Setor Sekarang'. Saldo siswa akan bertambah."
        ]
      },
      {
        title: "Tarik Tabungan",
        steps: [
          "Klik tombol panah bawah (Tarik).",
          "Masukkan jumlah penarikan. Limit maksimal tarikan adalah sesuai saldo yang tersedia.",
          "Klik 'Tarik Sekarang'. Saldo siswa akan berkurang."
        ]
      },
      {
        title: "Riwayat Mutasi",
        steps: [
          "Klik tombol ikon dokumen list (Riwayat Mutasi).",
          "Akan muncul pop-up berisi seluruh history uang masuk dan keluar khusus untuk siswa tersebut."
        ]
      }
    ],
    extraInfo: [
      "Saldo tabungan bisa digunakan sebagai metode pembayaran di modul SPP/Infaq."
    ]
  },
  "/wakaf": {
    title: "Wakaf & Donasi",
    description: "Pencatatan uang masuk dari pihak eksternal (donatur).",
    features: [
      {
        title: "Tambah Catatan Donasi",
        steps: [
          "Klik 'Tambah Transaksi Wakaf'.",
          "Masukkan nama donatur, nomor HP, jumlah uang, dan catatan/peruntukan.",
          "Simpan data untuk laporan."
        ]
      }
    ]
  },
  "/journal": {
    title: "Jurnal Umum",
    description: "Buku besar pencatatan setiap pergerakan keuangan sekolah.",
    features: [
      {
        title: "Entri Jurnal Manual",
        steps: [
          "Klik 'Tambah Entri'.",
          "Pilih Tanggal, Kategori Keuangan, dan Tipe (Debet/Kredit).",
          "Masukkan Keterangan, Pilih Akun Asal/Tujuan, dan Nominal.",
          "Simpan. Transaksi ini akan mencerminkan arus kas."
        ]
      },
      {
        title: "Entri Otomatis dari Modul Lain",
        steps: [
          "Anda tidak perlu entry manual jika pembayaran berasal dari SPP, PPDB, dst.",
          "Sistem otomatis akan menjurnal transaksi tersebut ke sini sebagai Pemasukan Sistem."
        ]
      }
    ]
  },
  "/reports": {
    title: "Laporan",
    description: "Export dan analisa data untuk pelaporan yayasan.",
    features: [
      {
        title: "Laporan Keuangan",
        steps: [
          "Pilih bulan dan tipe laporan yang diinginkan.",
          "Klik Cetak PDF atau Export Excel.",
          "Data yang ditampilkan adalah rekapitulasi dari Jurnal Umum."
        ]
      }
    ]
  },
  "/teachers": {
    title: "Data Guru",
    description: "Kelola data SDM Tenaga Pendidik.",
    features: [
      {
        title: "Manajemen Data Guru",
        steps: [
          "Gunakan untuk mencatat data pendukung guru: NIP, Nama, Kontak, Alamat.",
          "Data ini digunakan juga sebagai dasar saat pembuatan Slip Gaji di menu Payroll."
        ]
      }
    ]
  },
  "/staff": {
    title: "Data Staf Karyawan",
    description: "Kelola data Tenaga Kependidikan/Staf/Petugas.",
    features: [
      {
        title: "Manajemen Data Staf",
        steps: [
          "Serupa dengan Data Guru, dipakai untuk database SDM Non-guru.",
          "Pastikan data gaji pokok dan tunjangan disetting dengan benar jika ingin digenerate payrollnya."
        ]
      }
    ]
  },
  "/payroll": {
    title: "Payroll & Penggajian",
    description: "Sistem otomatisasi cetak slip gaji.",
    features: [
      {
        title: "Generate Slip Gaji",
        steps: [
          "Pilih bulan dan tahun penggajian.",
          "Pilih guru atau staf yang akan digenerate gajinya.",
          "Sistem akan menarik gaji pokok dan tunjangan dari data master.",
          "Anda bisa menambahkan lembur/potongan manual jika ada.",
          "Cetak PDF slip gaji."
        ]
      }
    ]
  },
  "/inventory": {
    title: "Inventaris Sekolah",
    description: "Daftar aset dan barang milik sekolah.",
    features: [
      {
        title: "Pencatatan Aset",
        steps: [
          "Klik 'Tambah Barang'.",
          "Masukkan Kode Barang, Nama, Jumlah, Lokasi Ruangan, dan Kondisi (Baik/Rusak).",
          "Track penyusutan aset jika diperlukan di kolom deskripsi."
        ]
      }
    ]
  },
  "/settings": {
    title: "Pengaturan Sistem",
    description: "Konfigurasi dasar aplikasi.",
    features: [
      {
        title: "Profil Instansi",
        steps: [
          "Ubah Nama Sekolah, Alamat, NPSN, dan Nomor HP yang akan muncul di Kop Surat/Struk Cetak."
        ]
      },
      {
        title: "Tahun Ajaran Aktif",
        steps: [
          "Setel Tahun Ajaran yang sedang berjalan.",
          "Ini penting karena fitur Generate SPP bergantung pada setelan tahun ajaran ini."
        ]
      },
      {
        title: "Backup & Restore",
        steps: [
          "Lakukan backup secara rutin melalui tombol Download Backup.",
          "File backup berupa format SQL.",
          "Jangan gunakan tombol 'Wipe/Reset' bila bukan kondisi darurat migrasi data awal."
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
