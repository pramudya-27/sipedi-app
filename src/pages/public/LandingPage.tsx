import React from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {
  Search,
  FileText,
  ShieldAlert,
  Bot,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import heroBg from "../../assets/image2.jpg";
import heroBg2 from "../../assets/image3.png";

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
              <Search className="absolute left-4 text-gray-400 w-6 h-6" />
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
      <section className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-20 w-full">
        <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row border border-gray-100 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <Link
            to="/permits/create"
            className="flex-1 p-8 flex flex-col items-center justify-center text-center group hover:bg-blue-50 transition-colors"
          >
            <div className="mb-5 bg-blue-100 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8 text-[#2563eb]" />
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
              <ShieldAlert className="w-8 h-8 text-red-600" />
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
              <Bot className="w-8 h-8 text-emerald-600" />
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

      {/* 3. Layanan Unggulan (Modern, Clean, Not Skewed) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <CheckCircle2 className="w-6 h-6 text-[#2563eb] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Proses sepenuhnya digital tanpa perlu antre di kantor dinas.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-[#2563eb] mr-3 flex-shrink-0 mt-0.5" />
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
                  Mulai Pendaftaran <ArrowRight className="ml-2 w-5 h-5" />
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

      {/* 4. Bottom Info Banner */}
      <section className="bg-[#1e293b] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Info className="w-12 h-12 text-[#3b82f6] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Butuh Panduan Lebih Lanjut?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Asisten cerdas kami siap menjawab segala pertanyaan Anda mengenai
            persyaratan administrasi, aturan perizinan, dan prosedur pengaduan
            24/7.
          </p>
          <Link
            to="/ai-assistant"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-4 font-bold text-lg rounded-lg inline-block transition-colors shadow-lg hover:shadow-xl"
          >
            Mulai Percakapan AI
          </Link>
        </div>
      </section>
    </div>
  );
};
