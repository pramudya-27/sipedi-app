import React from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {
  Search,
  FileText,
  ShieldAlert,
  Bot,
  ArrowRight,
  Sparkles,
  Check,
  ShieldCheck,
  CheckCircle, Search,
} from "lucide-react";
import heroBg from "../../assets/city.jpg";
import heroBg2 from "../../assets/market1.jpg";

export const LandingPage: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[550px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0f172a]/70 z-10"></div>
          <img
            src={heroBg}
            alt="SIPEDI Layanan"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-4xl px-4 sm:px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center tracking-tight leading-tight">
            Lacak Perizinan & Pengaduan Anda
          </h1>
          <p className="text-lg text-gray-200 mb-8 text-center max-w-2xl">
            Sistem terintegrasi untuk memudahkan pelaku UMKM dalam mengurus
            perizinan dan melaporkan masalah ketertiban umum.
          </p>

          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 w-full border border-white/20">
            <div className="flex-grow relative flex items-center bg-white rounded-lg overflow-hidden">
              <Search
                className="absolute left-4 text-gray-400 w-6 h-6"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Masukkan Nomor Izin atau Resi (Misal: IZIN-2026-X)"
                className="w-full pl-12 pr-4 py-4 md:py-5 text-lg border-none focus:ring-2 focus:ring-[#2563eb] focus:outline-none text-gray-900 bg-transparent placeholder-gray-400 font-medium"
              />
            </div>
            <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-4 md:py-5 font-bold text-lg rounded-lg transition-all w-full md:w-auto shadow-lg hover:shadow-xl">
              Lacak Status
            </button>
          </div>
        </div>
      </section>

      {/* 2. Quick Tools Grid (Contiguous 3-Cards) */}
      <section className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-10 w-full">
        <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row border border-gray-100 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <Link
            to="/permits/create"
            className="flex-1 p-8 flex flex-col items-center justify-center text-center group hover:bg-blue-50 transition-colors"
          >
            <div className="mb-5 bg-blue-100 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8 text-[#2563eb]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[#0f172a] font-extrabold text-lg tracking-wide mb-2">
              Buat Izin Usaha
            </h3>
            <p className="text-gray-500 text-sm">
              Ajukan perizinan NIB dan surat usaha lainnya secara digital.
            </p>
          </Link>

          <Link
            to="/complaints/create"
            className="flex-1 p-8 flex flex-col items-center justify-center text-center group hover:bg-red-50 transition-colors"
          >
            <div className="mb-5 bg-red-100 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert className="w-8 h-8 text-red-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-[#0f172a] font-extrabold text-lg tracking-wide mb-2">
              Lapor Ketertiban
            </h3>
            <p className="text-gray-500 text-sm">
              Sampaikan aduan pelanggaran ketertiban umum di sekitar Anda.
            </p>
          </Link>

          <Link
            to="/ai-assistant"
            className="flex-1 p-8 flex flex-col items-center justify-center text-center group hover:bg-emerald-50 transition-colors"
          >
            <div className="mb-5 bg-emerald-100 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Bot className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-[#0f172a] font-extrabold text-lg tracking-wide mb-2">
              Tanya Asisten AI
            </h3>
            <p className="text-gray-500 text-sm">
              Dapatkan panduan otomatis terkait prosedur dan layanan SIPEDI.
            </p>
          </Link>
        </div>
      </section>

      {/* 3. Layanan Unggulan (Modern, Clean with Pure Transparent Waves) */}
      <section className="py-24 relative overflow-hidden bg-transparent">
        {/* Abstract Background Visuals */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          {/* Pure Elegant Transparent Waves */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1440 850"
          >
            <defs>
              <linearGradient
                id="waveFillGrad1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="80%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.09" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient
                id="waveFillGrad2"
                x1="100%"
                y1="20%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                <stop offset="60%" stopColor="#818cf8" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient
                id="waveFillGrad3"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {/* Top Wave Layer 1 */}
            <path
              d="M0,70 C280,180 520,40 820,140 C1120,240 1280,90 1440,160 L1440,0 L0,0 Z"
              fill="url(#waveFillGrad1)"
            />

            {/* Top Wave Layer 2 (Layered Depth) */}
            <path
              d="M0,120 C320,220 580,90 880,180 C1160,260 1320,130 1440,190 L1440,0 L0,0 Z"
              fill="url(#waveFillGrad3)"
            />

            {/* Bottom Wave Layer 1 */}
            <path
              d="M0,580 C340,460 640,720 960,560 C1200,440 1340,510 1440,480 L1440,850 L0,850 Z"
              fill="url(#waveFillGrad2)"
            />

            {/* Bottom Wave Layer 2 (Layered Depth) */}
            <path
              d="M0,630 C300,520 600,750 920,610 C1180,490 1300,540 1440,520 L1440,850 L0,850 Z"
              fill="url(#waveFillGrad3)"
            />
          </svg>

          {/* Soft Ambient Depth Glow */}
          <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-blue-300/20 to-transparent rounded-full blur-[90px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/18 via-sky-200/12 to-transparent rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#2563eb] font-bold tracking-wider uppercase text-sm">
              Layanan Unggulan
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mt-2">
              Solusi Digital Terpadu UMKM
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-8 mb-16">
            <div className="w-full md:w-1/2 flex flex-col justify-center pr-0 md:pr-12">
              <h3 className="text-3xl font-bold text-[#0f172a] mb-6 leading-tight">
                Urus Perizinan Mikro Cepat & Tanpa Biaya
              </h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Platform SIPEDI memberikan kemudahan bagi Anda selaku pelaku
                UMKM untuk mendaftarkan usaha dan mendapatkan NIB atau surat
                izin resmi.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-md bg-blue-100/80 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <span className="text-gray-700">
                    Proses sepenuhnya digital tanpa perlu antre di kantor dinas.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-md bg-blue-100/80 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <span className="text-gray-700">
                    Dokumen legal dikirim langsung ke email Anda.
                  </span>
                </li>
              </ul>
              <div>
                <Link
                  to="/permits"
                  className="inline-flex items-center bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold py-3.5 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Mulai Pendaftaran{" "}
                  <ArrowRight className="ml-2 w-5 h-5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 min-h-[350px] relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={heroBg2}
                alt="Layanan Unggulan"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

        {/* 4. Bottom Info Banner (Layanan Terpadu) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
          <div className="bg-[#020617] rounded-3xl p-8 lg:p-12 relative overflow-hidden border border-[#1e3a8a]/30 shadow-2xl shadow-[#1e3a8a]/10">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-gradient-to-br from-[#1e3a8a]/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Layanan Terpadu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">SIPEDI</span></h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Akses cepat ke layanan utama kami. Kami berkomitmen memberikan pelayanan prima, transparan, dan bebas pungutan liar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Perizinan Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-900/50 transition-colors">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Perizinan Mikro</h3>
                  <p className="text-sm text-slate-400 mb-4">Pengajuan Izin Usaha Mikro (IUMK) dan Nomor Induk Berusaha (NIB) dengan proses cepat.</p>
                  <Link to="/permits" className="text-sm font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center">
                    Ajukan Sekarang <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {/* Pengaduan Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:bg-emerald-900/50 transition-colors">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Pengaduan Ketertiban</h3>
                  <p className="text-sm text-slate-400 mb-4">Layanan pelaporan pelanggaran ketertiban umum dan aduan masyarakat sekitar.</p>
                  <Link to="/complaints" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center">
                    Buat Laporan <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {/* Cek Status Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:bg-indigo-900/50 transition-colors">
                    <Search className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Cek Status</h3>
                  <p className="text-sm text-slate-400 mb-4">Pantau perkembangan berkas perizinan atau tindak lanjut pengaduan Anda secara real-time.</p>
                  <Link to="/dashboard" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center">
                    Lihat Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
