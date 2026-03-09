# USER & ROLES
## EduVera — Platform Manajemen Pendidikan Terpadu

---

## 1. DAFTAR ROLE

| # | Role | Scope | Deskripsi |
|---|---|---|---|
| 1 | **Owner** | Global Platform | Tim internal EduVera — akses penuh ke seluruh sistem |
| 2 | **Super Admin** | Multi-Tenant | Pemilik yayasan/lembaga — monitor & kelola semua tenant miliknya |
| 3 | **Admin Tenant** | 1 Tenant | Admin operasional satu sekolah/pesantren |
| 4 | **Kepala Sekolah / Mudir** | 1 Tenant | Akses laporan, approval, validasi rapor |
| 5 | **Guru / Ustadz / Musyrif** | Kelas / Halaqah / Asrama | Input nilai, absensi, catatan, setoran |
| 6 | **Staf** | Modul tertentu | TU, Keuangan, SDM, Sekretaris |
| 7 | **Siswa / Santri** | Data diri sendiri | Lihat jadwal, absensi, rapor, progress tahfidz |
| 8 | **Wali Murid / Wali Santri** | Data anak | Lihat rapor, tagihan, notifikasi, perizinan |

---

## 2. DETAIL AKSES PER ROLE

### 2.1 Owner (Internal EduVera)
- Akses penuh ke semua tenant dan semua data
- Bisa suspend, reaktivasi, edit modul per tenant
- Bisa konfirmasi pembayaran langganan
- Akses Owner Panel: `app.eduvera.id`
- Setiap akses ke data tenant dicatat di security log

### 2.2 Super Admin (Yayasan)
- Bisa memantau semua tenant yang dimiliki yayasannya
- Bisa lihat laporan aggregasi lintas tenant
- Tidak bisa membuat tenant baru tanpa approval Owner
- Akses: `app.eduvera.id/yayasan`

### 2.3 Admin Tenant
- Akses penuh ke semua modul yang aktif di tenantnya
- Bisa buat, edit, nonaktifkan user dalam tenant
- Bisa kustomisasi permission role dalam tenant
- Tidak bisa akses data tenant lain

### 2.4 Kepala Sekolah / Mudir / Pengasuh
- Akses read ke semua data akademik & keuangan
- Bisa validasi dan publish rapor
- Bisa approve/reject pengajuan penting
- Tidak bisa edit data operasional harian

### 2.5 Guru (Sekolah)
- Input nilai untuk mapel yang diajar
- Input absensi untuk kelas yang diajar
- Lihat data siswa kelasnya (read-only)
- Wali kelas: bisa input catatan wali kelas

### 2.6 Ustadz (Pesantren)
- **Ustadz Tahfidz**: Input setoran, penilaian tahfidz santri binaannya
- **Ustadz Diniyah**: Input absensi & penilaian halaqah yang diampu
- Tidak bisa lihat keuangan

### 2.7 Musyrif (Pesantren)
- Input absensi asrama untuk kamar yang dikelola
- Input pelanggaran santri asramanya
- Approve/tolak perizinan santri
- Input catatan harian santri

### 2.8 Staf — TU (Sekolah)
- Kelola data SDM (guru + staf)
- Kelola absensi pegawai & penggajian
- Buat & kirim pengumuman
- Kelola inventaris & surat menyurat

### 2.9 Staf — Bendahara (Sekolah & Pesantren)
- Akses penuh data keuangan
- Konfirmasi pembayaran SPP
- Input transaksi pemasukan & pengeluaran
- Buat & kelola RAPBS/Anggaran

### 2.10 Staf — Sekretaris (Pesantren)
- Kelola data SDM pesantren
- Kelola absensi & honor SDM
- Buat & kirim pengumuman
- Kelola surat menyurat

### 2.11 Siswa / Santri (Portal)
- Lihat data diri sendiri
- Lihat jadwal kelas / halaqah
- Lihat absensi diri sendiri
- Download rapor yang sudah published

### 2.12 Wali Murid / Wali Santri (Portal)
- Lihat data anak yang terdaftar
- Lihat & download rapor anak
- Lihat tagihan SPP & riwayat pembayaran
- Lihat pengumuman untuk wali
- Ajukan perizinan santri (pesantren)

---

## 3. PERMISSION SYSTEM

| Aspek | Detail |
|---|---|
| **Tipe** | Base Role + Custom Permission per Tenant |
| **Override** | Admin Tenant bisa modifikasi permission role dalam tenantnya |
| **Batasan** | Admin tidak bisa beri permission melebihi role dirinya sendiri |
| **System Role** | Owner, Super Admin — tidak bisa di-override |
| **Platform** | Web + Mobile (semua role) |

---

## 4. MATRIKS AKSES RINGKAS

| Modul | Owner | S.Admin | Admin | KS/Mudir | Guru | Bendahara | TU/Sekretaris | Musyrif | Siswa/Santri | Wali |
|---|---|---|---|---|---|---|---|---|---|---|
| Tenant Management | ✅ | 👁 (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Data Akademik | ✅ | 👁 | ✅ | 👁 | 👁 | ❌ | 👁 | ❌ | ❌ | ❌ |
| Input Nilai | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Publish Rapor | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Lihat Rapor | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ✅ (anak) |
| Keuangan | ✅ | 👁 | ✅ | 👁 | ❌ | ✅ | 👁 | ❌ | ❌ | 👁 (tagihan) |
| SDM & Gaji | ✅ | ❌ | ✅ | 👁 | ❌ | 👁 | ✅ | ❌ | ❌ | ❌ |
| Absensi Asrama | ✅ | ❌ | ✅ | 👁 | ❌ | ❌ | ❌ | ✅ (own) | 👁 (own) | 👁 (anak) |
| Pelanggaran | ✅ | ❌ | ✅ | 👁 | ❌ | ❌ | ❌ | ✅ (own) | ❌ | ❌ |
| Audit Trail | ✅ | ❌ | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> ✅ = Full Access | 👁 = Read Only | ❌ = No Access
