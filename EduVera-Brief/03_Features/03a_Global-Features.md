# GLOBAL FEATURES
## EduVera — Platform Manajemen Pendidikan Terpadu

---

## 1. FITUR GLOBAL — MVP (Berlaku Sekolah & Pesantren)

### 1.1 Notifikasi WA & Email
| Fitur | Detail |
|---|---|
| Channel | WhatsApp (via Fonnte/WaBlas) + Email (via Resend) |
| Trigger | SPP jatuh tempo, rapor published, absensi alpha, pelanggaran berat, perizinan, konfirmasi bayar |
| Antrian | Via Inngest (tidak blocking, retry 3x jika gagal) |
| Target | Wali murid/santri, Guru/Ustadz, SDM, Admin Tenant |
| Template | Bisa dikustomisasi per tenant per event |
| Log | Semua pengiriman dicatat (success/failed/retry) |

### 1.2 Dark / Light Mode
| Fitur | Detail |
|---|---|
| Toggle | Di topbar — icon matahari/bulan |
| Simpan | Per user (localStorage + session) |
| Support | Semua komponen via Tailwind dark: prefix |

### 1.3 Export PDF
| Fitur | Detail |
|---|---|
| Dokumen | Rapor siswa/santri, Laporan keuangan, Slip gaji/honor, Struktur organisasi, Surat keterangan |
| Generate | Via Puppeteer melalui Inngest background job |
| Storage | Tersimpan di Cloudflare R2 |
| Akses | Signed URL (TTL 1 jam), tidak ada public URL |
| Branding | Logo tenant, nama institusi, tanda tangan digital |

### 1.4 Export Excel
| Fitur | Detail |
|---|---|
| Cakupan | Semua halaman tabel data (siswa, santri, nilai, keuangan, absensi, SDM) |
| Format | .xlsx |
| Trigger | Tombol Export di setiap halaman list |

### 1.5 Audit Trail
| Fitur | Detail |
|---|---|
| Cakupan | Semua aksi write (CREATE, UPDATE, DELETE, PUBLISH, APPROVE) |
| Data | User, waktu, aksi, tabel, nilai lama, nilai baru, IP address |
| Sifat | IMMUTABLE — tidak bisa diedit atau dihapus |
| Akses | Owner: semua tenant. Admin: tenant sendiri. |
| Retensi | Minimum 2 tahun |

### 1.6 Realtime Dashboard (SSE)
| Fitur | Detail |
|---|---|
| Teknologi | Server-Sent Events (SSE) via Upstash Redis Pub/Sub |
| Update | Widget dashboard update otomatis tanpa reload halaman |
| Cakupan | KPI cards, status rapor, absensi hari ini, perizinan pending |

---

## 2. FITUR GLOBAL — POST-MVP

| # | Fitur | Deskripsi |
|---|---|---|
| 1 | **PWA** | Installable di HP, app-like experience |
| 2 | **Offline Mode** | Beberapa fitur bisa dipakai tanpa internet (via service worker) |
| 3 | **Push Notification** | Browser/HP notification |
| 4 | **2FA** | Two-Factor Authentication (TOTP) |
| 5 | **SSO** | Single Sign-On untuk enterprise |
| 6 | **Public API** | API untuk integrasi pihak ketiga |
| 7 | **Payment Gateway** | Midtrans untuk SPP & langganan otomatis |

---

## 3. FITUR E-RAPOR (Sekolah & Pesantren) — MVP

| # | Fitur | Detail |
|---|---|---|
| 1 | Bulk Generate | Generate rapor semua siswa/santri sekaligus via Inngest |
| 2 | Tanda Tangan Digital | Kepala Sekolah / Mudir / Pengasuh |
| 3 | QR Code Verifikasi | Kode unik per rapor, verifiable di eduvera.id/verify/[kode] |
| 4 | Custom Branding | Logo, nama institusi, nama kepala, nama wali kelas/ustadz |
| 5 | Flow Lengkap | Preview → Draft → Publish → Arsip |
| 6 | Akses Wali | Wali bisa lihat & download setelah published |
| 7 | Immutable Arsip | Rapor yang published tidak bisa dihapus |

---

## 4. FITUR KEUANGAN (Sekolah & Pesantren) — MVP

| # | Fitur | Detail |
|---|---|---|
| 1 | Auto Generate SPP | Tagihan bulanan otomatis per siswa/santri aktif |
| 2 | Konfirmasi Manual | Admin konfirmasi pembayaran → update status lunas |
| 3 | Riwayat Pembayaran | Per siswa/santri lengkap |
| 4 | Notifikasi WA | Saat tagihan terbit & setelah lunas ke wali |
| 5 | RAPBS / Anggaran | Buat anggaran + realisasi otomatis ter-update |
| 6 | Laporan Lengkap | Kas, laba rugi, anggaran — export PDF & Excel |
| 7 | Audit Trail | Semua transaksi immutable |
| 8 | Warning Anggaran | Alert jika kategori < 10% sisa anggaran |

---

## 5. FITUR SDM (Sekolah & Pesantren) — MVP

| # | Fitur | Detail |
|---|---|---|
| 1 | Generate Slip Gaji | Otomatis dari absensi + jam mengajar |
| 2 | Rekap Absensi | Bulanan, dikunci akhir bulan |
| 3 | Struktur Organisasi | Visual bagan, exportable PDF |
| 4 | Broadcast Pengumuman | WA & Email ke role tertentu via Inngest |

---

## 6. FITUR OWNER PANEL — MVP

| # | Fitur | Detail |
|---|---|---|
| 1 | Monitor Tenant | Status, paket, aktivitas semua tenant |
| 2 | Feature Flag | Enable/disable modul per tenant |
| 3 | Suspend & Reaktivasi | Dengan notifikasi ke admin tenant |
| 4 | Konfirmasi Langganan | Manual approval pembayaran |
| 5 | Log Global | Activity log + security log seluruh platform |

---

## 7. FITUR PORTAL SISWA/SANTRI/WALI — MVP

| # | Fitur | Detail |
|---|---|---|
| 1 | Lihat Jadwal | Jadwal pelajaran / halaqah |
| 2 | Lihat Absensi | Riwayat absensi diri sendiri |
| 3 | Lihat Nilai | Nilai per mapel (siswa) / progress tahfidz (santri) |
| 4 | Download Rapor | Rapor yang sudah published |
| 5 | Lihat Tagihan | Status SPP & riwayat bayar (wali) |
| 6 | Perizinan | Ajukan izin santri (wali & santri pesantren) |
| 7 | Pengumuman | Pengumuman yang ditujukan ke role masing-masing |
