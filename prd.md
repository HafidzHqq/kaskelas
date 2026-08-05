# Product Requirements Document (PRD)

## Nama Produk

KasKelas

## Deskripsi

KasKelas adalah aplikasi web untuk mencatat pemasukan dan pengeluaran keuangan kelas secara transparan. Seluruh anggota kelas dapat melihat kondisi kas secara real-time tanpa harus meminta laporan kepada bendahara.

Sistem dirancang sederhana sehingga dapat digunakan oleh bendahara kelas tanpa pelatihan teknis.

---

# Tujuan

1. Transparansi keuangan kelas.
2. Mengurangi pencatatan manual.
3. Mempermudah pelaporan kas.
4. Menyediakan histori transaksi yang dapat diakses seluruh anggota.

---

# Role Pengguna

## Admin (Bendahara)

Hak akses:

* Login
* Menambah pemasukan
* Menambah pengeluaran
* Mengubah transaksi
* Menghapus transaksi
* Melihat dashboard
* Mengunduh laporan

## Anggota

Hak akses:

* Tidak perlu login
* Melihat dashboard
* Melihat saldo kas
* Melihat riwayat transaksi
* Melihat statistik

---

# Dashboard Utama

## Ringkasan Kas

Menampilkan:

* Total Saldo Kas
* Total Pemasukan Bulan Ini
* Total Pengeluaran Bulan Ini
* Jumlah Transaksi

Card Summary:

Saldo Saat Ini

Rp 2.500.000

Pemasukan

Rp 5.000.000

Pengeluaran

Rp 2.500.000

Total Transaksi

120

---

## Grafik Keuangan

Grafik garis:

* Pemasukan per bulan
* Pengeluaran per bulan

Grafik pie:

* Kategori pengeluaran

Contoh kategori:

* Konsumsi
* Kegiatan Kelas
* Donasi
* Perlengkapan
* Transportasi
* Lainnya

---

## Aktivitas Terbaru

10 transaksi terakhir.

Kolom:

* Tanggal
* Jenis
* Deskripsi
* Nominal

---

# Modul Pemasukan

Field:

* Tanggal
* Nominal
* Sumber Dana
* Deskripsi

Contoh:

Kas Bulanan
Rp10.000

Donasi Alumni
Rp100.000

---

# Modul Pengeluaran

Field:

* Tanggal
* Kategori
* Nominal
* Deskripsi
* Bukti Foto (Opsional)

Kategori:

* Konsumsi
* Kegiatan
* Transportasi
* ATK
* Donasi
* Lainnya

---

# Riwayat Transaksi

Filter:

* Semua
* Pemasukan
* Pengeluaran

Pencarian:

* Tanggal
* Kategori
* Kata Kunci

Sorting:

* Terbaru
* Terlama
* Nominal terbesar

---

# Laporan

Admin dapat:

* Export PDF
* Export Excel

Isi laporan:

* Ringkasan saldo
* Total pemasukan
* Total pengeluaran
* Daftar transaksi

---

# Keamanan

Admin login menggunakan Firebase Authentication.

Metode login:

* Email dan Password

Anggota tidak perlu login.

Middleware Next.js digunakan untuk melindungi halaman admin.

---

# Teknologi

Frontend:

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Firebase SDK

Database:

* Firebase Firestore

Storage:

* Firebase Storage

Authentication:

* Firebase Auth

Chart:

* Recharts

Deployment:

* Vercel

---

# Struktur Koleksi Firestore

transactions

* id
* type
* amount
* category
* description
* date
* createdAt

Contoh:

type: income
amount: 50000

atau

type: expense
amount: 25000

---

# Perhitungan Saldo

Saldo = Total Pemasukan - Total Pengeluaran

Saldo dihitung otomatis dari seluruh transaksi yang tersimpan.

---

# Fitur Versi 2

* Multi kelas
* QR pembayaran kas
* Notifikasi tunggakan
* Rekap per semester
* PWA mobile
* Dark mode
* Persetujuan transaksi oleh wali kelas
