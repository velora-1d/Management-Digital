# C. PERMISSION RULES

---

## PR-01: OWNER PANEL

```
PR-01.1  Hanya user dengan role OWNER yang bisa akses app.eduvera.id
PR-01.2  Owner bisa melihat dan mengubah data semua tenant.
PR-01.3  Setiap akses Owner ke data tenant dicatat di security_log.
PR-01.4  Owner tidak bisa menghapus audit_trail tenant manapun.
PR-01.5  Owner bisa impersonate Admin Tenant (untuk support) —
          aksi impersonation dicatat penuh di security_log.
```

---

## PR-02: ADMIN TENANT

```
PR-02.1  Admin Tenant hanya bisa akses data tenant-nya sendiri.
PR-02.2  Admin bisa buat, edit, nonaktifkan user dalam tenant-nya.
PR-02.3  Admin tidak bisa hapus user permanen — hanya nonaktif.
PR-02.4  Admin bisa kustomisasi permission role dalam tenant,
          tapi tidak bisa memberikan permission lebih tinggi dari role-nya sendiri.
PR-02.5  Admin tidak bisa melihat data tenant lain (walau dalam yayasan yang sama
          kecuali Super Admin yang akses via dashboard yayasan).
```

---

## PR-03: GURU / USTADZ

```
PR-03.1  Guru hanya bisa input nilai untuk mapel yang dia ajar.
PR-03.2  Guru hanya bisa input absensi untuk kelas yang dia ajar.
PR-03.3  Guru tidak bisa melihat nilai guru lain untuk kelas berbeda.
PR-03.4  Wali kelas bisa melihat semua nilai siswa di kelasnya (read-only).
PR-03.5  Ustadz Tahfidz hanya bisa input setoran untuk santri binaannya.
PR-03.6  Ustadz tidak bisa mengedit penilaian yang sudah divalidasi Admin/Mudir.
```

---

## PR-04: BENDAHARA

```
PR-04.1  Bendahara bisa akses semua data keuangan tenant.
PR-04.2  Bendahara bisa konfirmasi pembayaran SPP.
PR-04.3  Bendahara bisa lihat data SDM (absensi + honor) — read-only.
PR-04.4  Bendahara tidak bisa akses data nilai atau rapor siswa.
PR-04.5  Bendahara tidak bisa create/edit user.
```

---

## PR-05: TU / SEKRETARIS

```
PR-05.1  TU (Sekolah) bisa kelola data SDM dan penggajian.
PR-05.2  TU bisa lihat laporan keuangan — read-only.
PR-05.3  TU tidak bisa konfirmasi pembayaran atau input transaksi keuangan.
PR-05.4  TU bisa lihat data siswa — read-only.
PR-05.5  Sekretaris (Pesantren) punya akses setara TU untuk konteks pesantren.
```

---

## PR-06: MUSYRIF

```
PR-06.1  Musyrif hanya bisa input absensi asrama untuk kamar yang dikelolanya.
PR-06.2  Musyrif bisa input pelanggaran untuk santri asramanya.
PR-06.3  Musyrif bisa approve/tolak izin santri asramanya.
PR-06.4  Musyrif bisa input catatan harian untuk santri asramanya.
PR-06.5  Musyrif tidak bisa melihat data keuangan.
PR-06.6  Musyrif tidak bisa melihat nilai/rapor santri.
```

---

## PR-07: SISWA / SANTRI (PORTAL)

```
PR-07.1  Siswa/Santri hanya bisa melihat data dirinya sendiri.
PR-07.2  Siswa/Santri bisa download rapor sendiri yang sudah published.
PR-07.3  Siswa/Santri bisa lihat jadwal kelas/halaqah.
PR-07.4  Siswa/Santri tidak bisa edit data apapun.
PR-07.5  Siswa/Santri tidak bisa melihat data keuangan.
```

---

## PR-08: WALI MURID / WALI SANTRI (PORTAL)

```
PR-08.1  Wali hanya bisa melihat data anak yang terdaftar sebagai walinya.
PR-08.2  Wali bisa download rapor anak yang sudah published.
PR-08.3  Wali bisa lihat tagihan SPP anak dan riwayat pembayaran.
PR-08.4  Wali tidak bisa edit data apapun.
PR-08.5  Wali bisa melihat pengumuman yang ditujukan untuk wali.
PR-08.6  Wali bisa mengajukan perizinan santri (pesantren) — perlu approval Musyrif.
```

---

