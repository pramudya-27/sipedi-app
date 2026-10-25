# 🏛️ SIPEDI — Sistem Perizinan Digital Mikro & Layanan Pengaduan Ketertiban Berbasis Asisten AI

<p align="center">
  <img src="frontend/public/logo1.png" alt="SIPEDI Logo" width="130" />
</p>

<p align="center">
  <strong>Platform Layanan Publik Digital Skala Besar Berbasis Kecerdasan Buatan (AI) & Multi-Domain Gateway</strong><br>
  <em>Karya Inovasi Web Development — IT FEST 2026 (Pelayanan Publik dalam Skala Besar / Smart Government)</em>
</p>

<p align="center">
  <a href="https://sipedi.daimyo-lab.me"><img src="https://img.shields.io/badge/Citizen%20Portal-sipedi.daimyo--lab.me-blue?style=for-the-badge&logo=vercel" alt="Citizen Portal" /></a>
  <a href="https://admin.daimyo-lab.me"><img src="https://img.shields.io/badge/Admin%20Portal-admin.daimyo--lab.me-indigo?style=for-the-badge&logo=vercel" alt="Admin Portal" /></a>
  <a href="https://daimyo27-sipedi-backend.hf.space/docs"><img src="https://img.shields.io/badge/FastAPI%20Docs-Swagger%20UI-green?style=for-the-badge&logo=fastapi" alt="API Docs" /></a>
  <a href="https://huggingface.co/spaces/daimyo27/sipedi-backend"><img src="https://img.shields.io/badge/HF%20Spaces-Docker%20Container-yellow?style=for-the-badge&logo=huggingface" alt="Hugging Face" /></a>
</p>

---

## 📌 1. Ikhtisar & Latar Belakang Proyek

**SIPEDI** (*Sistem Informasi Perizinan & Pengaduan Digital*) adalah platform *Smart Governance* generasi baru yang mentransformasikan birokrasi perizinan usaha mikro dan penanganan ketertiban lingkungan menjadi satu ekosistem digital terpadu, instan, akuntabel, dan bebas pungutan liar (pungli).

### Masalah Nyata yang Diselesaikan:
1. **Birokrasi Perizinan UMKM yang Lambat & Rawan Pungli**: Pelaku UMKM sering kesulitan mengurus Izin Usaha Mikro Kecil (IUMK), menghadapi calo, dan tidak memiliki kepastian status hukum usahanya.
2. **Kanal Pengaduan Ketertiban Konvensional Tidak Transparan**: Aduan warga terkait premanisme, penyerobotan fasilitas umum, parkir liar, atau pungli kerap tidak ditindaklanjuti atau hilang tanpa jejak audit.
3. **Ketiadaan Panduan Regulasi Mandiri**: Warga bingung mengenai syarat dan alur perizinan resmi pemerintah.

### Solusi SIPEDI:
* **Pengajuan Izin Usaha Kilat**: Terintegrasi dengan verifikasi NIK 16 digit, pemilihan durasi retribusi resmi, penerbitan invoice Midtrans instan, dan penerbitan Surat Izin resmi berformat PDF dengan QR Code terenkripsi.
* **Kanal Aduan Siaga 24 Jam**: Pengaduan dilengkapi unggah bukti foto/dokumen (Cloudinary), tingkat keparahan, geotagging lokasi, dan sistem penugasan petugas lapangan (*Officer Dispatch*).
* **AI Smart Public Assistant**: Agen AI interaktif yang memandu warga 24/7 memahami regulasi, menganalisis syarat izin, dan merangkum panduan hukum secara dwibahasa (Indonesia & Inggris).
* **Arsitektur Multi-Domain Terisolasi**: Portal Publik/Warga dan Portal Pengawas/Admin beroperasi di domain yang terpisah secara aman.

---

## 🌐 2. Tautan Live Deployment

