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
  CheckCircle,
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

      {/* 4. Bottom Info Banner (Modern 2-Column Split Feature Card) */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16 mt-8">
        <section className="relative max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl overflow-hidden">
          {/* Subtle Ambient Glow Accents */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Column: Value Proposition & Actions */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Asisten Virtual Resmi Pelayanan Terpadu</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Aktif 24 Jam</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Konsultasi Perizinan & Regulasi,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  Tanpa Perlu Antre
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                Ditenagai kecerdasan buatan berbasis SOP dinas terkait. Dapatkan
                kepastian syarat berkas, tata cara pengaduan pelanggaran, hingga
                alur verifikasi secara transparan.
              </p>

              {/* Quick Topic Chips */}
              <div className="pt-2 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Topik yang Sering Ditanyakan Warga:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Syarat Izin Usaha Mikro (IUMK)",
                    "Alur Lapor Pungli & Ketertiban",
                    "Waktu Verifikasi Berkas",
                    "Biaya Retribusi (Gratis)",
                  ].map((topic, i) => (
                    <Link
                      key={i}
                      to="/ai-assistant"
                      className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all group"
                    >
                      <Sparkles
                        className="w-3 h-3 mr-1.5 text-blue-400 group-hover:text-blue-300"
                        strokeWidth={1.75}
                      />
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Buttons & Guarantee */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all group cursor-pointer"
                >
                  Mulai Percakapan AI
                  <ArrowRight
                    className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </Link>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                  <ShieldCheck
                    className="w-4 h-4 text-emerald-400 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span>100% Layanan Bebas Biaya Retribusi</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity UI Chat Preview */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative text-left">
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Bot className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        SIPEDI AI Assistant
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Panduan Pelayanan Mandiri
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    SOP Terverifikasi
                  </span>
                </div>

                {/* Chat Stream */}
                <div className="space-y-4 text-xs">
                  {/* User Bubble */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed shadow-sm">
                      Halo! Apa saja syarat utama untuk izin usaha mikro kuliner
                      dan berapa biayanya?
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 text-[10px] font-bold">
                      W
                    </div>
                  </div>

                  {/* AI Bubble */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Bot className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-sm max-w-[90%] leading-relaxed space-y-2">
                      <p>
                        Halo! Pengajuan{" "}
                        <strong className="text-white">
                          Izin Usaha Mikro (IUMK)
                        </strong>{" "}
                        di SIPEDI sepenuhnya{" "}
                        <span className="text-emerald-400 font-bold">
                          GRATIS (Rp 0)
                        </span>
                        .
                      </p>
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                        <div className="font-semibold text-slate-200">
                          Berkas yang diperlukan:
                        </div>
                        <div>1. KTP Elektronik (NIK pemohon)</div>
                        <div>2. Foto tempat / aktivitas usaha</div>
                        <div>3. Pernyataan legalitas mandiri</div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                        <CheckCircle
                          className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                          strokeWidth={2}
                        />
                        <span>Estimasi terbit: 1x24 jam kerja</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link inside Mockup */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-400" /> Tanyakan
                    kasus Anda langsung
                  </span>
                  <Link
                    to="/ai-assistant"
                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Buka Asisten &rarr;
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
