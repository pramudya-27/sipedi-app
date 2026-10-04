import React from "react";
import {Globe2, LineChart, Users, Briefcase} from "lucide-react";
import heroImg1 from "../../assets/market2.jpg";

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pt-16 lg:pt-20 relative overflow-hidden">
      {/* Background Waves (Current Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <svg
          className="absolute inset-0 w-full h-[180vh] pointer-events-none opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 1000"
        >
          <defs>
            <linearGradient
              id="waveAboutGrad1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="80%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient
              id="waveAboutGrad2"
              x1="100%"
              y1="20%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 C280,180 520,30 820,120 C1120,210 1280,80 1440,150 L1440,0 L0,0 Z"
            fill="url(#waveAboutGrad1)"
          />
          <path
            d="M0,100 C320,200 580,70 880,160 C1160,250 1320,120 1440,180 L1440,0 L0,0 Z"
            fill="url(#waveAboutGrad2)"
          />
          <path
            d="M0,600 C340,500 640,700 960,570 C1200,470 1340,550 1440,500 L1440,1000 L0,1000 Z"
            fill="url(#waveAboutGrad1)"
          />
        </svg>
        <div className="absolute top-20 -right-20 w-[550px] h-[550px] bg-gradient-to-bl from-blue-300/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -left-20 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-300/20 via-sky-200/10 to-transparent rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section id="about-hero" className="pt-16 pb-16 lg:pt-20 lg:pb-24">
          <div className="flex flex-col gap-8 md:gap-12 xl:gap-16">
            <div className="grid grid-cols-1 items-end gap-6 xl:grid-cols-3 xl:gap-10">
              <div className="col-span-1 w-full lg:pr-8 xl:col-span-2">
                <h1 className="text-4xl leading-[1.15] font-extrabold tracking-tight text-slate-900 md:text-5xl xl:text-6xl">
                  Memajukan layanan UMKM digital dengan{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    transparan dan bebas hambatan.
                  </span>
                </h1>
              </div>
              <div className="col-span-1 w-full pb-2 xl:col-span-1 border-l-2 border-blue-600/30 pl-5">
                <p className="text-sm leading-relaxed tracking-tight text-slate-600 md:text-base font-medium">
                  SIPEDI (Sistem Perizinan Digital) memotong jalur birokrasi
                  tradisional, mewujudkan kemudahan hukum bagi jutaan usaha
                  mikro, dan menjaga ruang publik melalui laporan yang
                  transparan.
                </p>
              </div>
            </div>

            {/* Genuine Photo (UMKM Stand) */}
            <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] bg-white border border-white/60 shadow-xl shadow-slate-200/50 group xl:aspect-[21/9]">
              <img
                src={heroImg1}
                alt="Usaha Mikro Stand Lokal"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-8">
                <p className="text-white font-medium text-sm drop-shadow-md">
                  Mendukung pertumbuhan Usaha Mikro Nasional
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section (Dark Box) */}
        <section id="about-vision-mission" className="pb-20 lg:pb-32">
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
            {/* Subtle glow inside the dark box */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
              {/* Visi */}
              <div className="grid grid-cols-1 gap-6 pb-12 lg:pb-16 lg:grid-cols-6 lg:gap-8 border-b border-slate-800">
                <div className="col-span-1 pt-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                    Visi Kami
                  </p>
                </div>
                <div className="col-span-5">
                  <h2 className="text-3xl font-extrabold text-white lg:text-5xl leading-tight mb-6">
                    Ekosistem Pelayanan Kelas Dunia
                  </h2>
                  <p className="text-lg text-slate-300 leading-relaxed max-w-3xl font-light">
                    Menjadi platform layanan pemerintah pionir berbasis
                    kecerdasan buatan yang inklusif, responsif, dan bebas dari
                    pungutan liar demi kemajuan ekonomi kerakyatan Indonesia.
                  </p>
                </div>
              </div>

              {/* Misi */}
              <div className="grid grid-cols-1 gap-6 pt-12 lg:pt-16 lg:grid-cols-6 lg:gap-8">
                <div className="col-span-1 pt-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                    Misi Inovasi
                  </p>
                </div>
                <div className="col-span-5 space-y-12">
                  <h2 className="text-3xl font-extrabold text-white lg:text-4xl leading-tight max-w-4xl">
                    Akselerasi digitalisasi untuk pelayanan yang transparan,
                    aman, dan berorientasi pada kepuasan masyarakat
                  </h2>

                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-700/50 p-8 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-800/80 transition-all duration-300 h-full">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20">
                        <span className="font-extrabold text-2xl">1</span>
                      </div>
                      <h3 className="text-lg font-bold leading-snug tracking-tight text-white">
                        Menyederhanakan regulasi dan memangkas waktu proses
                        perizinan usaha mikro.
                      </h3>
                    </div>

                    <div className="flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-700/50 p-8 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-800/80 transition-all duration-300 h-full">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                        <span className="font-extrabold text-2xl">2</span>
                      </div>
                      <h3 className="text-lg font-bold leading-snug tracking-tight text-white">
                        Menyediakan kanal pengaduan ketertiban yang aman,
                        terpantau, dan terintegrasi.
                      </h3>
                    </div>

                    <div className="flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-700/50 p-8 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-800/80 transition-all duration-300 h-full">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
                        <span className="font-extrabold text-2xl">3</span>
                      </div>
                      <h3 className="text-lg font-bold leading-snug tracking-tight text-white">
                        Memberikan panduan cerdas 24/7 melalui Asisten AI guna
                        mengedukasi warga secara proaktif.
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section id="about-core-principles" className="pb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 lg:text-4xl text-center">
              Prinsip Fundamental Pelayanan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Principle 1 */}
            <div className="group flex w-full flex-col justify-between rounded-[2rem] bg-white/80 backdrop-blur-md p-8 transition-all duration-300 ease-in-out hover:bg-white border border-white/80 hover:border-blue-100 shadow-lg shadow-slate-200/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-12 border border-blue-100/50 transition-transform duration-300 group-hover:scale-110">
                <Globe2 className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col justify-end">
                <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-900 mb-3">
                  Transparan
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Status dokumen dan laporan selalu dapat dipantau tanpa biaya
                  tersembunyi.
                </p>
              </div>
            </div>

            {/* Principle 2 */}
            <div className="group flex w-full flex-col justify-between rounded-[2rem] bg-white/80 backdrop-blur-md p-8 transition-all duration-300 ease-in-out hover:bg-white border border-white/80 hover:border-indigo-100 shadow-lg shadow-slate-200/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-12 border border-indigo-100/50 transition-transform duration-300 group-hover:scale-110">
                <LineChart className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col justify-end">
                <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-900 mb-3">
                  Akuntabel
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Seluruh proses tercatat dalam log sistem resmi yang dapat
                  dipertanggungjawabkan.
                </p>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="group flex w-full flex-col justify-between rounded-[2rem] bg-white/80 backdrop-blur-md p-8 transition-all duration-300 ease-in-out hover:bg-white border border-white/80 hover:border-emerald-100 shadow-lg shadow-slate-200/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-12 border border-emerald-100/50 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col justify-end">
                <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-900 mb-3">
                  Inklusif
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Desain ramah pengguna, memastikan kemudahan akses bagi seluruh
                  lapisan masyarakat.
                </p>
              </div>
            </div>

            {/* Principle 4 */}
            <div className="group flex w-full flex-col justify-between rounded-[2rem] bg-white/80 backdrop-blur-md p-8 transition-all duration-300 ease-in-out hover:bg-white border border-white/80 hover:border-orange-100 shadow-lg shadow-slate-200/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-12 border border-orange-100/50 transition-transform duration-300 group-hover:scale-110">
                <Briefcase className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col justify-end">
                <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-900 mb-3">
                  Efisien
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Birokrasi dipersingkat melalui otomatisasi, menghemat waktu
                  dan intervensi manual.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
