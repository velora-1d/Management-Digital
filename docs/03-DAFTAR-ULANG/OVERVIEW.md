# 📊 Menu: DAFTAR ULANG — Overview

> **Route:** `/re-registration`  
> **Akses:** Super Admin, Admin  
> **Modul:** Registrasi ulang siswa lama untuk tahun ajaran baru

---

## Deskripsi Umum

Modul Daftar Ulang mengelola proses konfirmasi siswa lama yang akan melanjutkan di tahun ajaran baru, termasuk siswa yang baru diterima dari PPDB. Proses ini meliputi verifikasi data, pembaruan kelas, dan pembayaran biaya daftar ulang.

---

## Alur Proses

```
Tahun Ajaran Baru Dibuka
       ↓
Generate Daftar Ulang (otomatis dari siswa aktif)
       ↓
Siswa/Ortu Konfirmasi (online) / Admin Input (offline)
       ↓
Admin Verifikasi + Input Pembayaran
       ↓
Status: confirmed → Siswa siap masuk TA baru
```

---

## Status Daftar Ulang

| Status | Deskripsi |
|---|---|
| `pending` | Belum melakukan konfirmasi daftar ulang |
| `confirmed` | Sudah dikonfirmasi, siap masuk TA baru |
| `cancelled` | Tidak jadi daftar ulang (keluar/pindah) |

---

## Status Implementasi

| Item | Status |
|---|---|
| List Daftar Ulang | ✅ Implemented |
| Konfirmasi Daftar Ulang | ✅ Implemented |
| Input Pembayaran | ✅ Implemented |
| Generate Massal | ⚠️ Partial |
| Export Excel | ⚠️ Partial |
| Notifikasi WhatsApp | ❌ Belum |
