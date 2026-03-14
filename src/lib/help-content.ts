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
    description: "Halaman utama pertama kali Anda login. Menampilkan grafik ringkasan aktivitas dan metrik kunci sekolah secara visual.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Login ke dalam sistem menggunakan email & password.",
          "Secara otomatis diarahkan ke halaman Dashboard.",
          "Widget statistik akan menampilkan data real-time (jumlah siswa, kas, dsb)."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Menguji hak akses (RBAC). Jika login sebagai Guru, widget finansial akan disembunyikan. Jika login sebagai Admin, widget finansial akan tampil penuh."
    ]
  },
  "/ppdb": {
    title: "Penerimaan PPDB",
    description: "Fitur untuk mendata calon murid baru, merekam dokumen mereka, hingga menentukan kelulusan.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Penerimaan > Penerimaan PPDB, klik Tambah Pendaftar.",
          "Isi formulir pendaftar termasuk NIK Anak.",
          "Simpan data. Data akan masuk ke tabel dengan status Pending.",
          "Admin memverifikasi dengan klik Edit lalu ubah status menjadi Lulus/Diterima."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: NIK bersifat wajib dan UNIQUE. Jika NIK kosong, form error. Jika NIK ganda/duplikat, sistem akan menampilkan Error NIK sudah terpakai."
    ]
  },
  "/re-registration": {
    title: "Daftar Ulang",
    description: "Mencatat konfirmasi ulang pembayaran siswa baru atau siswa lama yang naik jenjang kelas.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Penerimaan > Daftar Ulang.",
          "Klik tombol Daftar Ulang pada baris siswa tujuan.",
          "Masukkan nominal pembayaran lalu simpan.",
          "Status siswa akan luntur/berubah menjadi Lunas Daftar Ulang."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Input nominal divalidasi sebagai Numeric/Angka. Jika diketik huruf, sistem menolak. Pembaruan status akan sinkron ke profil siswa."
    ]
  },
  "/students": {
    title: "Data Siswa",
    description: "Pusat database profil seluruh siswa aktif yang belajar di sekolah.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Data Master > Data Siswa.",
          "Pencarian bisa dilakukan via kotak Search.",
          "Untuk input baru: klik Tambah Siswa, isi NIS, Nama, TTL, dll lalu Simpan.",
          "Untuk update: klik icon Edit/Pensil di baris tabel siswa."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Sama seperti NIK, NIS adalah Unique. Jika Admin menginput NIS yang sudah dimiliki siswa lain, database akan mengembalikan Error duplicate."
    ]
  },
  "/mutations": {
    title: "Mutasi & Kenaikan",
    description: "Mencatat arsip murid yang berpindah sekolah, dikeluarkan, atau telah lulus.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Data Master > Mutasi & Kenaikan.",
          "Klik Tambah Mutasi, cari dropdown nama anak.",
          "Pilih Status mutasi (Keluar/Lulus) dan Tanggal.",
          "Simpan untuk memutasi secara permanen dari kelas reguler."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Anak yang telah disubmit mutasinya harus otomatis hilang (ter-filter non-aktif) dari deretan tabel Siswa Aktif berjalan."
    ]
  },
  "/classrooms": {
    title: "Kelas",
    description: "Mendefinisikan ruangan atau rombongan belajar (misal: Kelas VII-A).",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Data Master > Kelas.",
          "Klik Tambah Kelas dan input nama Rombel.",
          "Pilih dropdown Wali Kelas (mengambil dari master guru).",
          "Simpan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Daftar opsi dropdown Wali Kelas di-fetch langsung dari Database Guru. Jika sistem belum ada input Guru sama sekali, dropdown akan kosong."
    ]
  },
  "/academic-years": {
    title: "Tahun Ajaran",
    description: "Pengaturan kurun waktu semester berjalan. Ini adalah penentu global state sistem akademik.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Data Master > Tahun Ajaran.",
          "Klik Tambah, masukkan nama Tahun Ajaran (misal 2024 Genap).",
          "Cari di tabel, lalu klik tombol 'Set Aktif' pada TA tersebut."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Sistem aturan Strict: Hanya boleh ada 1(Satu) tahun ajaran aktif. Jika TA baru di-set Aktif, TA yang lama otomatis tercabut status Aktifnya."
    ]
  },
  "/transaction-categories": {
    title: "Kategori Keuangan",
    description: "Label referensi untuk membedakan jenis transaksi pada Jurnal Umum Pemasukan dan Pengeluaran.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Data Master > Kategori Keuangan.",
          "Klik Tambah Kategori.",
          "Pilih Tipe dan Namai kategori (cth: Biaya Rapat Bulanan)."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Skenario Restriksi Penghapusan: Apabila label kategori 'Biaya Rapat' ini sudah pernah dipakai di form Jurnal Umum, label ini tidak akan bisa dihapus demi menjaga Integritas Data pembukuan."
    ]
  },
  "/subjects": {
    title: "Mata Pelajaran",
    description: "Indeks penamaan ilmu pengetahuan yang diajarkan di Sekolah.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > Mata Pelajaran.",
          "Klik Tambah Mata Pelajaran.",
          "Isi Kode (BI-01) dan Nama Pelajaran secara lengkap."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Kode Mapel adalah mandatori (Wajib). Form tak bisa disubmit bila Kode Mapel dibiarkan kosong."
    ]
  },
  "/teaching-assignments": {
    title: "Penugasan Guru",
    description: "Menu esensial untuk menghubungkan seorang Guru, ruang Kelas, dan Mata Pelajaran yang diembannya.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > Penugasan Guru.",
          "Klik Tambah Tugas.",
          "Pilih Guru pencarian, Pilih Kelas, lalu Centang Mapelnya. Submit."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Sebagai batas Logika Aplikasi, jika tahap mapping/penugasan ini dilangkahi, maka Guru yang bersangkutan tidak akan pernah bisa melihat/menemukan Kelas/Mapel itu di layar Input Nilainya ketika IA login."
    ]
  },
  "/schedules": {
    title: "Jadwal Pelajaran",
    description: "Roster agenda belajar harian spesifik dengan range waktu.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > Jadwal Pelajaran.",
          "Filter Kelas dan pilih Tab Hari (misal: Senin).",
          "Tambah Slot jam (07:00-08:00) lalu posisikan mapping guru yang sudah dibuat."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Uji Konflik Interval: Jika Administrator salah meng-assign Guru A di jam 07:00 Senin untuk Kelas VII-B padahal Guru A sudah ada jadwal di VII-A, AI/Server akan menahan (Blocking) proses penyimpanan."
    ]
  },
  "/attendance": {
    title: "Absensi Siswa",
    description: "Log daftar hadir dan ketidakhadiran harian per kelas.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Guru login, masuk ke Akademik > Absensi Siswa.",
          "Ganti filter ke Kelas yang diajarnya dan Tanggal hari ini.",
          "Sistem menampilkan seluruh nama anak (Defaultnya Hadir).",
          "Ubah dropdown status murni anak yang tidak hadir saja.",
          "Wajib menggulir ke bawah lalu tekan tombol 'Simpan Semua Absen'."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Mutasi persisten: setelah disubmit, bila kita refresh ulang halaman dan filter dipasang pada tanggal tersebut, status list absensi siswa tak akan hilang dan tetap berubah di database system."
    ]
  },
  "/curriculum": {
    title: "Manajemen Kurikulum",
    description: "Penetapan blueprint standar kelulusan KKM atau Kriteria Capaian.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > Manajemen Kurikulum.",
          "Tetapkan default nilai batas bawah KKM. Simpan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Berakibat hilir pada fitur Nilai Rapor: Bila hasil ujian siswa dibawah rasio KKM (misal 74 < 75), angka di cetak rapor akan diberikan indikator merah."
    ]
  },
  "/grades": {
    title: "Input Nilai Siswa",
    description: "Tempat guru menyetor angka hasil ujian ulangan formatif maupun ujian sumatif siswa.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Guru membuka Akademik > Input Nilai.",
          "Set Filter Kelas, Mapel, dan Jenis Evaluasi.",
          "Muncul layar cell grid, guru mengetik beban nilai ke kolom grid siswa.",
          "Klik Simpan Nilai Semua."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Validasi Tipe Data Input: Coba Input bobot '-8' (minus) atau text abjad 'Kosong', server dan Input Type HTML akan me-reject isian tersebut menjadi invalid batasan nilai 0 - 100."
    ]
  },
  "/report-cards": {
    title: "Rapor Digital",
    description: "Generator final penarikan nilai, absen, dll menjadi 1 form raport berformat PDF.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > Rapor Digital.",
          "Di deretan siswa, tekan tombol kuning 'Cetak PDF Rapor'.",
          "Mesin merekap kompilasi, mendownload file."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Pengujian Null Fallback: Jika seorang murid bolos dan sama sekali kelupaan dientri nilai Matematikanya, mesin Rapor TIDAK BOLEH error, namun harus merender kolom kosong bernilai stip (-)."
    ]
  },
  "/extracurricular": {
    title: "Ekstrakurikuler",
    description: "Pelekatan label keanggotaan ekskul siswa beserta scoring-nya.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > Ekstrakurikuler.",
          "Klik Pendaftaran Siswa Baru ekskul, cari nama murid, pilih Kelompok (mis: Pramuka).",
          "Berikan Predikat hurufnya (A/B/C) lalu save."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Hasil input parameter ekstrakurikuler wajib ikut ter-fetch secara real time ke deret bawah Lembaran Rapor Anak pada saat dicetak PDF oleh Wali Kelas."
    ]
  },
  "/counseling": {
    title: "Bimbingan Konseling",
    description: "Catatan histori disipliner, perolehan poin penegakan tatib negatif/positif oleh BK.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Akademik > BK.",
          "Tambah Catatan Kasus, pilih terpidana/siswa, pilih Jenis Pelanggaran.",
          "Tulis keterangan dan Submit."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Mesin Kalkulasi Agregat QA: Jika anak membuat 2 pelanggaran yang masing-masing hukumannya bernilai 20 poin minus, Layar Profil Rekap Siswa akan mengkalkulasi secara instan 'Poin Anak Ini = -40'. Perhitungan mutlak."
    ]
  },
  "/calendar": {
    title: "Kalender Akademik",
    description: "Mading agenda tahurnan dan liburan nasional untuk sekolah.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Operator Akademik membuka menu.",
          "Arahkan ke tgl pada calendar view, insert Event 'Cuti Bersama' warna Hijau."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Bila seorang Siswa mengakses jadwal ini, ia hanya boleh menatap secara Read-Only (view restricted access). Tak ada tombol edit di level user tsb."
    ]
  },
  "/infaq-bills": {
    title: "Infaq / SPP",
    description: "Papan pembayaran bulanan SPP per anak secara transaksional bulanan.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Keuangan > Infaq/SPP. Filter pencarian atas Nama/NIS Anak.",
          "Sistem memperlihatkan grid kotak bulan.",
          "Klik Bayar di boks bulan berjalan (misal Oktober).",
          "Isi Pop-up nominal dan cara pembayaran, lalu Submit Lanjutkan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Keuangan ACID: Ketika pembayaran selesai, bukan hanya balok bulan Oktober lunas, melainkan Database Ledger Jurnal Umum Yayasan mutlak langsung menerima debet kas uang masuk agar tak terjadi penginputan ganda oleh staff."
    ]
  },
  "/tabungan": {
    title: "Tabungan Siswa",
    description: "Titipan saldo uang siswa.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Akses Keuangan > Tabungan Siswa.",
          "Terdapat 2 aksi: Setor dan Tarik.",
          "Untuk penarikan tunai, pilih Tarik dan input beban tarik. Simpan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Limit Eksekusi QA: Bila saldo bocah tsb realnya 10rb, lalu kasir menarik 50k rupiah, sistem Wajib mendeteksi insufisiensi dan membatalkan proses database penarikan itu secara mutlak."
    ]
  },
  "/wakaf": {
    title: "Wakaf & Donasi",
    description: "Buku rekening terpisah untuk program sosial & sumbangan lepas.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Keuangan > Wakaf & Donasi.",
          "Masukkan nama instansi Donatur, niatan program, dan sumbangan nominalnya."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Dana tersebut akan terkompilasi menyatu dalam Jurnal Saldo debit sekolah jika skemanya adalah Sentralisasi Kas Institusi."
    ]
  },
  "/journal": {
    title: "Jurnal Umum",
    description: "Ledger utama kasir yayasan. Seluruh transaksi kas bendahara dan arus uang bulanan anak berkumpul disini.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Keuangan > Jurnal Umum.",
          "Klik Catat Tangan/Manual. Pilih Jenis Pengeluaran.",
          "Isi parameter form (Misal uang bayar internet indihome 400k). Simpan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Transaksi SPP Lunas bulanan siswa TIDAK DAPAT diedit apalagi ditimpa lepas melalui Jurnal Umum. Harus ada kunci (Lock Mutation for Internal Derived Rows)."
    ]
  },
  "/reports": {
    title: "Laporan",
    description: "Pengekstrakan dokumen rekap kalkulasi Laba Rugi kas berdasar seleksi jarak penanggalan.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Ke Keuangan > Laporan. Tentukan Tipe report Laporan Arus Kas.",
          "Isi custom date range Tanggal Mulai dan Tanggal Usai.",
          "Tekan Generate/Download XLS/PDF."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Filter Validation Rules: Tanggal Berakhir diisi bln Feb, Mulai diisi Mar. Tanggal mundur ini harus dilarang oleh library Date Picker atau Middleware API validasi."
    ]
  },
  "/teachers": {
    title: "Data Guru",
    description: "Database pokok spesialis tenaga kependidikan pns/honorer sekolah.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Ke SDM > Data Guru. Tambah Profil baru NIP bersangkutan.",
          "Pastikan mengisi nominal Rate Gaji Pokok bagi individu di input form agar Payroll berjalan nanti."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: NIP itu Bersifat unik per profil. Guru di tabel ini akan terekspos datanya ditarik menuju Modul 'Data Penugasan'."
    ]
  },
  "/staff": {
    title: "Data Staf",
    description: "Tenaga SDM non mengajar (Tata usaha, Sarpras, Keamanan).",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Ke SDM > Data Staf. Tambah Profil Staf. (Format flow serupa dengan Entri Guru)."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Staf kebersihan tidak boleh muncul ke dalam list dropdown 'Pemilihan Wali Kelas' di Akademik. (Role Segmentation Testing)."
    ]
  },
  "/payroll": {
    title: "Payroll",
    description: "Kalkulator massal honorarium bulanan PNS dan Guru berdasar checklok/potongan.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka SDM > Payroll. Set Bulan. Klik Tombol Generate Kalkulasi Gaji.",
          "Lakukan Verifikasi dan Edit Ekstra bilamana ada penambahan lembur manual.",
          "Bila fix, Klik Approve Slip per nama guru."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: State Freeze: Slip gaji honor atas nama Bapak X bila sudah terstatus 'Approved Liquid', tombol Hapus (Delete) / Rekayasa angka menjadi terkunci total untuk menjaga history."
    ]
  },
  "/inventory": {
    title: "Inventaris",
    description: "Manajemen siklus status alat material lembaga.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Ke SDM > Inventaris. Klik Tambah Barang (Cth: Proyektor). Setting Barang Baru = Status BAIK, QTY = 1 pcs."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Siklus Live status: Nanti saat hilang/rusak, Admin meng-update barisnya jadi status RUSAK. Jejak audit akan melengkapi laporan Asset tahunan."
    ]
  },
  "/coop/products": {
    title: "Produk Koperasi",
    description: "Etalase Rak master setting harga beli dan jual dagangan retail.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Petugas mambuka Koperasi > Produk. Klik Tambah Item SKU",
          "Set Modal Beli Kaos Kaki = 8rb. Set Jual = 10rb. Tentukan QTY Stok awal = 50. Simpan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Peringatan Margin Loss: Jika Harga Modal dibeli = 15rb namun Harga Dijual kembali = 10rb. Alert UI perlu menampilkan teguran 'Harga eceran di bawah standar modal'."
    ]
  },
  "/coop/transactions": {
    title: "Transaksi / Kasir",
    description: "Mesin konter Point of Sales untuk perputaran barang terjual.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka Transaksi Kasir. Muncul display keranjang.",
          "Tekan produk, tagihan otomatis tampil. Ubah jenis Pembayaran Tunai.",
          "Klik Bayar dan Cetak Struk."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Trigger Inventory Mutasi: Segera sesudah Lunas, Stok Barang yang awalnya 50 mutlak teriris 1 pcs menjadi 49 unit tanpa delay."
    ]
  },
  "/coop/credits": {
    title: "Piutang Siswa",
    description: "Faktur list hutang/bon siswa yang menahan pembayaran pada saat belanja.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Petugas Kasir di Transaksi POS mengatur tipe pembayaran 'Kredit Piutang'. Setel nama Murid.",
          "Admin buka tab Koperasi > Piutang. Nama Siswa tersebut auto-terdampar di list ini sbagai defisit bayar."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Sewaktu Piutang dilunasi, Ledger Piutang tertutup (berubah status) dan uang cash menyetor kembali ke total Jurnal Pemasukan Koperasi pada penutupan sesi itu."
    ]
  },
  "/employee-attendance": {
    title: "Absensi Pegawai",
    description: "Jurnal finger/ketidakhadiran kerja guru/staff yang berkonsekuensi pada potong gaji payroll.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Masuk Tata Usaha > Absen Pegawai. Pilih Date Today.",
          "Ubah status NIP bermasalah (misal telat). Simpan Mutasi presensi."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Integrasi Payroll: Status Alfa di hari ini akan tersedot rumusnya kelak pas akhir bulan saat Sistem merumuskan slip gaji."
    ]
  },
  "/letters": {
    title: "Manajemen Surat",
    description: "e-Arsip disposisi agendaris nomer surat fisik baik external maupun internal dinas.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka TU > Manajemen Surat. Upload Surat Keluar.",
          "Input Perihal, Nomer Induk Dokumen, Instansi dituju lalu Unggah softcopy scanned PDF."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Limit Ekstensi Form Upload: Pengujian QA menyuntik File `Aplikasi.exe`. Endpoint sistem Wajib memblokir (hanya menerima PDF/Gambar min. Size limit)."
    ]
  },
  "/announcements": {
    title: "Pengumuman",
    description: "Toa / mading lonceng Broadcast pop up peringatan ke end-user.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Buka TU > Pengumuman. Tekan Buat Pengumuman.",
          "Setel Targeting Level/Role: Misal Centang GURU saja. Disimpan ke publik."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Broadcast Segregation Logic: User murid yang online di tab browsernya, inbox notifnya tetap senyap. Pesan hanya meletus secara presisi kepada User akun Level Guru."
    ]
  },
  "/school-profile": {
    title: "Profil Sekolah",
    description: "Indikator Master Identitas Kop Sekolah dan stempel instansi digital.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Ke profil lembaga, admin memasukkan Text Nama: 'SDN 1 Jakarta', NPSN, Logo PNG.",
          "Simpan setelan konstan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Relasi Variabel Global: Template seperti 'Cetak Raport' harus memparsing kop teks SDN 1 Jakarta ini secara dinamik."
    ]
  },
  "/settings": {
    title: "Pengaturan",
    description: "Jantung kontrol root Superadmin Role terhadap parameter Security Credentials sistem.",
    features: [
      {
        title: "Alur Standard (User Flow)",
        steps: [
          "Hanya Login Akun SUPERADMIN. Masuk ke panel Sistem > Pengaturan.",
          "Masuk Master Hak Akses & Users. Edit Profile staf dan 'Reset Password default'."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Middleware Routing Test (Hack Protection): Bila seorang Guru tanpa hak akses memaksa via URL bar: /settings, sistem akan me-redirect Guru itu dengan HTTP 403 Access Denied."
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
