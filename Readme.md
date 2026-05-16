# ☕ KafePOS - Sistem Point-of-Sale Modern Berbasis Web

 
*(Saran: Ganti URL di atas dengan screenshot aplikasi Anda)*

**KafePOS** adalah aplikasi *Point-of-Sale* (POS) berbasis web yang modern, responsif, dan *open-source*. Dibangun dengan teknologi web standar dan didukung oleh **Google Apps Script**, aplikasi ini menawarkan solusi POS yang efisien dan tanpa biaya server untuk usaha kafe atau restoran skala kecil hingga menengah.

## ✨ Fitur Utama

Aplikasi ini dirancang dengan arsitektur berbasis peran, menyediakan antarmuka yang berbeda untuk setiap jenis pengguna:

### 📱 **Mode Pelanggan (Self-Service)**
- **Katalog Menu Digital:** Pelanggan dapat melihat daftar menu lengkap dengan gambar dan harga.
- **Pencarian Cepat:** Fitur pencarian untuk menemukan menu favorit dengan mudah.
- **Keranjang Belanja:** Pelanggan dapat menambah, mengubah jumlah, dan melihat total pesanan mereka.
- **Pemesanan Mandiri:** Pelanggan dapat langsung mengirim pesanan ke dapur dengan memasukkan nama atau nomor meja.

### 👑 **Panel Admin**
- **Dashboard Analitik:**
    - Visualisasi total pendapatan dan jumlah transaksi secara *real-time*.
    - Grafik pendapatan harian untuk memantau tren penjualan.
    - Grafik 5 menu terlaris untuk strategi marketing.
    - Grafik metode pembayaran yang paling sering digunakan.
- **Manajemen Menu:** Antarmuka CRUD (*Create, Read, Update, Delete*) untuk mengelola daftar menu, harga, dan pajak.
- **Manajemen Pengguna:** Menambah dan mengelola akun untuk Kasir dan Dapur.

### 💰 **Antarmuka Kasir**
- **Antrean Pesanan:** Menampilkan semua pesanan yang masuk dari pelanggan dan pesanan manual.
- **Input Pesanan Manual:** Kasir dapat membuat pesanan baru secara langsung untuk pelanggan yang datang.
- **Proses Pembayaran:**
    - Mendukung berbagai metode pembayaran (Tunai, QRIS, dll).
    - Perhitungan kembalian otomatis untuk pembayaran tunai.
    - Update status pesanan menjadi "Lunas" yang akan terlihat di Dapur.

### 🍳 **Tampilan Dapur (Kitchen Display System)**
- **Daftar Pesanan Masuk:** Menampilkan pesanan yang perlu disiapkan secara *real-time*.
- **Prioritas Pesanan:** Pesanan yang sudah lunas diberi tanda khusus.
- **Manajemen Status:** Dapur dapat menandai pesanan sebagai "Selesai Dimasak" untuk memberitahu kasir.

## 🛠️ Teknologi yang Digunakan

- **Frontend:**
  - HTML5
  - Tailwind CSS - Untuk styling UI yang cepat dan modern.
  - JavaScript (ES6+) - Logika utama aplikasi.
  - Chart.js - Untuk visualisasi data di dashboard admin.
  - SweetAlert2 - Untuk notifikasi dan dialog yang interaktif.

- **Backend & Database:**
  - Google Apps Script - Sebagai server-side logic.
  - Google Sheets - Sebagai database untuk menyimpan data menu, pengguna, pesanan, dll.

## 🚀 Instalasi & Setup

Karena aplikasi ini menggunakan Google Apps Script, proses setupnya unik dan tidak memerlukan hosting tradisional.

1.  **Buat Google Sheet:**
    - Buat sebuah Google Sheet baru.
    - Buat beberapa sheet (tab) di dalamnya dengan nama: `menu`, `users`, `orders`, `transactions`, `payments`.
    - Atur header kolom sesuai dengan data yang dibutuhkan oleh script (misal: di sheet `menu` ada kolom `id_menu`, `nama_menu`, `harga_menu`, dll).

2.  **Buka Apps Script Editor:**
    - Dari Google Sheet Anda, buka `Extensions` > `Apps Script`.

3.  **Salin Kode:**
    - **Backend:** Salin kode Google Apps Script (`.gs`) Anda ke dalam file `Code.gs` di editor.
    - **Frontend:** Hapus semua konten default di `Code.gs` dan salin seluruh konten file `Index.html` ini ke dalam sebuah file HTML baru di editor Apps Script ( `File > New > HTML file` ). Beri nama file tersebut `Index.html`.
    - Anda juga perlu membuat fungsi `doGet()` di `Code.gs` untuk menyajikan file HTML:
      ```javascript
      function doGet(e) {
        return HtmlService.createHtmlOutputFromFile('Index').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      }
      ```

4.  **Deploy sebagai Web App:**
    - Klik `Deploy` > `New deployment`.
    - Pilih tipe `Web app`.
    - Pada bagian `Who has access`, pilih `Anyone` (jika ingin mode pelanggan bisa diakses publik) atau `Anyone with Google account` (jika hanya untuk internal).
    - Klik `Deploy`. Anda akan mendapatkan URL web app yang bisa langsung digunakan.

## 🤝 Kontribusi

Kontribusi, isu, dan permintaan fitur sangat kami hargai! Jangan ragu untuk membuat *pull request* atau membuka *issue* baru.

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License.
