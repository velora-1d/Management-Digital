# UI / UX — DESIGN SYSTEM GLOBAL
## EduVera — Platform Manajemen Pendidikan Terpadu

---

## 1. DESIGN PHILOSOPHY

Dirancang untuk **pengguna non-teknis** di lingkungan pendidikan Indonesia — guru, staf TU, bendahara, musyrif. Prinsip desain:

- **Jelas** → setiap tombol, label, status mudah dibaca tanpa training
- **Cepat** → task utama maksimal 3 klik
- **Aman** → aksi destruktif selalu minta konfirmasi
- **Familiar** → bahasa Indonesia, format tanggal & Rupiah lokal

---

## 2. WARNA (COLOR PALETTE)

| Token | Warna | Hex | Fungsi |
|---|---|---|---|
| Primary | Blue 600 | `#2563EB` | CTA, active state, link |
| Secondary | Green 600 | `#16A34A` | Success, lunas, aktif |
| Accent | Amber 600 | `#D97706` | Warning, pending, belum bayar |
| Danger | Red 600 | `#DC2626` | Error, hapus, suspend |
| Neutral | Slate 500 | `#64748B` | Teks sekunder, border |
| Sidebar | Navy | `#1E3A5F` | Background sidebar (Light mode) |
| Bg Light | Slate 50 | `#F8FAFC` | Background app |
| Bg Dark | Slate 950 | `#0F172A` | Background app (dark) |
| Surface Light | White | `#FFFFFF` | Card, panel |
| Surface Dark | Slate 800 | `#1E293B` | Card, panel (dark) |

---

## 3. TIPOGRAFI

| Style | Size | Weight | Penggunaan |
|---|---|---|---|
| H1 | 28px | Bold | Judul halaman utama |
| H2 | 22px | SemiBold | Section header |
| H3 | 18px | SemiBold | Card header |
| Body | 14px | Regular | Konten utama |
| Small | 12px | Regular | Label, metadata, caption |
| Mono | 13px | Regular | Kode, ID, nomor referensi |

**Font Family:** Plus Jakarta Sans (Google Fonts)

---

## 4. STATUS BADGE

| Status | Warna BG | Warna Text | Contoh |
|---|---|---|---|
| Aktif | green-100 | green-700 | ● Aktif |
| Pending | amber-100 | amber-700 | ● Pending |
| Nonaktif | slate-100 | slate-500 | ● Nonaktif |
| Suspend | red-100 | red-700 | ● Suspend |
| Draft | blue-100 | blue-700 | ● Draft |
| Published | emerald-100 | emerald-700 | ● Published |
| Lunas | green-100 | green-700 | ● Lunas |
| Belum Bayar | amber-100 | amber-700 | ● Belum Bayar |
| Sebagian | orange-100 | orange-700 | ● Sebagian |
| Arsip | slate-100 | slate-400 | ● Arsip |

---

## 5. KOMPONEN UI STANDAR

### 5.1 Shell Layout
```
┌──────────────────────────────────────────────────────────────┐
│                          TOPBAR                              │
│  Logo | Nama Tenant | Tab Sekolah/Pesantren | Search |       │
│  🔔 Notifikasi (badge) | Avatar | Dark/Light Toggle          │
├──────────────┬───────────────────────────────────────────────┤
│              │  Page Header (Judul + Breadcrumb)             │
│   SIDEBAR    ├───────────────────────────────────────────────┤
│              │                                               │
│  Menu per    │            KONTEN HALAMAN                     │
│  Dashboard   │                                               │
│  (Collapsible│                                               │
│   di mobile) │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### 5.2 KPI / Stats Card
```
┌──────────────────────────────┐
│  [Icon]  Judul KPI           │
│                              │
│  [Angka Besar Bold]          │
│  Keterangan / satuan         │
│  ▲ +12% vs bulan lalu        │
└──────────────────────────────┘
Klik card → navigasi ke halaman detail
```

### 5.3 Data Table
```
┌──────────────────────────────────────────────────────────┐
│ 🔍 [Search...]        [Filter ▼] [Export ▼] [+ Tambah]  │
├──────────────────────────────────────────────────────────┤
│  # │ Nama │ Status  │ Tanggal │ ...  │ Aksi              │
├──────────────────────────────────────────────────────────┤
│  1 │ ...  │ ● Aktif │ ...     │ ...  │ [Edit] [⋯]       │
│  2 │ ...  │ ● Arsip │ ...     │ ...  │ [Edit] [⋯]       │
├──────────────────────────────────────────────────────────┤
│  Menampilkan 1–20 dari 150     [ ‹ 1 2 3 ... 8 › ]      │
└──────────────────────────────────────────────────────────┘
```

### 5.4 Form Pattern
```
Label *
[Input field                    ]
  ⚠ Pesan error di sini (merah)

Label
[Input field                    ]

[ Batal ]              [ Simpan ]
```

### 5.5 Konfirmasi Modal (Aksi Berbahaya)
```
┌────────────────────────────────────┐
│  ⚠️  Konfirmasi [Judul Aksi]       │
│                                    │
│  Penjelasan dampak aksi ini.       │
│  Aksi ini tidak dapat dibatalkan.  │
│                                    │
│  [ Batal ]    [ Ya, Lanjutkan ]    │
└────────────────────────────────────┘
Tombol konfirmasi: merah untuk aksi destruktif
```

### 5.6 Toast Notification
```
✅ Data berhasil disimpan            [×]   ← Success (hijau)
⚠️  Data tidak lengkap              [×]   ← Warning (kuning)
❌ Terjadi kesalahan                [×]   ← Error (merah)
ℹ️  Rapor sedang diproses           [×]   ← Info (biru)
```

---

## 6. BREAKPOINT RESPONSIF

| Breakpoint | Device | Behavior |
|---|---|---|
| < 768px | Mobile | Sidebar drawer, tabel scroll horizontal |
| 768–1024px | Tablet | Sidebar collapsed (icon only) |
| > 1024px | Desktop | Layout penuh, sidebar terbuka |

---

## 7. LOADING STATE

| Kondisi | Loading Style |
|---|---|
| Navigasi halaman | Progress bar atas |
| List halaman | Skeleton loader (bukan spinner) |
| Tombol submit | Spinner inline di tombol + disabled |
| Inngest job (PDF) | Progress indicator + polling 3 detik |

---

## 8. EMPTY STATE

```
┌──────────────────────────────────────┐
│          [Ilustrasi SVG]             │
│                                      │
│    Belum ada [nama data] di sini     │
│    Mulai dengan tambah [nama] baru   │
│                                      │
│         [ + Tambah [nama] ]          │
└──────────────────────────────────────┘
```
