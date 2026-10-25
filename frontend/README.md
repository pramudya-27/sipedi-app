# 💻 SIPEDI — Frontend Client Application

Frontend modern berbasis **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **Framer Motion** untuk platform pelayanan publik digital SIPEDI (*Sistem Informasi Perizinan & Pengaduan Digital*).

---

## 🚀 Fitur Utama Frontend

1. **Multi-Domain Routing**:
   * Domain `sipedi.daimyo-lab.me` otomatis membuka Portal Publik & Layanan Warga.
   * Domain `admin.daimyo-lab.me` otomatis membuka Landing Page khusus Pengawas dan Dashboard Admin terisolasi.
2. **Formulir Izin Cerdas (Trial 1 Bulan Gratis vs Berbayar)**:
   * **1 Bulan (Uji Coba / Trial Gratis - Rp 0)**: Dikhususkan bagi UMKM pemula. Bebas retribusi di awal, tanpa tagihan Midtrans, pengajuan langsung dikirim ke antrean verifikasi admin.
   * **Pilihan Berbayar Dimuka (3, 6, 12 Bulan)**: Rincian tarif transparan (Iuran Kebersihan & Keamanan), otomatis mengarahkan ke portal pembayaran resmi Midtrans Snap.
   * Dilengkapi kotak ringkasan tarif dan petunjuk perpanjangan real-time.
3. **Perpanjangan Izin (*Renewal*) Mandiri**:
   * Tombol perpanjang izin terintegrasi di Profil Warga (`/citizen/profile`), Admin Portal (`/admin/permits`), dan Halaman Lacak Publik (`/track/:code`).
   * Menggunakan nomor registrasi dan ID surat izin yang sama.
4. **Animasi Transisi Halus (Gaya Danantara)**:
   * Menggunakan Framer Motion dengan kurva *cubic-bezier* halus untuk animasi kemunculan elemen saat di-*scroll* (*scroll-triggered inView reveal*).
   * Animasi metrik dampak publik dan efek visual kartu modern.
5. **Internasionalisasi (i18n)**:
   * Dukungan penuh dwibahasa (*Bahasa Indonesia* & *English*) menggunakan `react-i18next`.
6. **Ketahanan Jaringan Tinggi**:
   * Konfigurasi Axios timeout 60 detik (global) dan 90 detik (pengajuan perizinan) untuk keandalan maksimal di jaringan seluler.
7. **Asisten AI Mengambang**:
   * Widget chat asisten hukum dan regulasi UMKM yang dapat dipanggil dari seluruh halaman.
8. **Grafik & Metrik Eksekutif**:
   * Menggunakan `Recharts` untuk menampilkan tren bulanan pengaduan dan distribusi kategori layanan.

---

## 🛠️ Tech Stack & Dependensi

* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v3, Tailwind Merge, CLSX
* **Animasi**: Framer Motion
* **Routing**: React Router DOM v7
* **State Management**: Zustand
* **Server State**: TanStack Query (React Query v5)
* **HTTP Client**: Axios
* **Icons & Charts**: Lucide React, Recharts
* **Internationalization**: i18next, react-i18next

---

## 📁 Struktur Direktori

```text
frontend/
├── public/                     # Aset statis publik (logo1.png, favicon.png, icons.svg)
├── src/
│   ├── assets/                 # Gambar latar, tekstur, foto dokumentasi
│   ├── components/             # Komponen UI modular (Navbar, Footer, Modal, ProtectedRoute)
│   ├── hooks/                  # Custom hooks (useDashboardData, dll.)
│   ├── i18n/                   # Konfigurasi kamus bahasa i18next
│   │   └── locales/            # Kamus terjemahan id dan en
│   ├── pages/
│   │   ├── admin/              # AdminLanding, AdminDashboard, AdminPermitList, dll.
│   │   ├── citizen/            # CreatePermit, PermitPaymentPage, PaymentFinishPage, Profile, dll.
│   │   └── public/             # LandingPage, AboutUs, Services, Login, Register
│   ├── router/                 # Konfigurasi rute & deteksi domain admin/citizen
│   ├── services/               # Abstraksi API (authService, permitService, paymentService, dll.)
│   ├── store/                  # Store global Zustand (authStore, chatStore)
│   └── main.tsx                # Entrypoint React
├── vercel.json                 # Konfigurasi routing SPA rewrite Vercel
├── package.json
└── vite.config.ts
```

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di direktori `frontend/`:

```env
VITE_API_BASE_URL=https://daimyo27-sipedi-backend.hf.space/api
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## 📦 Menjalankan Secara Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan mode development
npm run dev

# 3. Build untuk produksi
npm run build
```
Aplikasi akan aktif di `http://localhost:5173`.
