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
    description: "Halaman utama (Beranda) setelah Anda berhasil login. Berfungsi sebagai pusat komando yang memberikan ikhtisar (overview) menyeluruh terhadap semua kegiatan sekolah mulai dari kependidikan hingga aliran keuangan (bagi yang memiliki hak akses relevan).",
    features: [
      {
        title: "Penjelasan Menu & Alur Standard (User Flow)",
        steps: [
          "Setiap pengguna (Admin, Guru, Kepala Sekolah) masuk melalui form login.",
          "Setelah autentikasi sukses, Anda diarahkan kemari.",
          "Sistem memproses widget-widget secara real-time berdasarkan kewenangan peran Anda (Role Based Access Control).",
          "Jika layar tidak menampilkan angka, sistem mungkin sedang menghitung kalkulasi data yang sedang berjalan."
        ]
      },
      {
        title: "Cara Penggunaan Fitur Widget Statistik",
        steps: [
          "Lihat kartu-kartu angka di atas untuk ringkasan padat (Misal: Jumlah Siswa, Kas Masuk bulan ini).",
          "Widget tidak bisa di-klik untuk mengedit data; namun menyajikan agregasi mutlak dari ribuan entri di database.",
          "Bila ada kejanggalan pada metrik, periksalah pada Menu Data Master atau Laporan."
        ]
      },
      {
        title: "Cara Membaca Grafik",
        steps: [
          "Terdapat chart / grafik yang membandingkan pendapatan (Infaq) terhadap pengeluaran harian/bulanan.",
          "Arahkan (hover) kursor tetikus Anda pada lengkungan garis atau batang (bar) untuk melihat selisih riil pendapatan pada tanggal tertentu."
        ]
      }
    ],
    extraInfo: [
      "Catatan Keamanan: Modul Keuangan pada Dashboard dikunci (hidden) terhadap akun tipe Guru/Staf biasa.",
      "QA Validasi: Jika Anda berpindah Role dari Staf ke Admin via sistem, tekan tombol muat ulang (refresh) browser Anda agar statistik rekap ulang."
    ]
  },

  "/ppdb": {
    title: "Penerimaan PPDB",
    description: "Modul khusus Penerimaan Peserta Didik Baru (PPDB). Memfasilitasi sekolah dalam menampung formulir pendaftar, seleksi administrasi, hingga peresmian menjadi Siswa Aktif saat ajaran baru masuk.",
    features: [
      {
        title: "Penjelasan & Flow Penerimaan Masuk",
        steps: [
          "Pendaftaran dapat dilakukan oleh calon murid dari luar, atau didaftarkan manual oleh panitia PPDB dari dalam panel ini.",
          "Lalu formulir tersimpan dalam status 'Pending'.",
          "Panitia wajib meneliti validitas berkas (Ijazah, Akta, dll).",
          "Jika berkas valid, Kepala Sekolah / Ketua Panitia mengganti status menjadi 'Lulus'.",
          "Siswa 'Lulus' ini otomatis dikonversi ke dalam Database Siswa Induk (Data Master)."
        ]
      },
      {
        title: "Cara Tambah Pendaftar",
        steps: [
          "Klik tombol 'Tambah Pendaftar' di kanan atas layar.",
          "Ketikan Nomor Induk Kependudukan (NIK - 16 Digit).",
          "Isi formulir isian Biodata, Jalur Penerimaan, dan Orang Tua.",
          "Lalu tekan 'Simpan'."
        ]
      },
      {
        title: "Cara Validasi & Penerimaan",
        steps: [
          "Cari nama anak yang akan diseleksi pada grid tabel.",
          "Buka formulir edit (ikon Pensil).",
          "Ubah field status dari 'Pending' menjadi 'Lulus/Diterima'.",
          "Sistem menkonfirmasi untuk migrasi profil, klik 'OK/Simpan' memproses."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi: Data NIK wajib hukumnya dan tak boleh ada 2 NIK sama yang didaftarkan. Penginputan pendaftar dengan NIK ganda langsung di-reject.",
      "Konversi Data Aktif: Murid di tabel ini belum bertindak sebagai murid aktif. Jangan heran jika tidak muncul di absen; karena untuk masuk absen harus 'Lulus' lalu dimasukkan dalam Mapping Kelas oleh admin."
    ]
  },

  "/re-registration": {
    title: "Daftar Ulang",
    description: "Menu pembayaran dan konfirmasi penempatan ulang pasca penerimaan atau pasca kenaikan jenjang. Fungsi utamanya adalah validasi ikatan kewajiban bayar dimuka.",
    features: [
      {
        title: "Penjelasan & Alur Form Daftar Ulang",
        steps: [
          "List ini menampilkan siapa saja murid yang 'Lulus PPDB' tapi belum membayar Daftar Ulang.",
          "Setiap pendaftar akan diberi kewajiban biaya rincian daftar ulang (misal: Seragam, Buku).",
          "Ketika orangtua transfer, panitia mencatat pelunasan lewat sini.",
          "Setelah dilunasi, baris siswa ini berpindah status menjadi Hijau (Selesai)."
        ]
      },
      {
        title: "Cara Merekam Pembayaran Daftar Ulang",
        steps: [
          "Lihat deretan baris siswa, cari nama yang dituju.",
          "Tekan tombol aksi berwarna (Bayar/Daftar Ulang).",
          "Isi nominal setor uang tunai / transfer bank yang diterima kasir.",
          "Selesaikan verifikasi transaksi dengan menekan tombol Lunas."
        ]
      }
    ],
    extraInfo: [
      "Integrasi Ledger Keuangan: Ketika panitia menekan 'Lunas' di layar ini, nominal pembayaran tersebut mutlak dicatat otomatis ke Jurnal Umum bagian Pemasukan (Kategori: Daftar Ulang)."
    ]
  },

  "/students": {
    title: "Data Master Siswa",
    description: "Database pusat (The Single Source of Truth) untuk seluruh riwayat, personalia, akademis, dan histori catatan Siswa aktif sekolah berjalan.",
    features: [
      {
        title: "Alur Data Induk Siswa",
        steps: [
          "Siswa masuk entah lewat PPDB Terintegrasi, atau diketik manual oleh Staff TU (Tata Usaha).",
          "Profil siswa memiliki Nomer Induk Siswa (NIS) lokal dan NISN (Nasional).",
          "Selama anak ini Aktif, namanya akan selalu menempel pada raport dan presensi.",
          "Apabila ia Lulus atau Pindah pindah sekolah, kita WAJIB menggunakan menu 'Mutasi & Kenaikan' agar dia raib dari daftar, demi kerapihan data."
        ]
      },
      {
        title: "Cara Entri Siswa Manual",
        steps: [
          "Pada pojok kanan form, klik 'Tambah Siswa'.",
          "Jawab pertanyaan isian dari Tab Identitas Pribadi, Alamat tinggal, sampai Wali Orang Tua.",
          "Input field NIS sebagai id absolut anak di lembaga kita.",
          "Simpan. Jika data benar, row baru akan mengembang di tabel indeks."
        ]
      },
      {
        title: "Cara Mengedit Profil atau Koreksi Salah Ketik",
        steps: [
          "Bilik pencarian di atas (Kaca pembesar) dapat digunakan mencari NIS / Nama.",
          "Temukan siswa, klik lambang Edit (biasanya bergerigi/pensil hijau).",
          "Edit form huruf Ejaan yang keliru. Setelah beres, update tekan Simpan.",
          "Semua raport dan kartu absen yang belum dicetak hari ini akan secara instan berubah nama aslinya sesuai ejaan perbaikan Anda."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi Unikitas: Memasukkan NIS (cth: 1234) yang sudah dihuni oleh anak lain tidak ditolerir. Sistem membatalkan perintah Update anda.",
      "Klausa Deletion: Mendelete data master siswa sangat tidak dianjurkan. Praktik standar adalah Me-Mutasi / merubah statusnya NonAktif supaya historikal rapotnya tidak patah."
    ]
  },

  "/mutations": {
    title: "Sistem Mutasi & Angkat Kelas",
    description: "Akan selalu ada masa dimana murid pindah dari sekolah kita, diberhentikan (drop out), ataupun sudah saat kelulusan akhir. Panel ini adalah tombol saklarnya.",
    features: [
      {
        title: "Penjelasan Logika Mutasi",
        steps: [
          "Kondisi Mutasi Permanen: Seorang siswa dipindah sekolah.",
          "Kondisi Mutasi Selesai (Lulusan): Sekumpulan kelas diwisuda.",
          "Setelah form Mutasi ini diketuk palu, seluruh rekaman atas siswa tersebut resmi Dihentikan.",
          "Berarti besok harinya, nama dia musnah / gaib dari Presensi (absen) maupun Rapor sekolah hari ini."
        ]
      },
      {
        title: "Cara Mengeluarkan / Meluluskan Anak",
        steps: [
          "Muka halaman ini menampilkan form pencarian siswa.",
          "Cari by Nama atau NIS.",
          "Pilih tombol 'Mutasikan/Keluarkan'.",
          "Beri 'Status' keluarnya: Lulus, Pindah Sekolah, Berhenti, Dikeluarkan, Wafat.",
          "Isi baris 'Alasan spesifik' / Catatan (Cth: Pindah ke surabaya ikut bapak dinas).",
          "Kirim perintah (Submit). Proses mutasi ditandatangani final oleh sistem."
        ]
      }
    ],
    extraInfo: [
      "Tidak Bisa Undo Mutasi: Harap berhati-hati. Selevel Anda meluluskan siswa, anak itu sudah bukan domain Master Siswa Aktif lagi. Butuh campur tangan IT Admin mengubah di Database Raw untuk merestore kesalahan kelalaian mutasi masif."
    ]
  },

  "/classrooms": {
    title: "Master Data Kelas",
    description: "Indeks daftar kamar belajar atau rombongan belajar (Rombel) yang ada di naungan institusi.",
    features: [
      {
        title: "Penjelasan Relasi Rombel",
        steps: [
          "Kelas ibarat cangkang kosong (Misal 'VII-A').",
          "Cangkang ini kelak akan diisi oleh Siswa-siswi ketika staff Anda melakukan plotting.",
          "Setiap Kelas wajib punya penanggung jawab (Wali Kelas) yang posisinya menjamin keamanan rapot di akhir semester."
        ]
      },
      {
        title: "Cara Membuka Kelas Baru",
        steps: [
          "Pastikan di 'Data Guru / SDM' para tenaga pendidik sudah di-input dahulu.",
          "Lalu klik Tambah Kelas di modul ini.",
          "Tulis Nama Rombel, misal 'Kelas 7 Reguler B'.",
          "Pilih Wali Kelas dari kumpulan Dropdown yang muncul (Menyepuhkan master Guru tadi).",
          "Simpan."
        ]
      },
      {
        title: "Cara Mengganti Wali Kelas Tiap Semester",
        steps: [
          "Buka list kelas, lalu klik simbol Edit (Pena).",
          "Di Dropdown list Guru, ubah dengan figur guru baru yang mendampingi tahun ini.",
          "Simpan. Rapor baru kelak akan mencetak nama wali kelas perampingan ini."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi Integritas: Menghapus sebuah kelas ketika di dalam tabel kelas ini sudah terdaftar riwayat Penugasan atau Ujian berisiko meledakkan error yatim piatu di sisi log jadwal dan rapor. Ubah nama Rombelnya saja, ketimbang di-Delete permanen bila masih dipakai."
    ]
  },

  "/academic-years": {
    title: "Kalender Induk / Tahun Ajaran",
    description: "Jantung dari operasional (Heartbeat) sistem sekolah. Seluruh Rapor, Transaksi SPP, Daftar Hadir akan berpijak dan menanyakan Tahun Ajaran Mana yg sedang On?",
    features: [
      {
        title: "Penjelasan Rotasi Tahun",
        steps: [
          "Ketika setahun edukasi berjalan telah tuntas, Staf Tata Usaha wajib menetapkan tahun ajaran (Sem. Ganjil / Genap).",
          "Begitu di-switch, sistem mereset papan absen menjadi bersih karena siklus baru.",
          "Hanya diperkenankan satu batang tahun kalender saja yang bercap (Aktif = TRUE)."
        ]
      },
      {
        title: "Cara Pembuatan Tahun Baru",
        steps: [
          "Tekan 'Tambah'. Beri format deskriptif (2024/2025).",
          "Tentukan semester Ganjil atau Genap di dropdown.",
          "Simpan."
        ]
      },
      {
        title: "Cara Switch / Setel Mengaktifkan Tahun Berjalan",
        steps: [
          "Cari nama Tahun tersebut di daftar Grid UI.",
          "Perhatikan ada baris aksi 'Jadikan Tahun Aktif' / 'Switch'.",
          "Klik. Sistem akan melumpur / menidurkan (Non-aktifkan) tahun kemaren lama Anda, dan menumpuk semua beban logic ke entitas baru ini."
        ]
      }
    ],
    extraInfo: [
      "Konsekuensi Massif Switch: Ketika Anda berpindah Tahun Ajaran dan Semester, rapor guru-guru yang belum di cetak di semestar kemarin tidak akan bisa lagi dibuka oleh akun wali secara visual reguler."
    ]
  },

  "/transaction-categories": {
    title: "Kategori Transaksi (Chart of Accounts)",
    description: "Tempat me-label dompet uang (Kas masuk) dan Beban belanja (Kas Keluar) Yayasan. Disebut juga Buku Besar Akun Kode Perkiraan Keuangan.",
    features: [
      {
        title: "Pengenalan Jurnal Finansial",
        steps: [
          "Setiap Pemasukan (Debit) atau Uang keluar Belanja (Kredit) pastilah takkan bermakna apa-apa jika tak ada pos tag-nya.",
          "Menu ini membantu Bendahara mendaftarkan nama map belanja, misalnya 'Uang Kebersihan', 'Biaya Ekstrakulikuler', 'Honor Tak Terduga'."
        ]
      },
      {
        title: "Cara Membuat Label Kategori Belanja & Pendapatan",
        steps: [
          "Klik 'Tambah Kategori'.",
          "Beri identifikasi Nama Kategori (cth: Honor Ekstrakulikuler).",
          "Tetapkan Tipenya (Pilih Pengeluaran untuk hal di atas).",
          "Klik Simpan dan kategori ini auto-tersedia di modul pengisian Jurnal Kas."
        ]
      }
    ],
    extraInfo: [
      "QA Kunci Integritas: Apabila di dalam Jurnal ada transaksi yang sudah dibubuhkan label 'Honor Ekstrakulikuler', maka secara absolut Label tersebut tidak akan dapat Di-Hapus / di-Delete. Bendahara hanya mampu menonaktifkannya saja jika ingin tak ditampilkan di list inputan lain kali."
    ]
  },

  "/subjects": {
    title: "Mata Pelajaran (Muatan Lokal / Nasional)",
    description: "Pengorganisasian database daftar bidang studi kurikulum yang disediakan oleh entitas perguruan.",
    features: [
      {
        title: "Maksud Penamaan Pelajaran",
        steps: [
          "Agar nilai ulangan bisa dientri, sekolah terlebih dulu membikin daftar List-nya disini.",
          "Daftar mata pelajaran biasanya konsisten mulai Mapel Inti (Agama, PKn, Matematika) hingga Mapel Spesifik/Tambahan (Tahfidz, Desain).",
          "Nama mata pelajaran ini mutlak akan tersemat seutuhnya di Lembar Raport anak."
        ]
      },
      {
        title: "Cara Bikin / Tambah Mata Pelajaran",
        steps: [
          "Tekan 'Tambah Mapel'.",
          "Isikan Kode referensi internal (Mis: MTK).",
          "Isi baris Nama Pelajaran Resmi yg panjang (Mis: Matematika Lanjut Terpadu).",
          "Tentukan apakah tipe mapel Akademik biasa, atau Muatan Lokal khusus (Khusus sinkronisasi Kurikulum jika ada).",
          "Submit untuk menyimpan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi Form: Diwajibkan menset Kode unikum. Apabila kode (Pendidikan Jasmani) dengan PJOK sudah teregistrasi, penginputan Kode PJOK oleh guru kedua kalinya tidak bisa masuk server base."
    ]
  },

  "/teaching-assignments": {
    title: "Penugasan Mengajar Guru",
    description: "Panel strategis terpenting untuk peramu jadwal. Fitur inilah yang menghubungkan tiga ujung benang: (1) Siapa Gurunya? (2) Mapel Apa yang dibawakan? (3) Kelas Manakah ajarannya bertempat?",
    features: [
      {
        title: "Konsep Plotting Guru",
        steps: [
          "Perihal guru tak bisa menginput ulangan ke rapor Kelas 9 karena beliau tidak terdeteksi sistem, hal ini 100% dipicu admin belum memberi 'Penugasan' pada panel inilah.",
          "Tanpa Relasi di Penugasan Guru, aplikasi menolak mengakui Guru tersebut sebagai pengajar sah di ruangan kelas bersangkutan."
        ]
      },
      {
        title: "Cara Setting Pemberian Tugas",
        steps: [
          "Akses 'Tambah Penugasan'.",
          "Cari nama Individu (Cth: Bapak Joko).",
          "Tentukan ruangan lokasinya (Cth: Dropdown Kelas VII A).",
          "Centang atau pilih kotak Pelajaran yg Bapak Joko ajarkan di sana (Bisa lebih dari 1 pelajaran lho, misal: PKn & Sosiologi).",
          "Simpan / Rekam Tugas."
        ]
      },
      {
        title: "Cara Evaluasi & Perombakan Mengajar",
        steps: [
          "Jika Bapak Joko cuti melahirkan/izin, cari baris tugasan di Grid ini.",
          "Gunakan aksi Hapus Tugas / Ganti Guru agar hak input rapor berpindah ke Pendidik lain untuk semester depan."
        ]
      }
    ],
    extraInfo: [
      "QA Validasi Logis: Di dalam satu Kelas 7A, pada pelajaran IPA, dilarang (mustahil) mendaulat 2 guru yang sama bertugas mencetak angka rapor IPA secara independen. Sistem akan menolak Duplikasi jika menugaskan orang berbeda menimpa Mapel spesifik ruang yg sama."
    ]
  },

  "/schedules": {
    title: "Jadwal Pelajaran Kelas",
    description: "Jadwal kalender roster mingguan tempat jam mata pelajaran ditempel spesifik pada papan white board Senin s.d Jumat.",
    features: [
      {
        title: "Penjelasan Roster Terjadwal",
        steps: [
          "Sebelum bisa menempatkan nama guru disini, panitia Roster *WAJIB* menyelesaikan hal di menu Penugasan Guru tadi.",
          "Jadwal ini dipakai untuk keperluan print absen, notifikasi ngajar, dll."
        ]
      },
      {
        title: "Cara Peng-input-an Jam Mengajar",
        steps: [
          "Filter by Kelas di tabungan UI tabel (misal pilih Kelas 9).",
          "Pilih tombol 'Buat Jam Mengajar'.",
          "Berpindah hari lalu masukan blok waktu (cth: Jam 07:00 s.d 08:30).",
          "Pilih dari selectbox Mapel dan Gurunya.",
          "Sistem menampung dan menampilkan deretan kotak timetable roster."
        ]
      }
    ],
    extraInfo: [
      "QA Kesalahan Bentrok (Collision Detection): Saat Kurikulum tanpa sadar menugaskan Guru BK mengajar pada Senin Jam 08:00 di Rombel 'A' dan rombel 'B' bersamaan letaknya, Mesin kita tidak akan bodoh. Aplikasi langsung Melempar Kesalahan 'Bentrok Jadwal Guru yang Sama!'."
    ]
  },

  "/attendance": {
    title: "Absensi Presensi Siswa",
    description: "Buku kehadiran jurnal list nama murid tiap tanggal. Guru mapel maupun wali kelas bisa absen kelakuan kehadiran dengan sentuhan jari disini.",
    features: [
      {
        title: "Alur Eksekusi Log Presensi Cepat",
        steps: [
          "Idealnya presensi dioperasikan lewat gawai tab/handphone saat guru bersiap tatap muka di kelas.",
          "Pilih rombongan kelas.",
          "Sistem menampilkan set list tabel panjang siswa. Keadaan Defaultnya adalah bercentang 'Hadir' (H) semua dari server.",
          "Guru hanya perlu menekan toogle/radio tombol untuk anak yg tidak datang saja (Bolos (A), Sakit (S), atau Izin (I))."
        ]
      },
      {
        title: "Cara Finalisasi Absen (Kunci Raport harian)",
        steps: [
          "Bila sudah beres mencentang siswa bermasalah tsb.",
          "Guru / Tenaga Pengajar WAJIB SCROLL ke area dasar ujung tabel webisite.",
          "Tekan tombol final 'Submit / Rekam Kehadiran ke Sistem'.",
          "Bila berhasil, pita status warna biru notif sukses tampak. Data pun mengalir otomatis disedot masuk ke cetakan Rapor anak akhir semester."
        ]
      }
    ],
    extraInfo: [
      "Autentikasi Hak Guru: Pak Guru A dari luar kelas takkan bisa usil membuka dan mengedit lembaran absensi Kelas B bila ia bukan Wali kelas atau bukan pengajar yang terdaftar ditugaskan kesana."
    ]
  },

  "/curriculum": {
    title: "Manajemen Kurikulum & KKM",
    description: "Settingan pedoman cetak biru pendidikan formal kenegaraan, contoh K13 (Kurikulum 2013), KTSP, atau Kurikulum Merdeka (Kurmer). Dan penentuan Bobot.",
    features: [
      {
        title: "Esensi Pembobotan",
        steps: [
          "Sebuah Nilai ulangan anak tidak dinilai angka mati murni, selalu dikali dengan perbandingan bobot (Contoh presentase 70% Sumatif, 30% Formatif).",
          "Juga menentukan KKM (Kriteria Ketuntasan Minimal). Angka terendah syarat murid Lulus tidak remedial."
        ]
      },
      {
        title: "Cara Kalibrasi Format Kurikulum Nasional",
        steps: [
          "Buka pengaturan.",
          "Setel Nama Kurikulumnya.",
          "Isi baris angka batasan KKM Global Sekolah (Misalnya 75 atau 78).",
          "Atur porsi Formatif Vs Akhir Semester. Simpan."
        ]
      }
    ],
    extraInfo: [
      "Sinkronisasi Cetak Raport: Konfigurasi nama kurikulum ini akan dicetak langsung besar besar ke Lembaran Sampul Raport PDF."
    ]
  },

  "/grades": {
    title: "Input Nilai Belajar",
    description: "Kanvas Penilaian. Tabel cell-sheet bagi guru mata pelajaran guna mengisi skor ujian angka, atau predikat muridnya per kompetensi ulangan harian maupun ulangan semesteran.",
    features: [
      {
        title: "Alur Input Masif Grid Cerdas",
        steps: [
          "Guru (Berdasarkan jadwal yg di-plotting Tata Usaha) masuk ke akun pribadinya, melaju ke fitur ini.",
          "Filter / Pilih Kelas (7B) dan Pilih Pelajaran beliau (Prakarya).",
          "Terbuka sebuah list 30-40 anak memanjang ke bawah layaknya MS. Excel.",
          "Silakan isi manual angkanya '89', '80', '77', dan ketikan catatannya."
        ]
      },
      {
        title: "Cara Eksekusi Penyimpanan Angka Masal",
        steps: [
          "Guru yang bijak mengetik 40 anak hingga kelar di akhir barisan.",
          "Penting! Jangan pindah URL (Ganti Tab Halaman) sebelum anda meng-klik tombol SAVE biru di paling mentok laman tabel ke bawah.",
          "Status Tersimpan ditandai adanya pop-up Notif dari sistem pusat."
        ]
      }
    ],
    extraInfo: [
      "QA Auto-Validasi Skala Batas Error: Jika pak guru khilaf kepencet keyboar angka '788' bukannya '78'. Grid cell Nilai menolak keras angka melampauai batas konstan 100 dengan pesan peringatan UI Merah."
    ]
  },

  "/report-cards": {
    title: "Rapor Digital / E-Rapor (Enterprise Edition)",
    description: "Pusat Terminal Pelaporan Akhir Semester. Sistem cerdas yang mengintegrasikan AI, Verifikasi Digital QR, dan Snaphot Data untuk menjamin kemudahan Guru dan keamanan data raport siswa.",
    features: [
      {
        title: "Penjelasan Menu & Alur Kerja (User Flow)",
        steps: [
          "Wali Kelas masuk ke menu Rapor Digital untuk asuhan kelasnya.",
          "Sistem otomatis melakukan audit kelengkapan nilai (Cek Kelengkapan) di Step 1.",
          "Jika ada nilai bolong, guru mapel bersangkutan harus mengisi nilai di menu 'Nilai Belajar' terlebih dahulu.",
          "Wali Kelas mengisi Catatan Wali Kelas (Deskripsi Perkembangan) di Step 2.",
          "Finalisasi data, Preview hasil cetak, dan Publikasi Digital di Step 3."
        ]
      },
      {
        title: "Panduan Fitur: AI Note Assistant (Smart Engine)",
        steps: [
          "Di Step 2 (Catatan), klik tombol simbol 'Sparkles / AI' pada baris siswa.",
          "Sistem AI akan menganalisis tren nilai akademis dan data kehadiran (Alpha/Izin) siswa.",
          "AI menyarankan narasi profesional (Cth: 'Ananda memiliki fokus luar biasa di eksakta...') yang dapat diedit manual.",
          "Membantu guru menghemat waktu 80% dalam menyusun narasi rapor yang berkualitas."
        ]
      },
      {
        title: "Panduan Fitur: Real-time PDF Preview",
        steps: [
          "Di Step 3, klik ikon 'Mata' (Preview) untuk melihat draf PDF asli.",
          "Mencegah kesalahan cetak atau margin yang bergeser sebelum melakukan download massal.",
          "Preview akan menampilkan Watermark 'DRAFT' jika rapor belum dipublikasikan/dikunci."
        ]
      },
      {
        title: "Panduan Fitur: Publikasi & Snapshot Data (Lock System)",
        steps: [
          "Klik tombol 'Cloud Upload' untuk mempublikasikan rapor ke Portal Digital Siswa.",
          "Saat di-klik, sistem melakukan 'Snapshot' (Mengunci data saat ini) ke database permanen.",
          "Sekalipun nilai siswa di Menu Master diubah di kemudian hari, nilai di Rapor yang sudah 'PUBLISHED' tetap konsisten/terkunci.",
          "Ini menjamin integritas data historis sekolah (Anti-fraud/Anti-manipulasi)."
        ]
      },
      {
        title: "Panduan Fitur: Verifikasi QR Code (Secure Document)",
        steps: [
          "Setiap PDF Rapor yang diunduh kini memiliki QR Code unik di footer halaman.",
          "Orang tua atau instansi luar dapat memindai QR tersebut untuk validasi keaslian.",
          "Pindaian akan mengarah ke URL Verifikasi Resmi Velora yang menampilkan data asli dari database pusat."
        ]
      }
    ],
    extraInfo: [
      "Integritas Data: Rapor yang sudah berstatus 'TERKUNCI' tidak bisa diedit datanya tanpa bantuan Super Admin.",
      "Aesthetics: Template PDF menggunakan font premium dengan pengaturan margin otomatis untuk 10-15 mata pelajaran.",
      "QA Note: Jika QR Code tidak muncul, pastikan koneksi internet stabil saat proses Generate PDF sedang berlangsung."
    ]
  },

  "/extracurricular": {
    title: "Keanggotaan Ekstrakurikuler (Pengembangan Diri)",
    description: "Pusat aktivitas di luar jam mengajar. PMR, Paskibraka, Pramuka, KIR, dsb. Sekaligus penempelan skor predikat siswanya.",
    features: [
      {
        title: "Pendaftaran Basis Murid",
        steps: [
          "Akses panel menu Akademik > Ekstra.",
          "Pertama tama, bikin Jenis Ekskulnya dahulu dari tombol panel kanan (Cth: Marching Band).",
          "Masuk Ke sub-katalog 'Daftarkan Anggota Siswa'."
        ]
      },
      {
        title: "Cara Entri Penilaian & Predikat",
        steps: [
          "Disusul pilih List nama anak bersangkutan, tempel dirinya pada slot Marching Band.",
          "Setiap persemester diatur predikat kecakapannya. (A - Sangat Aktif, atau B - Rapi).",
          "Catat atau Submit kelar."
        ]
      }
    ],
    extraInfo: [
      "Sinkronisasi Hulu-ke-Hilir: Entri kelakuan si anak di field Marching Band ini dikompresi sedemikian rupa sehingga bila Bapaknya (Wali Kelas) menyedot PDF Raport si anak besoknya, kotak tabel Ekstrakulikuernya otomatis terisi barisan Marching band beserta Predikat 'A Sangat Aktif' tadi, tanpa harus copy paste data apa apa."
    ]
  },

  "/counseling": {
    title: "Bimbingan & Konseling (Pelanggaran Sikap)",
    description: "Modul tatib (Tata Tertib) yang mendulang point reward & punishment atas polah tingkah kelakuan santri/siswanya.",
    features: [
      {
        title: "Perekaman Histori",
        steps: [
          "Guru BK (Bimbingan konseling) mendapati anak cabut / lompat pagar.",
          "Buka Akademik > Bimbingan Konseling.",
          "Cari nama anak mabal tersebut."
        ]
      },
      {
        title: "Cara Penilaian Sosiologis (Pemberian Point / Kasus)",
        steps: [
          "Klik tambah Tragedi Kasus.",
          "Ketik jenis kasus di form (Lompat dinding), tentukan apakah ini berdampak positif (prestasi) atau negatif (pelanggaran).",
          "Berikan insentif poin (Misal Minus 30 Poin).",
          "Sertakan catatan tambahan.",
          "Submit untuk dicatat di BAP digital anak."
        ]
      }
    ],
    extraInfo: [
      "QA Kalkulasi Kinerja Realtime: Kalau anak A pada selasa cabut (-30) poin, lalu sabtu dia juara futsal (+40 poin). Dashboard BK ketika memvisualkan riwayat anak bersangkutan akan merangkum 'Skor Anak A sekarang adalah = POSITIF +10'. Menghindrai human error salah hitung akumulatif sanksi."
    ]
  },

  "/calendar": {
    title: "Kalender Akademik Event & Libur",
    description: "Kalender visualisasi event hari raya, tanggal ujian sekolah, hingga pembagian rapot.",
    features: [
      {
        title: "Visualisasi Alur & Penilaian Mading",
        steps: [
          "Semua personil dari ortu hingga guru mendambakan info kapan libur Nasional/Idul Fitri di aplikasi portal sekolahnya.",
          "Modul ini mensimulasikan full-grid Monthly View layaknya Apple Calendar."
        ]
      },
      {
        title: "Cara Input Hari Penting Baru",
        steps: [
          "Staff yang berkewajiban meriset Hari Besar mengetuk menu Kalender.",
          "Klik hari (misal 15 Juni). Muncul modal.",
          "Ketik Event Title: 'Peringatan Isra Miraj'.",
          "Tentukan rentang harinya (Mulai 15-selesai 16 Juni).",
          "Pilih Warna Tagging Label merah, lalu simpan."
        ]
      }
    ],
    extraInfo: [
      "Pameran Berantai Ke End User: Siswa juga akan dipertontonkan warna blok kalendarium bulan ini ketika buka portalnya. Admin sekolah bertanggungjawab atas keaktualan data ini agar siswa tak mis-informer ke ortunya."
    ]
  },

  "/infaq-bills": {
    title: "Tagihan Infaq & SPP Bulanan",
    description: "Sentra lalu lintas pembayaran konstan murid SPP/Syahriah perbulan. Modul yang didesain agar kasir TU bisa cepat memangkas tagihan SPP bulanan.",
    features: [
      {
        title: "Siklus Bulanan Keuangan Flow",
        steps: [
          "Saat tanggal satu, semua blok nama bulan di deret pembayaran siswa akan beralih merona merah (Belum bayar).",
          "Tata Usaha bisa menelurusi riwayat siapa yang rajin, siapa murid yg telat SPP tahunan dan total nominal hutang."
        ]
      },
      {
        title: "Cara Input Kasir (Ceklist Lunas)",
        steps: [
          "Anak datang bawa uang tunai di loby TU.",
          "TU di layar PC Keuangan > Tagihan Infaq, cari nama anak.",
          "Di deret Bar bulan tsb (Agustus), Klik Bayar Agustus.",
          "Sistem menembakkan Popup harga regulasi per bulan SPP.",
          "Masukkan nominal tunai riil anak (Bila ia pas, biarkan 150rb). Set pembayaran via TUNAI.",
          "Sahkan klik simpan Lunas Transaksi."
        ]
      }
    ],
    extraInfo: [
      "QA Relasional Ledger Database Kritis! Sistem menjamin perpaduan integrasi Keuangan Double Entry. Uang tunai murid diatas TAK SAJA meng-hijau-kan tagihannya (Lunas bulan ini dicentong). Namun Mutlak secara di balik layar (Backstage Process) menciptakan sebiji Baris 'Pemasukan Kas Tunai SPP Budi 150rb' meluncur tektok otomatis pada Buku Ledger JURNAL UMUM Utama sekolah tanpa TU capek mengetik laporan lagi dobel pusingnya."
    ]
  },

  "/tabungan": {
    title: "Tabungan Rekening Siswa Lepas",
    description: "Sebuah program rekening giro dompet mini milik sekolahan. Bertindak sebagai pemutar celengan siswa yang tiap rehat anak bisa jajan ditarik.",
    features: [
      {
        title: "Bisnis Flow Penyimpanan Buku Tabungan",
        steps: [
          "Kaya program tabungan bank.",
          "Admin akan melihat sisa Saldo bocah tiap harinya."
        ]
      },
      {
        title: "Cara Mencatat Setor Masuk Tabungan",
        steps: [
          "Masuk module Keuangan > Tabungan.",
          "Ada 2 kapabilitas 'Tarik' / 'Setor'.",
          "Cari nama anak (Contoh: Rafathar). Klik Setor Rupiah.",
          "Isi barisan teks lembaran tunai yg disetor anak misal ketik: 80,000.",
          "Submisi Simpan Data Ke rekening Database dia."
        ]
      },
      {
        title: "Cara Menarik Penarikan Oleh Anak",
        steps: [
          "Sebaliknya Anak mau minta uang keluar.",
          "Tabungan > Tombol Tarik cash. Input 40,000.",
          "Klik Cairkan, maka saldo akun anak ini melemah susut dan uang kas TU dipotong."
        ]
      }
    ],
    extraInfo: [
      "Insufisiensi Keamanan Dana QA Test: Jika anda iseng ngawur mau narik 1 Juta cash padahal celengan anak cuma mentok 2 Ribu Perak. Server AI meng-handle kebodohan ini. Sistem Menolak dengan pesona (Error Validation Insufficient Dana Tabungan) demi menjaga logika balance akunting kas."
    ]
  },

  "/wakaf": {
    title: "Dana Wakaf, Donasi Eksternal",
    description: "Pusat penerimaan instrumen pembiayaan sedekah infak temporer, iuran dana bangunan yang di donasikan oleh muhsinin di luar SPP wajib rutin.",
    features: [
      {
        title: "Arus Perekaman Inflow ZIS",
        steps: [
          "Tidak terkait sama perbulan-siswa.",
          "Penyumbang / Donatur lepas menyetor via Panitia Masjid / Sarpras / TU.",
          "Mencatat data riwayatnya dengan detil nama & program agar uangnya nanti dialokasikan secara halal dan wajar."
        ]
      },
      {
        title: "Cara Input Transaksi Pendapatan Hibah Wakaf",
        steps: [
          "Keuangan > Wakaf & Donasi.",
          "Klik Tambah Kwitansi Baru / Item Wakaf.",
          "Isikan nama spesifik Hamba Allah / Tuan A.",
          "Deskripsikan peruntukannya (Spesifik renovasi kamar mandi pria Lt 2).",
          "Nominal Donasinya. Simpanlah."
        ]
      }
    ],
    extraInfo: [
      "Pelaporan Laba Transparan: Duit wakaf ini, sesuai syariat dan aturan tata kelola ERP kita, pada saat malam closing pelaporan bulanan oleh kepsek, duit ini mutlak menyemplung tersatukan meramaikan bursa Saldo total Kas Utama yayasan di bagian 'Laporan Rugi/Laba'."
    ]
  },

  "/journal": {
    title: "Jurnal Umum Pembukuan (Buku Besar)",
    description: "Kawasan ter sakti bidang keadministrasian Finansial Sekolah. Semacam buku ledger utama yayasan. Entah itu bayar listrik, denda telat angsur, beli spidol, semua berjejak di pualam transaksi row demi row kronologis waktu disini.",
    features: [
      {
        title: "Logika Penyerap Ledger Arus Uang",
        steps: [
          "Seperti disinggung sebelumnya, baris transaksi dari 'Kantin Koperasi', 'Uang SPP', dan 'Donatur' tadi mengakar secara ghaib menjadi Record Baris panjang yang numpuk terkumpul di modul ini setiap letik jari bergetar di menu-menu sebelah.",
          "Jadi fitur utama panel ini adalah untuk Melihat / Review Kas Yayasan secara utuh murni transparan."
        ]
      },
      {
        title: "Cara Input Beban Biaya (Manual Expense) Catat Pengeluaran",
        steps: [
          "Lalu jika TU disuruh Bu Kepsek beli Galon Aqua / Listrik. Bayarnya input dimana?",
          "Buka Keuangan > Jurnal Umum.",
          "Bongkar tombol 'Catat Transaksi Manual'.",
          "Pilih arus 'Pengeluaran/Belanja' (Debit ke rekening Kas/Kredit di sistem anda).",
          "Pilih dropdown Kategori Biaya yang diatur di menu awal (Kategori Transaksi). (Cth: Utilitas Internet/Listrik).",
          "Hajar ketik angkanya 500,000, tulis Deskripsi beli tokens. Rekam Data!"
        ]
      }
    ],
    extraInfo: [
      "QA Keamanan Derivatif Audit Anti Korupsi: Bendahara mungkin terbayang untuk usil merubah 'Uang SPP Bayaran Si Ucup' dari 100k diubah jadi 0 k untuk dikorupsi diam-diam lewat menu JURNAL UMUM INI. TIDAK BISA. Fitur aplikasi mem-block aksi pengubahan (Hard Edit Record) mutasi yg disuplay oleh komponen otomatis dari modul Infaq atau Koperasi. Pembukuan hanya dapat DIBATALKAN dari modul Asalnya, BUKAN dari Jurnal Umum demi melacak kronologitas Fraud di laporan jejak (Audit log)."
    ]
  },

  "/reports": {
    title: "Rekap Laporan Komprehensif Arus",
    description: "Pusat eksport dan rekap neraca. Penghitung kalkulasi laba selisih total pemasukan - pengeluaran lembaga untuk di print dalam Rapat Pimpinan (Rapim).",
    features: [
      {
        title: "Flow Analisa Keuangan Filter Dinamik",
        steps: [
          "Aplikasi memiliki mesin kalkulus untuk mensurvey data periode Custom (Rentang Bebas).",
          "Anda dibebaskan menarik Laporan untuk skala perhari, skala semester ganjil (Juni-Desember), skala tahuan akademik full (Agustus-Juli depan)."
        ]
      },
      {
        title: "Cara Mem-build / Generate Report Angka",
        steps: [
          "Keuangan > Laporan Arus Kas.",
          "Sebutkan tipe klasifikasi parameter laporanya jika disediakan.",
          "Setting Tanggal Dari Mulai (01 Jan) dan Tanggal Batas Akhir (30 Jan).",
          "Render tekan Apply. Komputer seketika mentabulasi summary angka kas masuk (Income total) direduksi kas keluar (Expense total).",
          "Tembakan data lalu disuntikkan ke plugin Download PDF atau Excel bagi user untuk diprint fisik ke Meja yayasan direksi."
        ]
      }
    ],
    extraInfo: [
      "Bug Validation Tercover QA: Bila user memaksakan mengisi Tgl. Berakhir berada menukik di posisi temporal lebih awal lampau (Backward Time) melangkahi Tgl. Mulai. Program ini akan melempar status BadRequest karena mustahil dan mengembalikan error kalender tidak logis di form filter tanpa mencrash server."
    ]
  },

  "/teachers": {
    title: "Data Master Guru",
    description: "Arsip database profil kepegawaian ekslusif bagi Tenaga Pendidik (Ustadz/Asatidzah/PNS) instansi bersangkutan. Data nama Guru yang lahir disini bakal bersirkulasi di penugasan plotting Rapor kelak.",
    features: [
      {
        title: "Sistem Data Induk Keprofesian Pegawai",
        steps: [
          "Sebelum bikin kelas atau jadwal, menu Guru harus rampung disusun terlebih dulu.",
          "Setiap Individu di dalam sini bakal menjadi entitas utama dalam sub-sistem 'Penilaian & Payroll Gaji'."
        ]
      },
      {
        title: "Cara Perekrutan Profil Baru (Tambah Pegawai Guru)",
        steps: [
          "Kepegawaian > Data Master Guru.",
          "Klik tombol Entri Baru profil.",
          "Formulir mengangkangi data Personal (Gelar, Nama Lengkap), Data Instansi (NIP, Tanggal Bergabung, Jabatan Struktural jika ada).",
          "Masukkan parameter krusial untuk Komponen GAJI POKOK dan Tarif HONOR jam ngajar di tab Form khusus gaji.",
          "Simpankan identitasnya kedalam Database Guru aktif institusi."
        ]
      }
    ],
    extraInfo: [
      "QA Keunikan Pegawai Intansi: Serupa halnya NIK & NISN. Nomor Induk Pegawai (NIP/NIK Yayasan) diikat validasi Unik di tataran Server Database ORM (Drizzle). Kalau terjadi double NIP ketik error manusai, server menahan pelampiasan profil simpan ke storage dan menolak form tu."
    ]
  },

  "/staff": {
    title: "Data Master Staf (Tata Usaha/Karyawan Non-Ajar)",
    description: "Pengarsipan database karyawan bagian backoffice pendukung / suporter diluar korps guru ngajar (Security, Kebersihan, Keuangan, Koperasi).",
    features: [
      {
        title: "Filosofi Pemisahan Data Jabatan",
        steps: [
          "Dibikin terpisah dari Guru agar ketika ada form dropdown penentuan 'Wali Kelas' oleh panitia akademik, nama-nama Satpam Security ini otomatis terlewat / tidak dimuat di list dropdown karena berbeda nature databasenya."
        ]
      },
      {
        title: "Cara Entri Data Staf Baru",
        steps: [
          "Mirip dan senada percis irama nya dengan penambahan Guru.",
          "Kepegawaian > Data Master Staf.",
          "Isi Identitas form diri beserta struktur gajinya dan simpan rekapan."
        ]
      }
    ],
    extraInfo: [
      "Batasan Validasi (Segregation of Entity): Akurasi data Staff terjaga dari pusing campur aduk dengan Akademisi. Kepegawaian dipisahkan secara modul fungsional sehingga kalkulasi presensi / absent kerja mereka tetap aman terisolasi pada saat pengupahan Payroll nanti."
    ]
  },

  "/payroll": {
    title: "Mesin Kalkulasi Pengupahan (Payroll Gaji Bulanan)",
    description: "Sistem Komputasi Honorarium Massal. Otomator yang meracik komponen Gaji Pokok, Tunjangan fungsional struktural dilumuri Pemotongan Alpa / Absensi menjadi 1 bundel Slip nominal Gaji.",
    features: [
      {
        title: "Pola Dasar Komputasional Penggajian Mesin",
        steps: [
          "Data Inputnya adalah: Parameter dasar perindividu dari Master Guru, diramu dengan Jumlah hari Bolos di (Modul Absensi).",
          "Ketika tombol kalkulasi ditekan, aplikasi server memforsir perhitungan kompleks ke ratusan nama guru dan satpam serentak demi mempercepat kerja staf keuangan dalam hitung manual yang rewel."
        ]
      },
      {
        title: "Cara Mengeksekusi / Menggenenrate Siklus Payroll Bulanan",
        steps: [
          "HR/Keuangan buka Modul > Payroll Gaji.",
          "Pilih rentang batch / Setel Bulannya (Misal Generate Penggajian Akhir September 2025).",
          "Klik Execute Generate Gaji / Hitung.",
          "Mesin berpikir merender, dan sesaat memunculkan deretan Draft nama pegawai disandingkan kolom Angka Kalkulasi siap cair."
        ]
      },
      {
        title: "Cara Finalisasi Verifikasi & Penggembokan Pencairan",
        steps: [
          "Klik satu per satu Baris guru tsb buat melihat bedah kompoenen slipnya bila dirasa tak wajar sebelum dicetak.",
          "Bisa juga mengedit paksa manual penambahan insetif (Cth ketik lembur nginep acara 100k di textbox Tambahan) dan klik Update Angka.",
          "Tahap krusial: Tekan 'Approve & Tandai Cair Lunas'.",
          "Slip Gaji otomatis diproteksi Read-Only (Dikunci), lalu saldonya menginfek potong Kas Jurnal Yayasan."
        ]
      }
    ],
    extraInfo: [
      "Stabilitas QA State App: Saat sebuah slip gaji Bapak Ahmad sudah dilabeli bendahara sbagai Status 'Approved Paid/Lunas Pencairan', Segala bentuk fitur 'Ubah' atau 'Delete' baris gaji Pak Ahmad seketika dibuang UI-nya (Frozen Record Safeguard) guna menangkal staff bandel yang mencoba mendistorsi angka uang keluar lapor akuntan."
    ]
  },

  "/inventory": {
    title: "Manajer Inventaris Sarana Prasarana (Aset)",
    description: "Buku mutasi Logistik. Menampung data aktifa fisik entitas hardware segenap alat peraga sekolahan, proyektor, bangku, ac dlsb. Sampai pada tahapan siklus depresiasi/rusaknya material tadi.",
    features: [
      {
        title: "Sirkulasi Riwayat Asset Manajemen Flow",
        steps: [
          "Barang bertambah ketika yayasan membelinya (Aset In), dan diletakkan dalam ruangan.",
          "Admin inventaris melakukan tag update status kelangsungan usianya di kala barang itu butuh di lem biru, hilang, dicuri. Sehingga Laporan Aset di penghujung laporan tahunan berbunyi rasional."
        ]
      },
      {
        title: "Cara Mengentri Barang Keluar/Masuk Baru",
        steps: [
          "Buka Kepegawaian & Logistik > Inventaris Barang.",
          "Pilih Tambah Item Fisik Aset Baru.",
          "Buatkan Identifikasinya (Nama: AC Panasonic Ruang 7A).",
          "Beri Kode Papan Barcode nya kalau ada, tentukan Kondisinya perdana hari ini (Sangat Baik / Berfungsi).",
          "Ketikan QTY, dan harganya, Simpan."
        ]
      },
      {
        title: "Cara Penilaian Siklus Depresiasi/Kerusakan",
        steps: [
          "Anggap AC tadi jebol.",
          "Operator Sarpras buka menu Inventaris tadi, sortasi pakai search cari namanya 'AC Panasonic Bawah'.",
          "Klik 'Edit / Pembaruan Status Aset'.",
          "Turunkan grade statusnya dari 'BAIK' menyala menjadi dropdown level 'RUSAK (Diservis/Afkir/Lelang)'.",
          "Berikan narasi log history, dan Submit Perubahan Aset. Sistem mencatat jejak."
        ]
      }
    ],
    extraInfo: [
      "Audit Pencacatan Cermat QA: Mengalihkan parameter kuantitas sebuah Proyektor yang dari 5 (lima) menjadi sisal tinggal 3 di tengah proses pemakaian sistem yang sudah menempuh satu semester penuh adalah wujud dari mis-management kontrol DB Stock. Anda disarankan membikin Jurnal 'Rusak 2' biar sisa live stocknya jadi 3 pcs."
    ]
  },

  "/coop/products": {
    title: "Koperasi Unit Sekolah - Daftar SKU Produk",
    description: "Buku rak etalase Gudang logistik kulakan stok warung atau kantin operasi unit yayasan yang diperdagangkan ke publik sekolah.",
    features: [
      {
        title: "Bisnis Retail SKU Produk Inti Stok",
        steps: [
          "Ini bukan tempat kulakan jajan untuk donatur, ini buat anak anak / guru berbelanja ecer warung internal berdagang.",
          "Tanpa di-isi etalase produk pada raknya di menu ini, Aplikasi kasir (POS Transaksi) akan memunculkan layar nge-blank/kosong belaka menenggelamkan konter niaga anda."
        ]
      },
      {
        title: "Cara Memasukan Stok Dasar Barang Pemasok Ke Gudang Kita",
        steps: [
          "Staff Pengoprasian Unit Niaga membuka Laci Koperasi > Produk Item SKU.",
          "Klik Aksi 'Entri Tambah Barang Ecer Modal Baru'.",
          "Input nama produk spesifik (Mis: Buku Gambar A3 Tebal Sinar Dunia).",
          "Tetapkan Modal dasar HPP per satuan harga beli. (Sebut 3ribu perak).",
          "Tentukan profit taking Margin/Harga Edar Jual buat siswa. (Sebut 6ribu rupiah grosirnya).",
          "Ketik ketersediaan QTY kuantiti stok awal (Misal ada berdus dus kita totlah = 350 piece).",
          "Simpan Database Perdagangan."
        ]
      }
    ],
    extraInfo: [
      "Validasi Alert Rugi Cermin QA: Algoritme proteksi perniagaan disuntikan disni. Dimana jikalau Staff keliru tak waspada mensetel harga Jual-Ke-Anak sebesar 'Rp 10.000', Sementara harga HPP dari Produsen Pabrik Kulakannya pas didata terisi 'Rp 16.000' (Nombok boncoz modal). Komputer akan mencelat menjabarkan warning box merah 'Loss Margin Trade! Angka Harga Ecer Jual terlampau jatuh ketimbang Harga Beli Dasar, perbaiki form anda lantas Save lagi."
    ]
  },

  "/coop/transactions": {
    title: "Kasir Pembayaran POS Koperasi",
    description: "Aplikasi mesin telan kasir ritel gaya minimarket modern. Layar transaksional eksekutor tempat dagang berdenyut yang mereduksi jumlah stok dan menyedot cuan real-time.",
    features: [
      {
        title: "Alur Transaksi Pertukaran Barang Dengan Uang",
        steps: [
          "Konter / Teller duduk manis didepan form grid POS (Point of satış) Keranjang keranjang ini.",
          "Di deret kolom kiri, adalah Katalog List barang yang sudah dimasukkin di menu SKU Tadi.",
          "Ketika klik tombol / kartu barang di sisi Kiri, Keranjang bayar Virtual list sisi Kanan beranak merangkum item."
        ]
      },
      {
        title: "Cara Menjual dan Memfinalisasikan Pemotongan Keranjang Posisi TUNAI",
        steps: [
          "Murid (Budi) meletakkan seplastik chiki ke kasir anda.",
          "Kasir meng-klik kotak Chiki 1x. Keranjang sisi kanan menampilkan Struk Chiki x 1 Pcs = 2000 perak.",
          "Kasir menset tombol Metoda Pembayaran Tunai.",
          "Tekan tombol BAYAR SEKARANG atau Checkout Cetak Struk. (Printer mencetak karcis, Laci Uang berbunyi Ting).",
          "Selesai! Sistem detik itu juga mutlak langsung memotong Stok Chiki Induk - 1 Pcs, dan Meraup Jurnal Kasir Pemasukan Uang di Koperasi + 2000 perak."
        ]
      }
    ],
    extraInfo: [
      "QA Sinkronisasi Kuat Cerdas State Management: Baris item Chiki yang kuantitasnya nyosot ke level kritis, atau habis, maka kartu barang belanja di rak Kasir UI POS ini akan terkunci (Disabled Tombol Klik). Mencegah staff memencet benda gaib (Over-Selling kasir fiktif) dan membikin stok gudang Database menjadi Minus yang merupakan haram hukum nya di kancah perakuntansian."
    ]
  },

  "/coop/credits": {
    title: "Piutang Koperasi Santri / Siswa (Kasbon)",
    description: "Buku lecek utang / kas bon santri yang tak membawa duit di warung dan disuruh nyetelin catat tagihan hutang ke depan (ngutang di kantin).",
    features: [
      {
        title: "Flow Kasbon Lahir Merajut Asalannya",
        steps: [
          "Di Transaksi Transaksi diatas, ketika ada Murid bernama Budi jajan Chiki tapi ngutang, Kasir TIDAK MENGEKLIK tombol Tunai, Tapi tombol Tipe Kas KREDIT.",
          "Alhasil, tagihan tersebut tidak mendamparkan laba harian uang masuk kas, tapi masuk ke deretan List panel Piutang ini sebagai Tunggakan."
        ]
      },
      {
        title: "Cara Penagihan Mematikan Baris Piutang Ketika Dilunasi Ortu/Anak",
        steps: [
          "Suatu sore, Bapaknya Budi dateng untuk menyetor pelunasan hutang sembako si Chiki Budi.",
          "Pegawai buka Module Koperasi Khusus > 'Daftar Piutang'.",
          "Disana nama BUDI tertulis status Merah 'Tertunggak Kredit 10rb'.",
          "Tekan tombol 'Aksi Lunaskan/Bayar Utang' pada baris milik Budi ini.",
          "Sistem meletuskan modal peringatan Konfirmasi Penulasan kasir.",
          "Simpan. Nama si Budi luntur dari Grid Hutang Piutang tsb, dan uang tunai yg dibayar Bapak si Budi kini terangkum di Pemasukan KOperasi Hari ini secara realita."
        ]
      }
    ],
    extraInfo: [
      "Audit Pencatatan Double Loop QA Validated: Ingat, ketika si Budi Ngutang, walau uang koperasi ga nambah, tapi Benda fisiknya si Chiki udah dikonsumsi anak. Makannya Stok Gudang Chiki tetap di irisis terpotong dikurangi 1 tanpa peduli metode pembayaran Credit / Tunai. Keutuhan Stock Control mutlak dipisahkan dari Flow Financial Credit/Debet di mesin sistem ERP."
    ]
  },

  "/employee-attendance": {
    title: "Presensi Absensi Kepegawaian",
    description: "Jurnal papan tulis virtual tanda kehadiran atau ketidah hadiran, izin staf TU maupun Guru didik ngajar sebagai paramter vital pengurangan potongan gaji bila bermasalah indispliner.",
    features: [
      {
        title: "Flow Relasional Indispliner Parameter Gaji",
        steps: [
          "Setiap hari, TU pencatat atau fingerprint manual harus direkam untuk diunggah catattannya sini.",
          "Daftar Alfa dan Cuti para pendidik dikomputerisasi sebulan penuh, menumpuk dan disaring di siklus hari Payroll Slip gaji tgl 25 / Akhir bulanan tiba."
        ]
      },
      {
        title: "Cara Menandai Alfa Guru & Staf Absen Harian",
        steps: [
          "Operator memfokuskan kursor ke layar Administratife > Kepegawaian > List Absen Pegawai.",
          "Disuguhkan barbel tangal kalender absen (Pilih tanggal berapakah sekarang mau absen).",
          "List memanjang seluruh guru-staff tergelar, kondisinya disetel netral hijau (Hadir/Present) serentak oleh program.",
          "Cari nama Guru yg alfa mangkir itu hari. Dan toogle saklar tombol sebelahnya menjadi dropdown 'Sakit / Izin / Alfa (Tanpa Keterangan)'.",
          "Ketik notes medisnya kalau disodor surat.",
          "Lalu bergulir menyebur ke kedalaman page terbawah: 'SIMPAN MASAL ABSEN PEGAWAI HARIAN'."
        ]
      }
    ],
    extraInfo: [
      "QA Mesin Waktu Transaksi Immutable Presensi (Read-Only After Generate): Pada saat slip gaji seorang Guru bernama 'Pak Cecep' TAHUN ITU di BULAN MARET telah dieksekusi Finalisasi pencairanya di menu Payroll oleh bos, maka Absen kehadiran Pak Cecep sejagat rentang Maret Kemaren itu tak dapat lagi dirubah rubah riwayat kehadirannya karena telah disedot dan dipatenkan pada cetak faktur Gaji resminya."
    ]
  },

  "/letters": {
    title: "Agenda Persuratan Elektronik (Buku Ekspedisi Fisik)",
    description: "Buku register agendaris mencakup pendataan nomer antrian surat, resi fisik kedatangan pos kurir (Masuk), dan rekod surat yg menjejaki alamat eksternal (Keluar) pada lemari siber birokrat sekolah.",
    features: [
      {
        title: "Pemecahan Domain Registrasi",
        steps: [
          "Arsip Surat menyurat terpecah dari segi asalnya: Entah Berasal (Masuk) diteken dari luar kantor masuk kedalam, Ataukah diketik dilepas disetujui internal lari meluncur Keluar Pos dinas lainnya."
        ]
      },
      {
        title: "Cara Mengarsipkan Masalah Dokumen Agenda Masuk TU",
        steps: [
          "Langkah operatif TU mencatat surat undangan Rapat Dinas Diknas Kabupaten.",
          "TU buka Surat & Administratif > Persuratan. Klik Register Agenda Surat Baru.",
          "Berikan tipe form (Pilih Surat IN/Masuk).",
          "Masukkan No Identifikasi Resi Fisik Dokumen / Kop Nomor berkas dari pengirim sana di isian Form.",
          "Sebutkan tanggal titimangda (Hari Pengiriman dari cap surat fisik tsb).",
          "Input Perihal tujuan: (Sebutkan rapat pembahasan UN). Uraikan Isi Ringkas di Text Box besar bawahnya.",
          "Terakhir dan Paling Penting! Arahkan ke Form Lampiran PDF, File Explorer tergelar, silakan pilih hasil fotokopian Scan Softcopy Scan Printer Anda tersebut (PDF doc), dan Upload Simpan."
        ]
      }
    ],
    extraInfo: [
      "Validasi Pertahanan File Payload QA Limit: File extension upload filter dipasang ganda oleh MiddleWare API NextJS. Memasrahkan script .exe, .sh, .bat atau file raksasa over 5MB kepada server agenda surat tidak akan dimengerti oleh form. Sistem melontarkan amunisi 422 Invalid Media / Format Size Too Big Overload Error membebaskan keamanan bucket simpanan dokumen Cloud aplikasi."
    ]
  },

  "/announcements": {
    title: "Corong Pengumuman Digital System",
    description: "Selembar mading broadcast Toa informasi yang melecutkan notifikasi siaran (Pop Up atau Papan banner) menyala pada layar di seluruh dashboard pangkalan akun login stakeholder murid, wali, atau para gurunya.",
    features: [
      {
        title: "Sifat Targeting Audiens Logikanya Bebas Berjejaring Selektywnya",
        steps: [
          "Pengumuman Tak Perlu Diteriakkan keseluruh lorong internet pangkalan jika hanya dibutuhkan spesifik. Contoh Pengumuman 'Harap kumpul soal RPP' kan CUMA diperuntukkan User GURU BUKAN ANAK MURID.",
          "Karenanya, Pengumuman Punya fitur 'Target Bidikan Level'."
        ]
      },
      {
        title: "Cara Menyiarkan Broadcast Terfokus",
        steps: [
          "Buka Panel Informasi > Modul Rilis Pengumuman.",
          "Tekan Buat Entri Siaran Baru.",
          "Ketik subjek Judul Pengerah Perhatian (Contoh 'Libur Darurat Musim Banjir Besok').",
          "Tulisan narasinya diluaskan di textbox besar penggabung bawah.",
          "Pilih Dropdown Check mark Target Groupnya: Pilihan Centang (GURU), Centang (MURID), Centang (STAF). Biarkan Kosong Murid kalo ini spesifik Staf/Guru doang.",
          "Tetapkan Tanggal Publish Live / Mulai Siaran dan Kapan tanggal Berdengungnya Berakhir / Kering Kadaluarsa dihilangkan robot sistem nantinya.",
          "Tindis tombol Publish Pengumuman. Bertebaranlah sudah pop up kabar baru."
        ]
      }
    ],
    extraInfo: [
      "Targeting Isolation QA Firewall Check: Apabila Staf Mempublikasikan berita internal Honorarium Bonus yang tercentang hanya untuk GURU dan STAFF saja. Apabila ada seorang User Anak bernama Anton Log-in melalui HP / Desktop, sistem Dashboard Anton sama sekali tak dapat mendeteksi, melihat, merasai, apalagi menemukan URL API Get id Announcement artikel tsb (Segregated Authentication Wall)."
    ]
  },

  "/school-profile": {
    title: "Panel Profil Identitas Sekolah Resmi",
    description: "Ini bukan semacam Biodata User, ini form inti global pilar pondasi nama lembaga pendidikan, alamat geologis kenegaraan sekolah dan gambar Logo instansi kop yayasan utama kita didalam semesta ERP aplikasi.",
    features: [
      {
        title: "Arus Sentral Variabel Instansional Dinamik",
        steps: [
          "Tulisan text yang mengendap pada form data sekolah ini (seperti SDN 99 Cikarang) akan senantiasa di ekstrak (Sedot Variable Parsing Render) pada ratusan lembar nota, kwitansi koperasi, lapor PDF Arus Kas, apalagi Kop Raport E-Rapor Digital yang dicetak semua guru tiap semesternya."
        ]
      },
      {
        title: "Cara Menetapkan Atribut Logo & Identitas Lembaga Induk Server Utama",
        steps: [
          "Admin (Hanya Hak Akses Root yg diperkenankan) menyelinap masuk ke Panel Konfigurasi Global > Profil Instansi Sekolah",
          "Input nama lembaga formal nan sah di kotak 'Nama Sekolah'. Input nomer statistik sekolahan NPSN dlsb.",
          "Untuk Pasang Logo Sekolah, Drop atau unggah berkas Gambar icon (.PNG, transparan minimal).",
          "Ketik deskripsi alamat instansi yang jelas demi akurasi Header Template Struk Struk pembayaran kasir.",
          "Setel identitas Kepala Sekolah per tahun menjabat.",
          "Tekan tombol Menyimpan Perubahan Sistem (Save Setting)."
        ]
      }
    ],
    extraInfo: [
      "Cache Propagation Behavior Validation & State Rapor Engine: Saat anda mengubah Logo Instansi di pengaturan pagi ini, maka Ratusan Rapor Guru yg mendadak mendownload dan merender file PDF siang itu Langsung Berubah Seketika logonya termutasi merujuk pada Gambar Baru anda yang di save td tanpa butuh reset server backend / nunggu besok lagi (Seamless state). Terkecuali, wali kelas sudah mendiktekan di Panel Khusus KOP RAPORT spesifik mereka file gambar upload baru di menu Rapor, disitulah sistem Logo Sekolah akan Terkalahkan prioritasnya ter-override mendahulukan KOP Khusus Rapor dibanding Kop Sekolah ini."
    ]
  },

  "/settings": {
    title: "Preferensi Konfigurasi Akar (Root Settings)",
    description: "Ruang gawat darurat dan saklar otoritas paling menohok di kendalikan penuh pengembang / administrator sistem. Kontrol akses Role, resetan masif kredensial sandi pegawai, cadangan Backup file master seluruh skema database ERP semua tumpah ruah terkelola dipanel jantung server ini.",
    features: [
      {
        title: "Batas Demarkasi Red-Line Server Perilaku Peringatan Kritis",
        steps: [
          "Apapun yg Anda sikut / centang / ubah / reset / hapus format parameter dari konfigurasi tab tab tab yang bermunculan di page /settings ini dapat menelurkan efek tewas (fatal data loss) berjenjang jika diklik sembarangan tanpa literasi pengetahuan yg diampu seorang Admin TI."
        ]
      },
      {
        title: "Cara Megontrol User Akun Kredensial & Mereset Paksa Sandi Pihak Pengguna",
        steps: [
          "Sekiranya Ibu Dian (Wali 7A) kelalaian lupa kata sandi miliknya padahal sore mesti setor raport. Ibu Dian Lapor Admin TI.",
          "Admin merayap masuk ke panel Pengaturan (Settings) > Pilih Subtab Manage Otoritas Users.",
          "Cari di field data search 'Nama: Dian / Role: Guru'.",
          "Tekan Opsi Titik Tiga (Aksi), dan pilih Ganti/Paksa Reset Kata Sandi. (Setel ulang password baru seperti: dian123Aman).",
          "Bisa juga mengunci / Mematikan pernafasana User tsb Banned status agar disable tidak dibolehin Akses login bila Guru itu terbukti dipecat."
        ]
      },
      {
        title: "Cara Menarik Master Backup Cadangan Keamanan Data Internal",
        steps: [
          "Sebagai tindakan preventif musibah. Admin menyusuri tab 'Master Utilities DB Backup'.",
          "Tekan Download Ekstraks Database SQL File.",
          "Sistem me re-kompres ribuan data mulai Pendaftaran, List Murid Mutasi dan Transaksi Kas Uang Jurnal jadi bongkahan File aman yang bisa disimpan ke Hard Drive Flashdisk Eksternal Fisik anda dilaci laci kamar aman anda."
        ]
      }
    ],
    extraInfo: [
      "QA Keamanan Otentifikasi Tingkat Dewa dan Akses Bypass Testing Terisolir Mutlak (Role Privilege Intrusion Exploit Rejection): Andaikankah Staf TU 'Pintar' yg mempunyai akses ringan biasa secara iseng isengan iseng Mengetik nama link URL paksaan di Address Bar Komputernya nulis rute tujuan URL domainnya : www.webssekolahanda.com/settings lantas mendobrak enter!, Middleware Aplikasi Server kita secara kokoh menolak paksaan peretas tersebut mementalkanya jauh jauh membikinnya Terlempar redirect ke halaman 403 Access Denied Tidak Ada Akses Otorisasi! Karena levelnya bukan si SUPER Admin Root Developer. Fitur yang paling terkontrol seumur instansi terjamin kerahasiaanya."
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