| Komponen | Domain / URL Live | Keterangan |
|---|---|---|
| **Portal Warga (Citizen)** | [https://sipedi.daimyo-lab.me](https://sipedi.daimyo-lab.me) | Portal publik: Beranda, Layanan Izin, Pengaduan, Asisten AI, Lacak Status, dan Profil Warga. |
| **Portal Pengawas (Admin)** | [https://admin.daimyo-lab.me](https://admin.daimyo-lab.me) | Landing page khusus admin, form login petugas, dashboard monitoring, verifikasi berkas, dan penugasan aduan. |
| **Backend REST API** | [https://daimyo27-sipedi-backend.hf.space](https://daimyo27-sipedi-backend.hf.space) | FastAPI Microservices yang berjalan di Docker Container Hugging Face Spaces. |
| **Dokumentasi API Interaktif** | [https://daimyo27-sipedi-backend.hf.space/docs](https://daimyo27-sipedi-backend.hf.space/docs) | Swagger UI interaktif untuk seluruh endpoint REST API. |
| **Database Cloud** | `Aiven Cloud MySQL 8.0` | High-Availability Managed MySQL dengan enkripsi SSL/TLS. |
| **Payment Gateway** | `Midtrans Snap Gateway` | Mendukung QRIS, GoPay, ShopeePay, BCA VA, BNI VA, BRI VA, Permata VA. |

---

## 🏛️ 3. Arsitektur Sistem

```
                              ┌──────────────────────────────────────────────┐
                              │               CLOUDFLARE DNS                 │
                              │           (daimyo-lab.me Nameservers)         │
                              └──────────────────────┬───────────────────────┘
                                                     │
                          ┌──────────────────────────┴──────────────────────────┐
                          ▼                                                     ▼
        ┌──────────────────────────────────┐                  ┌──────────────────────────────────┐
        │   Citizen Domain: sipedi.*       │                  │     Admin Domain: admin.*        │
        │   Vercel Edge Network (SPA)      │                  │   Vercel Edge Network (SPA)      │
        └─────────────────┬────────────────┘                  └─────────────────┬────────────────┘
                          │                                                     │
                          │        Axios HTTP / Bearer Auth / Multipart         │
                          └──────────────────────────┬──────────────────────────┘
                                                     ▼
                               ┌───────────────────────────────────────────┐
                               │       HUGGING FACE SPACES (Docker)        │
                               │          FastAPI Backend Service          │
                               │               Port: 7860                  │
                               └─────┬──────────────┬──────────────┬───────┘
                                     │              │              │
                   SQLAlchemy (SSL)  │              │ Webhook POST │ Cloudinary SDK / HTTP
                                     ▼              ▼              ▼
                    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │   Aiven Cloud    │  │  Midtrans Snap   │  │ Cloudinary Cloud │
                    │   MySQL DB 8.0   │  │ Payment Gateway  │  │   Media Storage  │
                    └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## ✨ 4. Fitur-Fitur Utama

### 1. Pelayanan Perizinan Usaha Mikro (IUMK & NIB)
- **Formulir Interaktif & Validasi Ketat NIK**: NIK divalidasi 16 digit angka dan aturan *One Citizen One Active Permit* untuk mencegah kepemilikan ganda tak terkontrol.
- **Pilihan Durasi Fleksibel**: 1 Bulan, 3 Bulan, 6 Bulan, dan 12 Bulan dengan transparansi tarif retribusi (Rp 50.000 kebersihan + Rp 50.000 keamanan per bulan).
- **Integrasi Pembayaran Otomatis**: Saat formulir dikirim, sistem langsung menerbitkan nomor tagihan (`INV-YYYYMMDD-XXXXXX`) dan mengarahkan warga ke Midtrans Snap.
- **Penerbitan Surat Izin PDF Otomatis**: Ketika admin menyetujui, sistem secara otomatis menghasilkan dokumen PDF legal dengan tanda tangan digital dan QR Code verifikasi.
- **Perpanjangan Izin (Renewal)**: Warga dapat memperpanjang izin sebelum atau sesudah kedaluwarsa secara instan.

### 2. Layanan Pengaduan Ketertiban & Saber Pungli
- **Form Pelaporan Lengkap**: Mendukung kategori Pungutan Liar (Pungli), Pelanggaran Ketertiban Umum, Kerusakan Fasilitas, dan Premanisme.
- **Unggah Bukti Lapangan**: Foto atau berkas bukti langsung disimpan secara aman di Cloudinary CDN.
- **Sistem Disposisi Petugas**: Admin dapat menugaskan petugas lapangan (*officer dispatch*) untuk meninjau lokasi dengan batas waktu penanganan.
- **Pelacakan Tiket Real-time**: Warga dapat memantau status aduan (`Baru` -> `Sedang Diproses` -> `Selesai`) menggunakan kode tiket tanpa perlu login.

### 3. Asisten AI Cerdas (Bilingual AI Assistant)
- **Didukung Model LLM Generasi Baru**: Terintegrasi via OpenRouter API untuk menjawab pertanyaan seputar hukum dan syarat UMKM.
- **Tindakan Cepat (Quick Actions)**: Memiliki shortcut instan untuk *"Syarat IUMK"*, *"Lapor Pungli"*, dan *"Panduan Retribusi"*.
- **Widget Chat Mengambang & Halaman Mandiri**: Dapat diakses di pojok kanan bawah seluruh halaman atau melalui menu `/ai-assistant`.

### 4. Sistem Pembayaran & Tagihan (Midtrans Snap & QRIS)
- **Metode Pembayaran Lengkap**: QRIS, E-Wallet (GoPay, ShopeePay), dan Virtual Account (BCA, BNI, BRI, Permata).
- **Callback & Redirect Dinamis**: Mengalihkan pembayar kembali ke `https://sipedi.daimyo-lab.me/payment/finish` dengan ringkasan status otomatis.
- **Webhook Notifikasi Real-time**: Webhook `POST /api/payments/midtrans-notification` memvalidasi signature SHA-512 dari server Midtrans untuk memperbarui status transaksi secara otonom.

### 5. Multi-Domain Routing Cerdas
- Menggunakan deteksi hostname di *React Router*:
  - Mengakses `admin.daimyo-lab.me` -> Masuk ke **Portal Pengawas/Admin** (bebas dari navigasi warga).
  - Mengakses `sipedi.daimyo-lab.me` -> Masuk ke **Portal Publik/Warga**.

### 6. Desain Visual Modern (Transisi Bergaya Danantara)
- **Scroll-Triggered Reveals**: Elemen teks, kartu, dan gambar meluncur muncul dengan kurva *cubic-bezier* halus (`framer-motion`) saat halaman digulir ke bawah.
- **Animasi Metrik Utama**: Bar indikator dampak publik (1,250+ izin terbit, 99.2% selesai, <24 jam verifikasi).
- **Favicon & Identitas Resmi**: Menggunakan ikon logo resmi SIPEDI pada seluruh tab peramban.

---

## 🛠️ 5. Teknologi yang Digunakan (Tech Stack)

### Frontend:
* **Framework**: React 19 dengan TypeScript & Vite 8
* **Styling**: Tailwind CSS v3 dengan Glassmorphism & Custom Gradients
* **Animasi**: Framer Motion (Page Transition, Scroll InView Reveal, Floating Auras)
* **Routing**: React Router DOM v7 (Role-Based Protected Routes & Multi-Domain Routing)
* **Manajemen State**: Zustand (Auth, Session, Global Chat Widget)
* **Server State**: TanStack Query (React Query v5)
* **HTTP Client**: Axios dengan JWT Interceptors
* **Visualisasi & Grafik**: Recharts & Lucide React
* **Internasionalisasi (i18n)**: react-i18next (Bahasa Indonesia & English)

### Backend:
* **Framework**: FastAPI (Python 3.12 Asynchronous ASGI)
* **Server**: Uvicorn
* **Database ORM**: SQLAlchemy 2.0 dengan PyMySQL Driver (SSL-enabled)
* **Validasi Skema**: Pydantic v2
* **Keamanan**: OAuth2 Password Bearer, JWT (python-jose), Passlib (bcrypt)
* **Generator PDF**: ReportLab (Dokumen Izin Resmi & Tagihan Invoice Ber-QR)
* **Payment SDK**: Midtrans Client Library & REST Snap Engine
* **Media Storage**: Cloudinary SDK (Direct Cloud Uploads)
* **Email Service**: Brevo API (SMTP Automated Notifications)

### Infrastruktur & DevOps:
* **Frontend Hosting**: Vercel Edge Network
* **Backend Hosting**: Hugging Face Spaces (Docker SDK, Non-Root Linux Container)
* **Database Hosting**: Aiven Cloud Managed MySQL 8.0 (SSL Enforced)
* **DNS & SSL**: Cloudflare DNS dengan Universal SSL

---

## 📂 6. Struktur Direktori Proyek

```text
SIPEDI/
├── .github/                      # Workflow GitHub Actions (CI/CD)
├── backend/                      # Backend FastAPI Service
│   ├── app/
│   │   ├── core/                 # Konfigurasi, DB Engine, JWT Security
│   │   ├── models/               # SQLAlchemy ORM Models (User, Permit, Complaint, Invoice, dll.)
│   │   ├── routers/              # API Endpoint Routers (auth, permits, complaints, payments, admin)
│   │   ├── schemas/              # Pydantic Schemas (Request & Response)
│   │   ├── services/             # Payment, PDF Generator, Cloudinary, Email Service
│   │   └── main.py               # FastAPI App Entrypoint & Middleware
│   ├── Dockerfile                # Docker Container Spec untuk Hugging Face Spaces
│   ├── requirements.txt          # Dependensi Python
│   └── README.md                 # Dokumentasi Khusus Backend
├── frontend/                     # Frontend React + TypeScript App
│   ├── public/                   # Static Assets (logo1.png, favicon.png, icons.svg)
│   ├── src/
│   │   ├── assets/               # Gambar Hero, Tekstur Background, Ilustrasi
│   │   ├── components/           # Navbar, Footer, Modal, ProtectedRoute, LanguageSelector
│   │   ├── hooks/                # Custom React Hooks (useDashboardData, dll.)
│   │   ├── i18n/                 # Translation Dictionaries (id/translation.json, en/translation.json)
│   │   ├── pages/
│   │   │   ├── admin/            # AdminLanding, AdminDashboard, AdminPermitList, AdminRevenue, dll.
│   │   │   ├── citizen/          # CreatePermit, PermitPaymentPage, PaymentFinishPage, Profile, dll.
│   │   │   └── public/           # LandingPage, AboutUs, Services, Login, Register
│   │   ├── router/               # React Router Configuration & Domain Switcher
│   │   ├── services/             # Axios API Services (authService, permitService, paymentService, dll.)
│   │   ├── store/                # Zustand State Stores (authStore, chatStore)
│   │   └── main.tsx              # React Root Entrypoint
│   ├── vercel.json               # Konfigurasi SPA Rewrites Vercel
│   ├── package.json              # Dependensi Node.js
│   └── README.md                 # Dokumentasi Khusus Frontend
└── README.md                     # Dokumentasi Utama Proyek (File ini)
```

---

## 🗄️ 7. Skema Basis Data (Database Models)

Aplikasi menggunakan basis data relasional MySQL dengan tabel-tabel utama:

1. **`users`**: Akun pengguna, peran (`CITIZEN`, `ADMIN`, `OFFICER`), NIK, nomor telepon, dan kredensial terenkripsi bcrypt.
2. **`permits`**: Permohonan izin usaha, nomor izin (`PRM-YYYYMMDD-XXXX`), data usaha, NIK pemohon, durasi bulan, tanggal kadaluwarsa, status (`Pending Payment`, `Submitted`, `Approved`, `Rejected`), dan path file PDF.
3. **`permit_documents`**: Berkas KTP/surat domisili yang diunggah pemohon (Cloudinary URL).
4. **`permit_renewals`**: Riwayat pengajuan perpanjangan masa berlaku izin.
5. **`invoices`**: Tagihan retribusi resmi, nomor tagihan (`INV-YYYYMMDD-XXXX`), jumlah retribusi, status (`UNPAID`, `PAID`, `CANCELLED`), token Snap Midtrans, dan QRIS payload.
6. **`invoice_items`**: Rincian item tagihan (Iuran Kebersihan & Iuran Keamanan).
7. **`payments`**: Catatan riwayat pelunasan dari callback webhook Midtrans.
8. **`complaints`**: Laporan aduan warga, kategori aduan, deskripsi, lokasi, tingkat urgensi, bukti foto, dan status penanganan.
9. **`complaint_evidences`**: Lampiran file bukti aduan masyarakat.
10. **`notifications`**: Notifikasi internal sistem untuk pemohon dan aparatur.
11. **`audit_logs`**: Rekam jejak audit keamanan seluruh aktivitas di dalam sistem.

---

## 📡 8. Referensi Endpoint API Utama

Berikut adalah ringkasan endpoint RESTful API backend:

### Otentikasi & Pengguna (`/api/auth`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan akun warga baru dengan validasi NIK unik. |
| `POST` | `/api/auth/login` | Otentikasi pengguna dan menghasilkan JWT Bearer Token. |
| `GET`  | `/api/auth/me` | Mengambil profil pengguna yang sedang login. |

### Perizinan Usaha (`/api/permits`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/permits` | Mengajukan izin usaha baru, otomatis menerbitkan tagihan Midtrans. |
| `GET`  | `/api/permits` | Mengambil daftar perizinan (mendukung filter pencarian & status). |
| `GET`  | `/api/permits/{id}` | Mengambil detail lengkap izin beserta dokumen dan tagihannya. |
| `PATCH`| `/api/permits/{id}/status` | Admin: Menyetujui/menolak izin serta menerbitkan sertifikat PDF. |
| `POST` | `/api/permits/{id}/request-renewal` | Warga: Mengajukan perpanjangan durasi izin usaha. |
| `GET`  | `/api/permits/{permit_number}/download-pdf` | Mengunduh Surat Keputusan Izin Resmi berformat PDF. |
| `GET`  | `/api/permits/check-nik?nik=...` | Memeriksa ketersediaan NIK sebelum pengajuan. |

### Pembayaran & Midtrans (`/api/payments`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET`  | `/api/payments/invoices/{order_id}` | Mengambil data tagihan dan status pelunasan. |
| `POST` | `/api/payments/midtrans-notification` | **Webhook**: Menerima callback notifikasi pembayaran resmi dari Midtrans. |
| `GET`  | `/api/payments/verify/{order_id}` | Memverifikasi status pembayaran langsung ke server Midtrans. |
| `POST` | `/api/payments/simulate/{order_id}` | Mode Sandbox: Simulasi pelunasan pembayaran instan untuk pengujian. |

### Pengaduan Ketertiban (`/api/complaints`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/complaints` | Mengajukan laporan aduan baru beserta bukti dokumen/foto. |
| `GET`  | `/api/complaints` | Mengambil daftar aduan masyarakat. |
| `GET`  | `/api/complaints/{id}` | Mengambil detail tiket pengaduan. |
| `PATCH`| `/api/complaints/{id}/status` | Admin/Petugas: Memperbarui status penanganan aduan lapangan. |

### Pelacakan Publik (`/api/track`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET`  | `/api/track/{code}` | Melacak status berkas izin (`PRM-...`) atau tiket aduan (`CMP-...`) secara publik. |

### Dashboard & Statistik Admin (`/api/admin/stats`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET`  | `/api/admin/stats` | Statistik kartu metrik, tren bulanan, dan log aktivitas real-time. |

---

## 🚀 9. Panduan Menjalankan Secara Lokal (Local Setup)

### Prasyarat:
* Node.js v18+ dan npm
* Python 3.11 atau 3.12
* MySQL Server (atau akun Aiven Cloud MySQL)

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/pramudya-27/sipedi-app.git
cd sipedi-app
```

### Langkah 2: Menjalankan Backend (FastAPI)
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend akan aktif di `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`).

### Langkah 3: Menjalankan Frontend (React + Vite)
Buka terminal baru di direktori root:
```bash
cd frontend
npm install
npm run dev
```
Frontend akan aktif di `http://localhost:5173`.

---

## 🔑 10. Kredensial Demo Akun Pengujian

Untuk mempermudah dewan juri / penguji mengeksplorasi sistem:

| Peran | Email | Kata Sandi | Halaman Akses |
|---|---|---|---|
| **Aparatur / Admin Utama** | `admin@sipedi.go.id` | `admin123` | [https://admin.daimyo-lab.me](https://admin.daimyo-lab.me) |
| **Warga / Pelaku UMKM** | *(Bisa mendaftar akun baru instan atau mengajukan izin sebagai tamu)* | *(Bebas)* | [https://sipedi.daimyo-lab.me](https://sipedi.daimyo-lab.me) |

---

## 🏆 11. Kategori & Informasi Kompetisi

* **Ajang**: IT FEST 2026 Web Development Competition
* **Tema**: *Pelayanan Publik dalam Skala Besar*
* **Karya Inovasi**: SIPEDI (*Sistem Informasi Perizinan Digital Mikro & Layanan Pengaduan Berbasis Asisten AI*)
* **Pengembang**: Pramudya & Tim Pengembang SIPEDI
* **Tahun**: 2026
