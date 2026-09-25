# SIPEDI (Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban Berbasis Asisten AI)

<p align="center">
  <img src="frontend/src/assets/logo1.png" alt="SIPEDI Logo" width="120" />
</p>

<p align="center">
  <strong>Platform Layanan Publik Digital Skala Besar Berbasis Asisten AI</strong><br>
  <em>Karya Inovasi Web Development — IT FEST 2026</em>
</p>

---

## 📌 Deskripsi Proyek

**SIPEDI** adalah platform pelayanan publik digital modern yang dirancang untuk mendukung transformasi *Smart Government* di Indonesia. SIPEDI mengintegrasikan dua pilar layanan krusial bagi masyarakat:
1. **Perizinan Usaha Mikro Digital**: Pengajuan dan pelacakan izin usaha mikro yang transparan, terpadu, dan bebas pungli.
2. **Pengaduan Ketertiban & Pungli**: Kanal pelaporan masyarakat terkait pungutan liar, premanisme, intimidasi, dan gangguan ketertiban secara aman dan terpantau hingga tuntas.
3. **AI Assistant Terintegrasi**: Asisten digital cerdas yang memandu warga memahami regulasi, merekomendasikan jenis perizinan, mengklasifikasikan laporan aduan, dan mengarahkan alur form secara interaktif (AI bertindak sebagai asisten pembantu warga, sedangkan keputusan verifikasi dan penindakan tetap berada di tangan aparatur pemerintah).

Sistem ini dirancang khusus dengan dukungan **Dua Bahasa (Bilingual: Bahasa Indonesia & English)** untuk menjamin aksesibilitas dan inklusivitas pelayanan publik berskala luas.

---

## 🌿 Struktur Branch Repository

Repositori ini dikelola menggunakan strategi multi-branch yang terpisah dan terorganisir:

| Branch | Deskripsi & Isi |
|---|---|
| [`main`](https://github.com/pramudya-27/sipedi-app/tree/main) | Dokumentasi utama proyek (*Project Overview & Architecture Guide*). |
| [`frontend`](https://github.com/pramudya-27/sipedi-app/tree/frontend) | Berisi seluruh source code aplikasi **Frontend** (React + TypeScript + Vite + Tailwind CSS + Framer Motion). |
| [`backend`](https://github.com/pramudya-27/sipedi-app/tree/backend) | Berisi source code & arsitektur layanan **Backend** (FastAPI REST API). |

---

## 🚀 Fitur Utama

- **Public Portal**:
  - Hero section dinamis dengan latar belakang interaktif dan transisi visual modern.
  - Multi-bahasa (*i18n*) dengan pemilih bahasa berikon bendera SVG presisi (*Bahasa Indonesia & English*).
  - Layanan direktori publik, transparansi alur, dan statistik pelayanan.
  - Asisten AI interaktif dengan respon kontekstual dan aksi cepat.
- **Citizen Portal**:
  - Dashboard terintegrasi dengan metrik perizinan dan aduan.
  - Alur pengajuan perizinan mikro dengan pelacakan timeline status multi-tahap.
  - Pengaduan ketertiban dengan analisis awal rekomendasi kategori oleh AI.
  - Notifikasi dan profil pengguna.
- **Admin & Government Operations**:
  - Dashboard operasional pemerintah dengan grafik tren bulanan & distribusi aduan (*Recharts*).
  - Manajemen verifikasi perizinan & status persetujuan.
  - Manajemen penugasan petugas lapangan untuk aduan warga.
  - Audit trail & log aktivitas sistem.
- **Officer Field Portal**:
  - Dashboard petugas lapangan dengan daftar tugas prioritas penanganan masalah ketertiban.

---

## 🛠️ Tech Stack (Frontend)

- **Framework**: React 18+ dengan TypeScript & Vite
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion (Page transition & interactive elements)
- **Routing**: React Router DOM (Role-Based Protected Routes)
- **State Management**: Zustand (Auth & UI global state)
- **Server State / Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios (Clean service layer abstraction)
- **Internationalization (i18n)**: react-i18next
- **Visuals & Charts**: Lucide React & Recharts
- **Date Formatting**: date-fns

---

## ⚡ Panduan Instalasi & Menjalankan (Frontend)

1. Clone repositori dan checkout ke branch `frontend`:
   ```bash
   git clone -b frontend https://github.com/pramudya-27/sipedi-app.git
   cd sipedi-app
   ```
2. Salin environment variable:
   ```bash
   cp .env.example .env
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Jalankan development server:
   ```bash
   npm run dev
   ```
5. Buka di peramban: `http://localhost:5173`

---

## 🔐 Akun Demo (Simulasi Peran)

Halaman `/login` dilengkapi pemilih peran instan tanpa memerlukan kredensial khusus:
- **Warga (Citizen)**: Mengakses Dashboard Warga, Pengajuan Izin, dan Pengaduan.
- **Pemerintah (Admin)**: Mengakses Dashboard Eksekutif, Verifikasi Izin, dan Penugasan Aduan.
- **Petugas Lapangan (Officer)**: Mengakses Dashboard Penanganan Lapangan dan Task List.

---

## 🏛️ Kategori Kompetisi

- **Kompetisi**: IT FEST 2026 Web Development
- **Tema**: *Pelayanan Publik dalam Skala Besar*
- **Subtema Relevan**: Smart Government, Public Complaint, Licensing & Micro Permits.
