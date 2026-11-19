# Struktur Menu Sidebar — Management Digital

Dokumentasi daftar menu navigasi sidebar aplikasi **Management Digital** berdasarkan source code [`src/components/Sidebar.tsx`](file:///C:/Pak-Hakim/Project/Management-Digital/src/components/Sidebar.tsx).

---

## 1. UTAMA
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Dashboard** | `/dashboard` | Semua Role |

---

## 2. PENERIMAAN
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Penerimaan PPDB** | `/ppdb` | Sesuai RBAC |
| **Daftar Ulang** | `/re-registration` | Sesuai RBAC |

---

## 3. DATA MASTER
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Tingkatan Sekolah (Dinamis)** | `/school-levels` | Super Admin & Admin |
| **Jurusan** | `/majors` | Super Admin & Admin |
| **Data Siswa** | `/students` | Sesuai RBAC |
| **Mutasi & Kenaikan** | `/mutations` | Sesuai RBAC |
| **Kelas** | `/classrooms` | Sesuai RBAC |
| **Tahun Ajaran** | `/academic-years` | Sesuai RBAC |
| **Kategori Keuangan** | `/transaction-categories` | Sesuai RBAC |

---

## 4. AKADEMIK
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Mata Pelajaran** | `/subjects` | Sesuai RBAC |
| **Penugasan Guru** | `/teaching-assignments` | Sesuai RBAC |
| **Jadwal Pelajaran** | `/schedules` | Sesuai RBAC |
| **Absensi Siswa** | `/attendance` | Sesuai RBAC |
| **Manajemen Kurikulum** | `/curriculum` | Sesuai RBAC |
| **Input Nilai Siswa** | `/grades` | Sesuai RBAC |
| **Rapor Digital** | `/report-cards` | Sesuai RBAC |
| **Ekstrakurikuler** | `/extracurricular` | Sesuai RBAC |
| **Bimbingan Konseling** | `/counseling` | Sesuai RBAC |
| **Kalender Akademik** | `/calendar` | Sesuai RBAC |

---

## 5. KEUANGAN
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Infaq / SPP - LIVE** | `/infaq-bills` | Sesuai RBAC |
| **Akun Kas** | `/cash-accounts` | Sesuai RBAC *(Di-bypass untuk diagnosa)* |
| **Tabungan Siswa** | `/tabungan` | Sesuai RBAC |
| **Wakaf & Donasi** | `/wakaf` | Sesuai RBAC |
| **Jurnal Umum** | `/journal` | Sesuai RBAC |
| **Laporan** | `/reports` | Sesuai RBAC |

---

## 6. SDM
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Data Guru** | `/teachers` | Sesuai RBAC |
| **Data Staf** | `/staff` | Sesuai RBAC |
| **Payroll** | `/payroll` | Sesuai RBAC |

---

## 7. TATA USAHA
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Absensi Pegawai** | `/employee-attendance` | Sesuai RBAC |
| **Manajemen Surat** | `/letters` | Sesuai RBAC |
| **Pengumuman** | `/announcements` | Sesuai RBAC |
| **Inventaris** | `/inventory` | Sesuai RBAC |
| **Profil Sekolah** | `/school-profile` | Sesuai RBAC |

---

## 8. SISTEM
| Menu | Route / URL | Izin Role |
| :--- | :--- | :--- |
| **Pengaturan** | `/settings` | Super Admin & Admin |
