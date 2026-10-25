---
title: SIPEDI Backend API
emoji: 🏛️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# 🚀 SIPEDI — Backend REST API Service

Layanan backend mikro (*microservice*) untuk platform **SIPEDI** (*Sistem Informasi Perizinan & Pengaduan Digital*), dibangun menggunakan **FastAPI**, **SQLAlchemy ORM**, dan **Python 3.12**.

Layanan ini siap digunakan baik di lingkungan pengembangan lokal maupun di-deploy ke dalam kontainer **Docker** di **Hugging Face Spaces**.

---

## 🌟 Fitur Utama Backend

1. **Manajemen Perizinan UMKM Otomatis**:
   * Validasi ketat NIK 16 digit dan pencegahan izin ganda per pemohon.
   * Pemilihan durasi fleksibel (1, 3, 6, 12 bulan) dengan kalkulasi otomatis retribusi resmi (Kebersihan & Keamanan).
   * Otomatis menerbitkan tagihan invoice dan menghubungkannya ke gateway **Midtrans Snap**.
2. **Generator Dokumen Legal PDF**:
   * Otomatis menghasilkan **Surat Keputusan Izin Resmi** berformat PDF dengan ReportLab.
   * Dilengkapi tanda tangan elektronik dan QR Code verifikasi keabsahan dokumen.
3. **Integrasi Gateway Pembayaran Midtrans Snap**:
   * Pembuatan transaksi Snap token dinamis untuk QRIS, E-Wallet, dan Virtual Account.
   * Callback redirect dinamis yang mengembalikan warga ke domain publik `https://sipedi.daimyo-lab.me`.
   * Endpoint **Webhook Notifikasi Real-time** (`/api/payments/midtrans-notification`) dengan verifikasi signature SHA-512 untuk otomatis mengubah status tagihan menjadi `PAID`.
4. **Penyimpanan Berkas Cloudinary**:
   * Seluruh dokumen KTP dan bukti pengaduan diunggah langsung ke Cloudinary CDN dengan URL yang aman.
5. **Pelacakan Tiket Publik**:
   * Endpoint pelacakan universal (`/api/track/{code}`) yang dapat membaca status nomor izin (`PRM-...`) dan nomor aduan (`CMP-...`) tanpa perlu autentikasi.
6. **Autentikasi & Keamanan Tingkat Tinggi**:
   * JWT Bearer Token dengan hashing sandi bcrypt.
   * Role-Based Access Control (`CITIZEN`, `ADMIN`, `OFFICER`).
   * Audit trail logging otomatis untuk setiap aktivitas sensitif sistem.

---

## 🛠️ Tech Stack Backend

* **Framework**: FastAPI (Python 3.12)
* **ASGI Server**: Uvicorn
* **Database ORM**: SQLAlchemy 2.0
* **Database Driver**: PyMySQL (mendukung enkripsi SSL Aiven Cloud)
* **Validasi Skema**: Pydantic v2
* **Keamanan**: python-jose (JWT), passlib (bcrypt)
* **PDF Engine**: ReportLab
* **Payment Gateway**: Midtrans Client Library & REST API
* **Penyimpanan Cloud**: Cloudinary Python SDK

---

## ⚙️ Variabel Lingkungan & Secrets

Berikut variabel lingkungan yang diperlukan (dapat diatur di file `.env` lokal atau di *Hugging Face Space Settings -> Variables and secrets*):

