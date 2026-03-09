# MENU GLOBAL — OWNER PANEL & SUPER ADMIN
## EduVera — Platform Manajemen Pendidikan Terpadu

---

# A. OWNER PANEL (app.eduvera.id)

---

## 📊 DASHBOARD OWNER

### KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Tenant Aktif | Angka total + breakdown Trial/Aktif/Suspend |
| 2 | Tenant Baru Bulan Ini | Jumlah registrasi bulan ini |
| 3 | Tenant Akan Expired | Tenant yang expired dalam 7 hari |
| 4 | Total Siswa/Santri | Aggregasi semua tenant aktif |
| 5 | Revenue Bulan Ini | Total langganan terkonfirmasi |
| 6 | Pembayaran Pending | Jumlah yang belum dikonfirmasi |
| 7 | WA Gateway Status | Device aktif / total device |
| 8 | Error Rate | % error dari total request hari ini |

### Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Pertumbuhan Tenant | Line Chart | Per bulan, 12 bulan terakhir |
| 2 | Distribusi Status Tenant | Donut Chart | Trial/Aktif/Suspend/Expired |
| 3 | Revenue Trend | Bar Chart | Per bulan, 12 bulan terakhir |
| 4 | Distribusi Jenis Tenant | Donut Chart | Sekolah/Pesantren/Hybrid |

---

## 📋 MENU OWNER PANEL

### Manajemen Tenant
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Tenant | List semua tenant + filter status | View, Search, Filter |
| 2 | Detail Tenant | Info lengkap per tenant | View detail |
| 3 | Aktivasi Tenant | Approve registrasi baru | Aktifkan, Tolak |
| 4 | Modul Per Tenant | Feature flag per tenant | Toggle ON/OFF |
| 5 | Suspend Tenant | Suspend akses | Suspend, Reaktivasi |
| 6 | Log Tenant | Activity log per tenant | View, Filter, Export |

### Billing & Langganan
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Pembayaran | Semua tagihan langganan | View, Filter |
| 2 | Konfirmasi Pembayaran | Pembayaran pending | Konfirmasi, Tolak |
| 3 | Riwayat Pembayaran | Histori per tenant | View, Export |
| 4 | Paket Langganan | Kelola harga & modul | Edit |

### WA Gateway Master
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Device | Semua device WA terdaftar | View, Tambah, Hapus |
| 2 | Status Device | Online/Offline per device | Monitor |
| 3 | Template Pesan Global | Template default untuk tenant | Tambah, Edit |
| 4 | Log Pengiriman | Semua log WA semua tenant | View, Filter |

### Audit & Monitoring
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Activity Log | Log semua aksi platform | View, Filter, Export |
| 2 | Security Log | Login attempts, impersonation | View, Filter |
| 3 | Error Log | Error dari semua tenant | View, Filter |
| 4 | System Health | Status service & uptime | Monitor |

### Pengaturan System
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Domain Config | Wildcard subdomain | Edit |
| 2 | Email Config | Resend API config | Edit, Test |
| 3 | Backup Setting | Schedule & retensi | Edit |
| 4 | User Owner | Kelola akun tim internal | Tambah, Edit, Nonaktif |

---

# B. SUPER ADMIN — YAYASAN (app.eduvera.id/yayasan)

---

## 📊 DASHBOARD YAYASAN

### KPI Cards
| # | KPI | Detail |
|---|---|---|
| 1 | Total Tenant Yayasan | Jumlah institusi milik yayasan |
| 2 | Total Siswa/Santri | Aggregasi semua tenant yayasan |
| 3 | Total Guru/Ustadz | Aggregasi semua tenant |
| 4 | Status Tenant | Berapa aktif / trial / suspend |
| 5 | Total Pemasukan | Aggregasi keuangan semua tenant bulan ini |
| 6 | Total Pengeluaran | Aggregasi semua tenant bulan ini |
| 7 | Rapor Published | Berapa tenant sudah publish rapor |
| 8 | Notifikasi Penting | Alert dari semua tenant |

### Charts
| # | Chart | Tipe | Data |
|---|---|---|---|
| 1 | Perbandingan Siswa/Santri | Bar Chart | Per tenant |
| 2 | Tren Keuangan Lintas Tenant | Line Chart | Pemasukan 6 bulan |
| 3 | Distribusi Jenis Tenant | Donut Chart | Sekolah/Pesantren/Hybrid |
| 4 | Status SPP Lintas Tenant | Grouped Bar Chart | Lunas/Belum per tenant |

---

## 📋 MENU SUPER ADMIN

### Tenant Saya
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Daftar Tenant | List semua tenant yayasan | View, Filter |
| 2 | Detail Tenant | Info per tenant | View (read-only) |
| 3 | Akses Tenant | Masuk ke tenant tertentu | Redirect ke tenant |
| 4 | Status Modul | Modul aktif per tenant | View |

### Laporan Lintas Tenant
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Laporan Akademik | Aggregasi nilai & rapor | View, Export |
| 2 | Laporan Keuangan | Aggregasi keuangan | View, Export |
| 3 | Laporan SDM | Aggregasi pegawai | View, Export |
| 4 | Perbandingan Tenant | KPI per tenant side-by-side | View, Export |

### Pengaturan Yayasan
| # | Menu | Sub-Menu | Aksi |
|---|---|---|---|
| 1 | Profil Yayasan | Nama, Logo, Kontak | Edit |
| 2 | Akun Super Admin | Ganti password, profil | Edit |
