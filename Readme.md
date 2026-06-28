# L'Atelier Café POS (Point of Sale)

Sistem Kasir & Pemesanan Mandiri (*Self-Service*) Premium berbasis **Google Apps Script** dan terintegrasi dengan gateway pembayaran **Midtrans**. Sistem ini dirancang dengan antarmuka bertema gelap (*dark-themed*) yang modern dan estetik menggunakan Tailwind CSS dan Chart.js untuk kebutuhan analisis performa kafe.

## 🌟 Fitur Utama

- **Pemesanan Mandiri Pelanggan (Self-Service)**: Pelanggan dapat memilih menu langsung dari katalog, mengisi nomor meja/nama, dan mengirimkan pesanan ke dapur secara instan.
- **Integrasi Pembayaran Midtrans (Online Payment)**: Mendukung transaksi online menggunakan gateway pembayaran Midtrans (QRIS, Bank Transfer, dll) dengan callback langsung di frontend untuk update otomatis.
- **Antrean Dapur (Kitchen Queue)**: Tampilan pesanan masuk secara real-time untuk bagian dapur guna memproses menu yang dipesan.
- **Antrean Kasir & Pembayaran Tunai/Debit**: Memudahkan kasir menerima pembayaran manual (tunai/debit) atau memproses order yang belum terbayar.
- **Analisis & Dashboard Admin**: Grafik visual pendapatan harian, performa staf, metode pembayaran terpopuler, serta statistik top menu terlaris.
- **Master Data Menu & User**: Manajemen data menu makanan/minuman dan penambahan akun staf langsung dari antarmuka Admin.

---

## 🛠️ Arsitektur Teknologi

- **Backend**: Google Apps Script (`Code.js`)
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (Styling), SweetAlert2 (Popup & Dialog), Chart.js (Visualisasi Grafik)
- **Database**: Google Sheets (sebagai penyimpanan data transaksi, log, menu, user, dan pesanan)
- **Deployment & Sync**: `clasp` (Command Line Apps Script Projects)
- **Payment Gateway**: Midtrans Snap API (Sandbox & Production)

---

## 🚀 Panduan Setup & Instalasi

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal Node.js dan CLI `clasp` secara global di komputer Anda:
```bash
npm install -g @google/clasp
```

### 2. Login ke Google Account
Lakukan login menggunakan clasp ke akun Google yang menyimpan Spreadsheet Anda:
```bash
clasp login
```

### 3. Clone Repository & Konfigurasi Clasp
Clone repositori ini, kemudian hubungkan dengan project Apps Script Anda dengan membuat/mengupdate berkas `.clasp.json` di direktori root:
```json
{
  "scriptId": "YOUR_APPS_SCRIPT_PROJECT_ID",
  "rootDir": "."
}
```

### 4. Push Kode ke Google Apps Script
Kirimkan seluruh kode lokal ke Google Apps Script:
```bash
clasp push
```

### 5. Deployment Web App
Di editor Apps Script online Anda:
1. Klik **Deploy** > **New deployment**.
2. Pilih tipe **Web app**.
3. Set **Execute as** menjadi `Me (Your Email)` dan **Who has access** menjadi `Anyone`.
4. Salin URL Web App yang dihasilkan untuk diakses pelanggan dan staf.

---

## 🔐 Keamanan & Konfigurasi Midtrans

Untuk menjaga keamanan kredensial, **Midtrans Server Key tidak boleh di-hardcode** di dalam kode. Berkas `Code.js` diatur untuk membaca server key melalui **Script Properties** Google Apps Script.

### Cara Menambahkan Server Key Midtrans:
1. Masuk ke halaman **Google Apps Script Editor** di browser Anda.
2. Di sidebar kiri, klik **Project Settings** (ikon roda gigi ⚙️).
3. Scroll ke bagian **Script Properties** (Properti Skrip), lalu klik **Add script property**.
4. Masukkan konfigurasi berikut:
   - **Property**: `MIDTRANS_SERVER_KEY`
   - **Value**: *Server Key dari Dashboard Midtrans Anda* (misal: `SB-Mid-server-xxxx` untuk Sandbox atau `Mid-server-xxxx` untuk Production).
5. Klik **Save script properties**.

Setelah properti disimpan, Apps Script akan membaca server key tersebut secara dinamis dengan aman.

---

## 📄 Struktur Database (Google Sheets)

Project ini otomatis membuat dan menginisialisasi lembar kerja (Sheets) berikut di Spreadsheet aktif Anda jika belum tersedia:
- `user`: Menyimpan data kredensial staf (`id_user`, `password`, `role`).
- `menu`: Katalog menu hidangan kafe (`id_menu`, `nama_menu`, `harga_menu`, `pajak_menu`, `gambar`).
- `order`: Daftar antrean pesanan masuk (`id_order`, `menu_order`, `qty_order`, `nama_pengorder`, `tgl_order`, `status_order`).
- `transaksi`: Rekap pembayaran sukses (`id_transaksi`, `tgl_transaksi`, `qty_transaksi`, `harga_transaksi`, `total_pembayaran`, `kembalian`, `jenis_pembayaran`, `id_order_refrensi`).
- `log_login`: Riwayat login staf.
