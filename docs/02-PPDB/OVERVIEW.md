# 📊 Menu: PENERIMAAN PPDB — Overview

> **Route:** `/ppdb`  
> **Akses:** Super Admin, Admin  
> **Modul:** Penerimaan Peserta Didik Baru

---

## Deskripsi Umum

Modul Penerimaan PPDB mengelola seluruh proses pendaftaran siswa baru, dari pendaftaran awal (online/offline), proses verifikasi, wawancara/tes, hingga pengumuman kelulusan dan penetapan status siswa.

---

## Sub-Halaman / Tab

| Tab | Route | Deskripsi |
|---|---|---|
| **Daftar Pendaftar** | `/ppdb` | List semua calon siswa yang mendaftar |
| **Detail Pendaftar** | `/ppdb/[id]` | Halaman detail satu pendaftar |
| **Formulir Pendaftaran** | `/ppdb/new` | Form tambah pendaftar baru (offline) |
| **Pengaturan PPDB** | `/ppdb/settings` | Batas kuota, biaya pendaftaran, jadwal |

---

## Alur Utama (Flow)

```
Pendaftar → Verifikasi Admin → Tes/Wawancara → Pengumuman → Daftar Ulang
  pending     →    verified    →   interviewed   →  accepted/rejected  →  re-registration
```

---

## Status Pendaftar

| Status | Deskripsi |
|---|---|
| `pending` | Baru mendaftar, belum diverifikasi |
| `verified` | Data terverifikasi oleh admin |
| `interviewed` | Sudah mengikuti tes/wawancara |
| `accepted` | Dinyatakan diterima |
| `rejected` | Tidak diterima |

---

## Status Implementasi

| Item | Status |
|---|---|
| List Pendaftar | ✅ Implemented |
| Tambah Pendaftar | ✅ Implemented |
| Edit Pendaftar | ✅ Implemented |
| Ubah Status | ✅ Implemented |
| Export Excel | ⚠️ Partial |
| Import Excel Massal | ❌ Belum |
| Cetak Bukti Pendaftaran | ❌ Belum |
