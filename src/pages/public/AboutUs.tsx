import React from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Award,
  Target,
  Zap,
  Bot,
  Eye,
  FileCheck2,
  Users2,
  Clock,
} from "lucide-react";
import heroImg1 from "../../assets/market2.jpg";
import bgTexture from "../../assets/bg.jpg";

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col pt-12 lg:pt-16 relative overflow-hidden bg-[#f8fafc]">
      
      {/* Background Image Texture (bg.jpg) with Soft Blend */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url(${bgTexture})` }}
      ></div>

      {/* Moving Rainbow Aura Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-24 -left-24 w-[38rem] h-[38rem] bg-sky-200/40 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-[32rem] h-[32rem] bg-indigo-200/35 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-2/3 -left-20 w-[35rem] h-[35rem] bg-rose-200/30 rounded-full blur-[130px] animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 -right-10 w-[30rem] h-[30rem] bg-amber-200/30 rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Hero Section */}
        <section id="about-hero" className="pt-6 pb-14 lg:pt-10 lg:pb-20">
          <div className="flex flex-col gap-8 md:gap-12">
            
            {/* Title & Narrative Grid */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 items-end gap-6 lg:gap-10">
              
              {/* Left Column: Pill Badge & Main Title */}
              <div className="w-full lg:col-span-8">
                <div className="inline-flex items-center space-x-2 bg-blue-50/80 border border-blue-200/80 backdrop-blur-md px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Pionir GovTech Digitalisasi UMKM
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                  Memajukan layanan UMKM digital dengan{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                    transparan dan bebas hambatan.
                  </span>
                </h1>
              </div>

              {/* Right Column: Description Text */}
              <div className="w-full lg:col-span-4 pb-1 border-t lg:border-t-0 lg:border-l-2 border-blue-600/40 pt-4 lg:pt-0 lg:pl-6">
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium">
                  SIPEDI (Sistem Perizinan Digital) memotong jalur birokrasi
                  tradisional, mewujudkan kemudahan hukum bagi jutaan usaha
                  mikro, dan menjaga ruang publik melalui sistem aduan terpadu.
                </p>
              </div>

            </div>

            {/* Main Featured Photo with Floating Metric Badges */}
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-white border border-white/80 shadow-2xl shadow-slate-200/60 group xl:aspect-[21/9]">
              <img
                src={heroImg1}
                alt="Usaha Mikro Stand Lokal"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.8s] ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>

              {/* Bottom Photo Narrative & Badges */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                  <Award className="w-5 h-5 text-amber-400" />
                  <p className="text-white font-bold text-xs md:text-sm">
                    Mendukung Pertumbuhan Usaha Mikro Nasional
                  </p>
                </div>

                <div className="hidden md:flex items-center space-x-3">
                  <span className="inline-flex items-center text-xs font-bold text-white bg-blue-600/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-400/40 shadow-lg">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-200" /> 100% Bebas Pungli
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-white bg-emerald-600/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-400/40 shadow-lg">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-200" /> 24/7 Akses Digital
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. Vision & Mission Section (Deep Royal Indigo Dark - Inspired by NgulikData) */}
        <section id="about-vision-mission" className="pb-20 lg:pb-28">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a085c] p-8 sm:p-12 lg:p-16 border border-indigo-500/30 shadow-[0_25px_60px_rgba(10,8,92,0.4)]">
            
            {/* Subtle Blueprint Grid Pattern Background */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            ></div>

            {/* Glowing Ambient Lights */}
            <div className="absolute -top-24 -right-24 w-[35rem] h-[35rem] bg-indigo-500/20 rounded-full blur-[130px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-[35rem] h-[35rem] bg-blue-600/20 rounded-full blur-[130px] pointer-events-none"></div>

            <div className="relative z-10 space-y-12">
              
              {/* Visi Kami */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pb-10 border-b border-white/10">
                <div className="lg:col-span-5 flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center shadow-lg shrink-0 border border-white/15">
                    <Target size={26} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full">
                      Visi Utama
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2.5">
                      Ekosistem Pelayanan Kelas Dunia
                    </h2>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#06043d]/60 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10">
                  <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-normal">
                    Menjadi platform layanan pemerintah pionir berbasis kecerdasan
                    buatan yang inklusif, responsif, dan bebas dari pungutan liar
                    demi kemajuan ekonomi kerakyatan Indonesia.
                  </p>
                </div>
              </div>

              {/* Misi Inovasi */}
              <div>
                <div className="mb-8">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/15 border border-amber-300/25 px-3.5 py-1.5 rounded-full">
                    Misi Inovasi
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                    Akselerasi Digitalisasi Pelayanan Publik
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-200 mt-1.5 max-w-2xl">
                    Tiga pilar utama transformasi digital SIPEDI untuk menjamin kepuasan dan kenyamanan masyarakat.
                  </p>
                </div>

                {/* 3 Misi Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Misi 1 */}
                  <div className="group relative bg-[#06043d]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl hover:border-amber-400/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform shadow-md">
                          <Zap size={22} />
                        </div>
                        <span className="text-xs font-extrabold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
                          01
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                        Menyederhanakan regulasi dan memangkas waktu proses perizinan usaha mikro.
                      </h3>
                    </div>
                  </div>

                  {/* Misi 2 */}
                  <div className="group relative bg-[#06043d]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl hover:border-emerald-400/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform shadow-md">
                          <ShieldCheck size={22} />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-300 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/25">
                          02
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                        Menyediakan kanal pengaduan ketertiban yang aman, terpantau, dan terintegrasi.
                      </h3>
                    </div>
                  </div>

                  {/* Misi 3 */}
                  <div className="group relative bg-[#06043d]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl hover:border-cyan-400/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform shadow-md">
                          <Bot size={22} />
                        </div>
                        <span className="text-xs font-extrabold text-cyan-300 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/25">
                          03
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                        Memberikan panduan cerdas 24/7 melalui Asisten AI guna mengedukasi warga secara proaktif.
                      </h3>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Core Principles */}
        <section id="about-core-principles" className="pb-24">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-extrabold tracking-wider uppercase text-xs bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-sm">
              Nilai Utama
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Prinsip Fundamental Pelayanan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Principle 1: Transparan */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-7 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] hover:border-blue-400 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-blue-200 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-sm">
                    <Eye className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase">
                    01
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Transparan
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                  Status dokumen dan laporan selalu dapat dipantau tanpa biaya tersembunyi.
                </p>
              </div>
            </div>

            {/* Principle 2: Akuntabel */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-7 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] hover:border-indigo-400 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-indigo-200 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 shadow-sm">
                    <FileCheck2 className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase">
                    02
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Akuntabel
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                  Seluruh proses tercatat dalam log sistem resmi yang dapat dipertanggungjawabkan.
                </p>
              </div>
            </div>

            {/* Principle 3: Inklusif */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-7 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-emerald-200 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300 shadow-sm">
                    <Users2 className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase">
                    03
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  Inklusif
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                  Desain ramah pengguna, memastikan kemudahan akses bagi seluruh lapisan masyarakat.
                </p>
              </div>
            </div>

            {/* Principle 4: Efisien */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-7 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.12)] hover:border-amber-400 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-amber-200 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-300 shadow-sm">
                    <Clock className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase">
                    04
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Efisien
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                  Birokrasi dipersingkat melalui otomatisasi, menghemat waktu dan intervensi manual.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};