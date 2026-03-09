# PROJECT OVERVIEW
## EduVera — Platform Manajemen Pendidikan Terpadu

---

## 1. IDENTITAS PRODUK

| Atribut | Detail |
|---|---|
| **Nama Produk** | EduVera |
| **Tagline** | Platform Manajemen Pendidikan Terpadu untuk Sekolah & Pesantren Indonesia |
| **Tipe** | SaaS Multi-Tenant |
| **Platform** | Web (Mobile-ready via Responsive + PWA Post-MVP) |
| **Target Market** | Nasional — seluruh Indonesia |
| **Versi** | MVP v1.0 |

---

## 2. DESKRIPSI PRODUK

EduVera adalah platform SaaS berbasis web yang dirancang khusus untuk membantu pengelolaan operasional **sekolah dan pesantren di Indonesia** secara terpadu dalam satu sistem.

Platform ini menggabungkan manajemen **akademik, keuangan, SDM, kepesantrenan, tahfidz, dan diniyah** dalam satu dashboard yang bisa diakses oleh seluruh pihak — kepala sekolah, guru, bendahara, musyrif, wali murid, hingga siswa dan santri.

EduVera mendukung tiga model institusi:
- **Sekolah murni** (PAUD/TK, SD/MI, SMP/MTs, SMA/MA, SMK)
- **Pesantren murni** (Boarding full)
- **Hybrid** (Sekolah + Pesantren dalam satu lembaga)

---

## 3. LATAR BELAKANG & MASALAH

| Masalah | Kondisi Saat Ini |
|---|---|
| Rapor manual | Dibuat di Word/Excel, tidak konsisten, rawan kesalahan |
| SPP tidak terintegrasi | Dikelola terpisah dari sistem akademik |
| Absensi manual | Rekap memakan waktu, tidak realtime |
| Pesantren tanpa sistem | Tahfidz, asrama, kepesantrenan semua manual |
| Wali tidak bisa pantau | Tidak ada portal wali yang terintegrasi |
| Data terfragmentasi | Setiap bagian pakai aplikasi berbeda |

---

## 4. SOLUSI

EduVera hadir sebagai solusi **all-in-one** yang:
- Terjangkau untuk institusi pendidikan Indonesia
- Mudah digunakan oleh pengguna non-teknis
- Dirancang sesuai konteks pendidikan Islam dan nasional
- Mendukung kurikulum K13, Merdeka, Kemenag, dan Custom
- Mendukung kalender Hijriah untuk pesantren

---

## 5. MODEL BISNIS

| Aspek | Detail |
|---|---|
| **Model** | Subscription berbasis modul (Bulanan / Tahunan) |
| **Trial** | 14 hari gratis, bisa diperpanjang manual oleh Owner |
| **Aktivasi** | Manual approval oleh Owner EduVera |
| **Pembayaran MVP** | Konfirmasi manual (transfer bank) |
| **Pembayaran Post-MVP** | Payment Gateway otomatis via Midtrans |
| **Modul** | Diaktifkan/nonaktifkan per tenant sesuai kebutuhan |
| **Plan** | Basic / Pro / Enterprise |

---

## 6. TARGET PASAR

| Segmen | Deskripsi |
|---|---|
| Sekolah Umum | SD, SMP, SMA, SMK negeri/swasta |
| Madrasah | MI, MTs, MA di bawah Kemenag |
| PAUD / TK | Lembaga pendidikan anak usia dini |
| Pesantren | Boarding school tradisional & modern |
| Hybrid | Sekolah Plus Pesantren (fullboard) |
| Yayasan | Multi-tenant: mengelola beberapa institusi sekaligus |

---

## 7. SKALA & TARGET

| Fase | Target Tenant | Keterangan |
|---|---|---|
| MVP | 1 – 50 tenant | Fokus stabilitas & fitur inti |
| Growth | 50 – 500 tenant | Optimasi performa & skalabilitas |
| Scale | 500+ tenant | Review arsitektur, potensial microservice |

---

## 8. URL STRUKTUR

| URL | Fungsi |
|---|---|
| `eduvera.id` | Landing Page publik |
| `app.eduvera.id` | Owner Panel (Internal EduVera) |
| `app.eduvera.id/yayasan` | Super Admin Dashboard (Yayasan) |
| `[tenant].eduvera.id` | Tenant App (Sekolah/Pesantren) |
| `[tenant].eduvera.id/siswa` | Portal Siswa |
| `[tenant].eduvera.id/santri` | Portal Santri |
| `[tenant].eduvera.id/wali` | Portal Wali Murid/Santri |
| `eduvera.id/verify/[kode]` | Verifikasi QR Rapor (publik) |
