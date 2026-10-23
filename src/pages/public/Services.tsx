import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  CheckCircle2,
  Globe2,
  FileCheck2,
  ShieldCheck,
  Check,
  ShieldAlert,
  Bot
} from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      id: 'perizinan',
      title: 'Perizinan Mikro Digital',
      description: 'Proses pendaftaran izin usaha mikro secara online, cepat, dan transparan tanpa perlu datang ke dinas.',
      badgeText: 'Proses Cepat',
      icon: <FileCheck2 className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" strokeWidth={2} />,
      link: '/citizen/permits/create',
      actionText: 'Mulai Pengajuan',
      color: 'blue',
      features: [
        'Penerbitan NIB & IUMK Resmi',
        '100% Gratis & Tanpa Perantara',
        'Integrasi Berkas Otomatis'
      ]
    },
    {
      id: 'pengaduan',
      title: 'Pengaduan Ketertiban',
      description: 'Saluran resmi pelaporan gangguan ketertiban ruang publik dengan fitur pelacakan tindak lanjut secara real-time.',
      badgeText: 'Siaga 24 Jam',
      icon: <ShieldAlert className="w-6 h-6 text-rose-600 group-hover:text-white transition-colors" strokeWidth={2} />,
      link: '/citizen/complaints/create',
      actionText: 'Buat Laporan',
      color: 'rose',
      features: [
        'Pelaporan Insiden Real-time',
        'Privasi Pelapor Terjamin Aman',
        'Notifikasi Tracking Tindak Lanjut'
      ]
    },
    {
      id: 'asisten',
      title: 'Panduan AI Terintegrasi',
      description: 'Asisten virtual cerdas yang selalu siap memandu Anda terkait syarat perizinan dan prosedur layanan 24 jam.',
      badgeText: 'Kecerdasan Buatan',
      icon: <Bot className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" strokeWidth={2} />,
      link: '/ai-assistant',
      actionText: 'Tanya Sekarang',
      color: 'amber',
      features: [
        'Jawaban Syarat Instan 24/7',
        'Panduan Pengisian Langkah Demi Langkah',
        'Rekomendasi Dokumen Tepat'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Moving Aura Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-10 -left-20 w-[38rem] h-[38rem] bg-sky-200/50 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-[32rem] h-[32rem] bg-rose-200/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute bottom-10 left-1/4 w-[35rem] h-[35rem] bg-amber-200/35 rounded-full blur-[130px] animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Layout */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-extrabold tracking-wider uppercase text-xs bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-sm mb-4 inline-block">
              Portal Layanan Terpadu
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight">
              Layanan Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                Pemerintah Terpusat
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed">
              Pilih layanan publik yang Anda butuhkan. Kami mendesain seluruh proses birokrasi agar lebih ringkas, aman, dan dapat diakses dari mana saja tanpa perantara.
            </p>
          </div>

          {/* Cards Section (Layout Utama Tidak Berubah) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between"
              >
                {/* Soft Color Blob Background on Hover */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 ease-out pointer-events-none ${
                  service.color === 'blue' ? 'bg-sky-100/80 group-hover:bg-sky-200' :
                  service.color === 'rose' ? 'bg-rose-100/80 group-hover:bg-rose-200' :
                  'bg-amber-100/80 group-hover:bg-amber-200'
                }`}></div>

                <div className="relative z-10 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Icon Box & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center p-3 border transition-all duration-300 shadow-sm ${
                        service.color === 'blue' ? 'bg-blue-50 border-blue-100 group-hover:bg-blue-600' :
                        service.color === 'rose' ? 'bg-rose-50 border-rose-100 group-hover:bg-rose-600' :
                        'bg-amber-50 border-amber-100 group-hover:bg-amber-500'
                      }`}>
                        {service.icon}
                      </div>

                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                        service.color === 'blue' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        service.color === 'rose' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                        'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {service.badgeText}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">
                      {service.title}
                    </h3>
                    
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Bullet Checklist Keunggulan */}
                    <div className="space-y-2.5 mb-8 pt-4 border-t border-slate-100">
                      {service.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            service.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            service.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link 
                    to={service.link}
                    className={`w-full inline-flex items-center justify-center font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md group-hover:shadow-lg ${
                      service.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' :
                      service.color === 'rose' ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20' :
                      'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    }`}
                  >
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Banner */}
          <div className="mt-16 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              <span className="font-bold text-xs sm:text-sm">100% Bebas Biaya Pungli</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2 text-slate-700">
              <Globe2 className="w-5 h-5 text-blue-600" strokeWidth={2} />
              <span className="font-bold text-xs sm:text-sm">Aksesibilitas 24/7 Nasional</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-5 h-5 text-rose-600" strokeWidth={2} />
              <span className="font-bold text-xs sm:text-sm">Data Pribadi Terenkripsi</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};