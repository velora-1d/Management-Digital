# B. VALIDATION RULES

---

## VR-01: UMUM

```
VR-01.1  Semua field wajib (*) harus diisi sebelum form bisa di-submit.
VR-01.2  Semua input teks: trim whitespace kiri-kanan sebelum disimpan.
VR-01.3  Field angka: tidak boleh negatif kecuali disebut eksplisit.
VR-01.4  Tanggal: tidak boleh masukkan tanggal di masa depan untuk data historis
         (absensi, transaksi keuangan, pelanggaran).
VR-01.5  Upload file: max 5MB, MIME type divalidasi server-side.
```

---

## VR-02: AUTENTIKASI

```
VR-02.1  Email: format valid (regex standar RFC 5322).
VR-02.2  Password baru: min 8 karakter, ada huruf besar, kecil, angka.
VR-02.3  Konfirmasi password: harus sama dengan password baru.
VR-02.4  Password baru tidak boleh sama dengan 3 password sebelumnya.
VR-02.5  Subdomain: hanya huruf kecil, angka, dan tanda hubung (-).
          Min 3, maks 30 karakter. Tidak boleh diawali atau diakhiri tanda hubung.
```

---

## VR-03: DATA SANTRI & SISWA

```
VR-03.1  Nama: min 3 karakter, maks 255 karakter. Tidak boleh angka saja.
VR-03.2  NIS (sekolah): unik per tenant. Format: boleh angka dan huruf.
VR-03.3  NIK: jika diisi, harus 16 digit angka.
VR-03.4  Tanggal lahir: tidak boleh lebih dari hari ini. Tidak boleh > 25 tahun lalu
          untuk siswa (warning, bukan hard block).
VR-03.5  Jenis kelamin: hanya L atau P.
VR-03.6  Nomor WhatsApp: 10–15 digit, diawali 08 atau +62.
```

---

## VR-04: KEUANGAN

```
VR-04.1  Nominal transaksi: > 0, max 999.999.999.999 (12 digit).
VR-04.2  Kode COA: unik per tenant, maks 20 karakter, hanya huruf dan angka.
VR-04.3  Bobot komponen nilai: total semua komponen per mapel harus = 100.
VR-04.4  Anggaran: total anggaran per kategori tidak boleh 0 atau negatif.
VR-04.5  Periode tagihan SPP: tidak boleh generate tagihan
          untuk bulan yang sudah pernah di-generate.
```

---

## VR-05: NILAI & RAPOR

```
VR-05.1  Nilai angka: 0–100 (dua desimal, misal: 87.50).
VR-05.2  Predikat valid Pesantren: Mumtaz / Jayyid Jiddan / Jayyid / Maqbul.
VR-05.3  Narasi penilaian: min 10 karakter, maks 1000 karakter.
VR-05.4  Rapor tidak bisa di-generate jika ada nilai DRAFT yang belum divalidasi.
VR-05.5  Setoran hafalan: surah 1–114, ayat sesuai panjang surah yang valid.
VR-05.6  Total bobot komponen nilai per mapel harus = 100% sebelum bisa simpan.
```

---

## VR-06: SDM

```
VR-06.1  NIP PNS: harus 18 digit angka.
VR-06.2  Satu guru tidak bisa assign ke 2 mapel berbeda
          di kelas yang sama pada jam yang sama (bentrok jadwal).
VR-06.3  Kapasitas kamar: min 1, maks 50.
VR-06.4  Periode absensi: tidak bisa input absensi untuk tanggal di masa depan.
VR-06.5  Rekap absensi bulanan: tidak bisa dikunci sebelum bulan berakhir.
```

---

## VR-07: ASRAMA & KEPESANTRENAN

```
VR-07.1  Penempatan santri: jenis kelamin santri harus sesuai jenis asrama.
VR-07.2  Kapasitas kamar tidak boleh diisi melebihi batas kapasitas.
VR-07.3  Poin pelanggaran: harus bilangan bulat positif (>= 1).
VR-07.4  Perizinan: tanggal kembali tidak boleh sebelum tanggal mulai.
VR-07.5  Perizinan yang masih PENDING tidak bisa diajukan izin baru
          untuk santri yang sama.
```

---