| Variabel | Tipe | Deskripsi & Contoh |
| :--- | :--- | :--- |
| `DATABASE_URL` | Secret | URI koneksi MySQL Aiven: `mysql+pymysql://avnadmin:PASS@host:port/defaultdb?ssl_mode=REQUIRED` |
| `FRONTEND_URL` | Variable | Domain portal warga: `https://sipedi.daimyo-lab.me` |
| `ADMIN_FRONTEND_URL` | Variable | Domain portal admin: `https://admin.daimyo-lab.me` |
| `MIDTRANS_SERVER_KEY` | Secret | Server Key Midtrans (Sandbox / Production): `SB-Mid-server-xxxx` |
| `MIDTRANS_CLIENT_KEY` | Secret | Client Key Midtrans: `SB-Mid-client-xxxx` |
| `MIDTRANS_IS_PRODUCTION` | Variable | `False` untuk mode sandbox, `True` untuk produksi |
| `CLOUDINARY_CLOUD_NAME` | Variable | Nama cloud di Cloudinary |
| `CLOUDINARY_API_KEY` | Secret | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret | API Secret Cloudinary |
| `BREVO_API_KEY` | Secret | (Opsional) API Key email Brevo SMTP |
| `SECRET_KEY` | Secret | Kunci enkripsi token JWT aplikasi |

---

## 📡 Daftar Endpoint REST API

### 1. Autentikasi (`/api/auth`)
* `POST /api/auth/register` : Mendaftarkan akun warga baru.
* `POST /api/auth/login` : Login dan menerima token JWT Bearer.
* `GET /api/auth/me` : Informasi akun pengguna yang aktif.

### 2. Perizinan Usaha (`/api/permits`)
* `POST /api/permits` : Pengajuan izin usaha mikro baru (langsung membuat invoice Midtrans).
* `GET /api/permits` : Mengambil daftar seluruh izin usaha (filter status, pencarian).
* `GET /api/permits/{id}` : Mengambil detail izin beserta lampiran berkas dan invoice.
* `PATCH /api/permits/{id}/status` : Admin mengubah status izin (Menyetujui/Menolak & terbit PDF).
* `POST /api/permits/{id}/request-renewal` : Mengajukan perpanjangan durasi izin.
* `GET /api/permits/{permit_number}/download-pdf` : Mengunduh dokumen surat izin resmi (PDF).
* `GET /api/permits/check-nik` : Mengecek ketersediaan NIK.

### 3. Pembayaran & Invoice (`/api/payments`)
* `GET /api/payments/invoices/{order_id}` : Mengambil data invoice dan status tagihan.
* `POST /api/payments/midtrans-notification` : **Webhook resmi Midtrans** untuk otomatisasi status lunas.
* `GET /api/payments/verify/{order_id}` : Memvalidasi status transaksi ke gateway Midtrans.
* `POST /api/payments/simulate/{order_id}` : Simulasi bayar QRIS untuk mode pengujian sandbox.

### 4. Pengaduan Masyarakat (`/api/complaints`)
* `POST /api/complaints` : Mengajukan laporan gangguan ketertiban & bukti dokumen.
* `GET /api/complaints` : Daftar aduan masyarakat.
* `GET /api/complaints/{id}` : Detail laporan aduan.
* `PATCH /api/complaints/{id}/status` : Memperbarui progres penanganan aduan lapangan.

### 5. Pelacakan Universal (`/api/track`)
* `GET /api/track/{code}` : Pelacakan status berkas izin (`PRM-...`) atau aduan (`CMP-...`).

### 6. Statistik Dashboard (`/api/admin/stats`)
* `GET /api/admin/stats` : Ringkasan angka statistik, tren grafik bulanan, dan log aktivitas.

---

## 🐳 Panduan Docker (Hugging Face Spaces)

Proyek ini telah dilengkapi dengan `Dockerfile` berbasis `python:3.12-slim`:
* Dikonfigurasi menggunakan user non-root (UID `1000`) sesuai standar keamanan container Hugging Face.
* Berjalan pada port `7860`.
* Perintah eksekusi:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port 7860
  ```

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Buat virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate # Linux/Mac

# 3. Install dependensi
pip install -r requirements.txt

# 4. Jalankan server Uvicorn
uvicorn app.main:app --reload --port 8000
```
Swagger UI dokumentasi interaktif dapat diakses di: `http://localhost:8000/docs`.
