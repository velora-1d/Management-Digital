# RULES
## PROJECT: EduVera SaaS Platform

---

# A. BUSINESS RULES

---

## BR-01: TENANT & LANGGANAN

```
BR-01.1  Setiap tenant hanya boleh punya 1 subdomain.
         Subdomain tidak bisa diubah setelah aktif.

BR-01.2  Trial gratis: 14 hari (bisa diperpanjang manual oleh Owner).
         Setelah trial habis → status EXPIRED → akses read-only 7 hari.
         Setelah read-only habis → akses DITUTUP, data disimpan 90 hari.

BR-01.3  Tenant yang di-suspend oleh Owner: semua sesi aktif
         otomatis di-invalidate dalam waktu < 1 menit.

BR-01.4  Modul aktif per tenant ditentukan oleh Owner.
         Tenant Admin tidak bisa mengaktifkan modul yang dikunci.

BR-01.5  Super Admin (Yayasan) hanya bisa memantau tenant miliknya.
         Tidak bisa membuat tenant baru tanpa approval Owner.
```

---

## BR-02: TAHUN AJARAN & PERIODE

```
BR-02.1  Hanya 1 tahun ajaran aktif dalam satu waktu per tenant.
         (Sekolah: 1 tahun ajaran. Pesantren: 1 tahun hijriah aktif.)

BR-02.2  Data kelas, nilai, rapor, absensi terikat ke tahun ajaran aktif.
         Data tahun ajaran lama: read-only permanen.

BR-02.3  Pergantian tahun ajaran tidak otomatis migrate data siswa/santri.
         Admin wajib menjalankan proses "Kenaikan Kelas / Marhalah" secara manual.

BR-02.4  Marhalah pesantren: santri bisa tinggal di marhalah yang sama
         (tidak naik) jika admin memutuskan saat proses kenaikan.
```

---

## BR-03: RAPOR & NILAI

```
BR-03.1  Rapor yang sudah PUBLISHED tidak bisa di-unpublish.
         Jika ada kesalahan → harus buat dokumen koreksi terpisah.

BR-03.2  Nilai yang sudah di-lock (setelah rapor published) tidak bisa diubah.
         Perubahan nilai pasca-publish harus lewat jalur resmi (Admin atau Mudir).

BR-03.3  Setiap komponen nilai wajib diisi sebelum rapor bisa di-generate.
         Sistem tidak akan generate rapor dengan nilai kosong.

BR-03.4  Narasi wali kelas (sekolah) dan catatan musyrif/pengasuh (pesantren)
         wajib diisi sebelum rapor bisa di-publish.

BR-03.5  Nilai hanya bisa diinput oleh guru/ustadz yang ditugaskan
         ke kelas/halaqah tersebut. Tidak bisa input untuk kelas lain.

BR-03.6  QR Code di rapor harus bisa diverifikasi secara online
         di halaman publik tanpa login: eduvera.id/verify/{kode}

BR-03.7  Arsip rapor tidak bisa dihapus oleh siapapun (termasuk Owner).
         Laporan historis wajib tersedia sepanjang masa aktif tenant.
```

---

## BR-04: KEUANGAN

```
BR-04.1  Transaksi keuangan yang sudah disimpan TIDAK BISA dihapus.
         Jika ada kesalahan → buat jurnal koreksi (transaksi baru dengan keterangan).

BR-04.2  Dana wakaf (pesantren) wajib dicatat di COA terpisah.
         Tidak boleh digabung dengan COA operasional.

BR-04.3  Pengeluaran gaji/honor harus selalu diinput via modul SDM terlebih dahulu,
         baru otomatis terhubung ke keuangan setelah Bendahara setujui.
         Input manual pengeluaran gaji di keuangan tanpa melalui SDM: DILARANG.

BR-04.4  Tagihan SPP yang sudah di-generate tidak bisa dihapus.
         Jika ada pembatalan → update status menjadi "DIBATALKAN" dengan keterangan.

BR-04.5  RAPBS / Anggaran harus dibuat sebelum transaksi pengeluaran dimulai.
         Sistem memberi WARNING jika pengeluaran melebihi anggaran kategori.
         (Bukan hard block — admin bisa lanjut tapi warning wajib tampil.)

BR-04.6  Konfirmasi pembayaran SPP hanya bisa dilakukan oleh:
         Bendahara atau Admin Tenant.
         Guru, wali murid, dan siswa tidak bisa mengkonfirmasi sendiri.
```

---

## BR-05: SDM & PENGGAJIAN

```
BR-05.1  Rekap absensi pegawai yang sudah dikunci (akhir bulan) tidak bisa diubah.
         Perubahan setelah dikunci hanya lewat pengajuan ke Admin.

BR-05.2  Slip gaji yang sudah dipublish bersifat FINAL dan tidak bisa diedit.
         Jika ada koreksi → buat slip koreksi di bulan berikutnya.

BR-05.3  Satu guru / ustadz hanya bisa menjadi wali kelas / musyrif
         di 1 kelas / 1 asrama pada saat yang sama dalam 1 tahun ajaran.

BR-05.4  Gaji PNS dan PPPK mengikuti skema golongan yang sudah di-set Admin.
         Tidak bisa dihitung manual di luar sistem.

BR-05.5  Ustadz yang dinonaktifkan tetap muncul di riwayat nilai / setoran hafalan.
         Data historis tidak dihapus.
```

---

## BR-06: SANTRI & SISWA

```
BR-06.1  Santri / siswa yang diarsipkan tidak bisa dihapus dari sistem.
         Data historis (nilai, absensi, rapor) tetap tersimpan dan bisa diakses.

BR-06.2  Satu santri mukim hanya bisa punya 1 penempatan asrama aktif.
         Untuk mutasi: penempatan lama harus ditutup dulu.

BR-06.3  Wali santri / wali murid wajib minimal 1 per santri/siswa.
         Jika wali utama dihapus → wajib set wali utama baru sebelum hapus.

BR-06.4  Santri non-mukim tidak bisa ditempatkan di asrama.

BR-06.5  Perizinan santri yang sudah disetujui → otomatis ubah status absensi asrama
         pada tanggal-tanggal yang tercakup izin.
```

---

## BR-07: PENGUMUMAN & NOTIFIKASI

```
BR-07.1  Notifikasi WA dan Email dikirim via antrian Inngest (bukan langsung).
         Maksimal 3x retry jika gagal. Setelah 3x gagal → log FAILED, no-retry.

BR-07.2  Pengumuman terjadwal: jika tenant di-suspend sebelum jadwal kirim,
         pengumuman dibatalkan otomatis.

BR-07.3  Log pengiriman notifikasi disimpan minimal 30 hari.
```

---

