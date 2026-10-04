import React from 'react';
import { ArrowRight, MapPin, Mail, Phone } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pt-16 lg:pt-20 relative overflow-hidden">
      
      {/* Background Waves (Current Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-[150vh] pointer-events-none opacity-80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 1000">
          <defs>
            <linearGradient id="waveContactGrad1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="waveContactGrad2" x1="100%" y1="20%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d="M0,50 C280,180 520,30 820,120 C1120,210 1280,80 1440,150 L1440,0 L0,0 Z" fill="url(#waveContactGrad1)" />
          <path d="M0,100 C320,200 580,70 880,160 C1160,250 1320,120 1440,180 L1440,0 L0,0 Z" fill="url(#waveContactGrad2)" />
          <path d="M0,450 C340,350 640,550 960,420 C1200,320 1340,400 1440,350 L1440,1000 L0,1000 Z" fill="url(#waveContactGrad1)" />
        </svg>
        <div className="absolute top-10 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-blue-300/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/20 via-sky-200/10 to-transparent rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Title */}
        <div className="pt-16 pb-6 lg:pt-20 lg:pb-10 text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Pusat Bantuan <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Layanan Terpadu
            </span>
          </h1>
        </div>

        {/* Layout: Form on Left, Map/Info on Right */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 py-8 pb-24">
          
          {/* Left Column: Form */}
          <div className="w-full">
            <div className="bg-white/70 backdrop-blur-xl py-10 px-8 sm:px-12 rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Hubungi Kami
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Sampaikan pertanyaan, kendala, atau masukan Anda. Tim kami akan segera menindaklanjutinya dengan cepat dan akurat.
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Pesan Anda telah dikirim ke pusat layanan kami.'); }}>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nama Lengkap <span className="text-blue-600">*</span>
                  </label>
                  <input type="text" required className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all" placeholder="Nama lengkap Anda" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Email <span className="text-blue-600">*</span>
                    </label>
                    <input type="email" required className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all" placeholder="Alamat email aktif" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Telepon <span className="text-blue-600">*</span>
                    </label>
                    <input type="tel" required className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all" placeholder="Nomor telepon" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kategori Laporan <span className="text-blue-600">*</span>
                  </label>
                  <select required className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all">
                    <option value="" disabled selected>Pilih kategori yang sesuai</option>
                    <option value="perizinan">Bantuan Perizinan Usaha</option>
                    <option value="pengaduan">Tindak Lanjut Pengaduan</option>
                    <option value="teknis">Kendala Sistem / Aplikasi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Pesan Detail <span className="text-blue-600">*</span>
                  </label>
                  <textarea required className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all min-h-[120px] resize-none" placeholder="Jelaskan kebutuhan atau kendala Anda secara rinci..."></textarea>
                </div>
                
                <div className="pt-2">
                  <button type="submit" className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 active:bg-blue-700">
                    Kirim Pesan Sekarang
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Contact Info & Map */}
          <div className="w-full flex flex-col gap-6">
            {/* Info Card */}
            <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Informasi Kontak</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 mr-5 border border-blue-200/50">
                    <MapPin className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Gedung Pelayanan Terpadu</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Duri Kosambi Baru, Cengkareng<br />Jakarta Barat, DKI Jakarta 11750
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 mr-5 border border-indigo-200/50">
                    <Phone className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Telepon & WhatsApp</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Layanan 24 Jam: 1500-123<br />WA Bisnis: 0811-XXXX-XXXX
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 mr-5 border border-emerald-200/50">
                    <Mail className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Email Resmi</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      bantuan@sipedi.go.id<br />info@sipedi.go.id
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200/60">
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href="https://www.google.com/maps/search/?api=1&query=Duri+Kosambi+Baru+Jakarta+Barat" 
                  className="inline-flex items-center gap-2 text-sm font-bold tracking-tight text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Buka di Google Maps
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Map Card */}
            <div className="relative w-full h-[320px] rounded-[2.5rem] overflow-hidden border border-white/60 shadow-xl shadow-slate-200/50 bg-slate-100">
              <iframe 
                title="Peta Lokasi Duri Kosambi Baru Jakarta Barat" 
                src="https://maps.google.com/maps?q=Duri+Kosambi+Baru+Jakarta+Barat&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="absolute inset-0 h-full w-full border-0" 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] border shadow-[inset_0_0_15px_rgba(0,0,0,0.04)]"></div>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};
