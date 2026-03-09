# D. SYSTEM CONSTRAINTS

---

## SC-01: PERFORMA

```
SC-01.1  Response time API: target < 500ms untuk read, < 1 detik untuk write.
SC-01.2  Generate PDF rapor: maksimal 5 menit untuk bulk 1 kelas (via Inngest).
SC-01.3  Export Excel: maksimal 30 detik untuk data < 5.000 baris.
SC-01.4  Dashboard load: target < 2 detik dengan data ter-cache.
SC-01.5  Inngest job timeout: maksimal 10 menit per job (Vercel Pro limit).
```

---

## SC-02: KAPASITAS DATA

```
SC-02.1  Maksimal siswa/santri aktif per tenant: tidak dibatasi di level sistem,
          tapi performa optimal didesain untuk s/d 5.000 per tenant.
SC-02.2  Ukuran file upload per file: maksimal 5MB.
SC-02.3  Total storage R2 per tenant: tidak dibatasi software,
          tapi dimonitor secara bisnis (billing berdasarkan penggunaan R2).
SC-02.4  Log audit trail: disimpan minimum 2 tahun, setelah itu arsip (tidak hapus).
SC-02.5  Notifikasi log: disimpan 30 hari, lalu auto-purge.
```

---

## SC-03: KETERSEDIAAN

```
SC-03.1  Target uptime: 99.5% (Vercel SLA + Aiven SLA).
SC-03.2  Maintenance window: jika perlu, dilakukan malam hari pukul 00.00–04.00 WIB.
SC-03.3  Database backup: daily otomatis oleh Aiven, retensi 7 hari.
SC-03.4  Disaster recovery: target RTO 4 jam, RPO 24 jam (fase MVP).
```

---

## SC-04: SKALABILITAS

```
SC-04.1  Arsitektur dirancang untuk mendukung s/d 500 tenant aktif
          tanpa perubahan arsitektur (cukup scale Aiven & Vercel).
SC-04.2  Inngest job: parallel execution, tidak block main thread.
SC-04.3  Cache di Upstash Redis: mengurangi query DB untuk data yang sering diakses.
SC-04.4  Jika 1 tenant generate rapor bulk: tidak boleh memblokir tenant lain.
          (Inngest handle isolasi per tenant di queue.)
```

---

## SC-05: KOMPATIBILITAS

```
SC-05.1  Browser yang didukung: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+.
SC-05.2  Mobile browser: Chrome Mobile, Safari Mobile (iOS 14+, Android 10+).
SC-05.3  Internet Explorer: tidak didukung.
SC-05.4  Minimum resolusi layar: 375px (mobile) — 1280px (desktop optimal).
SC-05.5  Koneksi internet: aplikasi dirancang untuk koneksi minimal 1 Mbps.
          Offline mode: Post-MVP (PWA dengan service worker).
```

---

## SC-06: TEKNOLOGI & DEPENDENSI

```
SC-06.1  Tidak ada dependensi pada infrastruktur on-premise. Semua cloud-native.
SC-06.2  Seluruh third-party service harus punya tier berbayar yang terjangkau
          (tidak bergantung pada free tier yang bisa hilang sewaktu-waktu) di Production.
SC-06.3  Setiap perubahan schema DB harus melalui Prisma migration
          (tidak ada perubahan manual langsung di DB Production).
SC-06.4  Semua environment variable sensitif disimpan di Vercel Environment Variables.
          Tidak ada credential di codebase atau git history.
SC-06.5  Feature flag: gunakan Vercel Edge Config untuk flag global,
          dan table tenant.feature_flags untuk flag per-tenant.
```

---

## SC-07: BISNIS & OPERASIONAL

```
SC-07.1  Tenant baru harus melalui approval manual Owner sebelum aktif.
SC-07.2  Semua konfirmasi pembayaran langganan di fase MVP dilakukan manual oleh Owner.
SC-07.3  Owner wajib merespons permohonan aktivasi tenant dalam 1×24 jam.
SC-07.4  Fitur post-MVP tidak boleh di-develop jika modul MVP belum stabil.
SC-07.5  Data demo / seed data tidak boleh di-deploy ke environment Production.
```
