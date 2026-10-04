import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ShieldAlert, 
  Bot, 
  ArrowRight,
  CheckCircle2,
  Globe2,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      id: 'perizinan',
      title: 'Perizinan Mikro Digital',
      description: 'Proses pendaftaran izin usaha mikro secara online, cepat, dan transparan tanpa perlu datang ke dinas.',
      icon: <FileCheck2 className="w-8 h-8 text-blue-600" strokeWidth={1.5} />,
      link: '/permits/create',
      actionText: 'Mulai Pengajuan',
      color: 'blue'
    },
    {
      id: 'pengaduan',
      title: 'Pengaduan Ketertiban',
      description: 'Saluran resmi pelaporan gangguan ketertiban ruang publik dengan fitur pelacakan tindak lanjut secara real-time.',
      icon: <ShieldCheck className="w-8 h-8 text-indigo-600" strokeWidth={1.5} />,
      link: '/complaints/create',
      actionText: 'Buat Laporan',
      color: 'indigo'
    },
    {
      id: 'asisten',
      title: 'Panduan AI Terintegrasi',
      description: 'Asisten virtual cerdas yang selalu siap memandu Anda terkait syarat perizinan dan prosedur layanan 24 jam.',
      icon: <Bot className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />,
      link: '/ai-assistant',
      actionText: 'Tanya Sekarang',
      color: 'emerald'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Background Waves */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 1000"
        >
          <defs>
            <linearGradient id="waveSvcGrad1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="waveSvcGrad2" x1="100%" y1="20%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <path
            d="M0,50 C280,180 520,30 820,120 C1120,210 1280,80 1440,150 L1440,0 L0,0 Z"
            fill="url(#waveSvcGrad1)"
          />
          <path
            d="M0,100 C320,200 580,70 880,160 C1160,250 1320,120 1440,180 L1440,0 L0,0 Z"
            fill="url(#waveSvcGrad2)"
          />
          <path
            d="M0,600 C340,500 640,700 960,570 C1200,470 1340,550 1440,500 L1440,1000 L0,1000 Z"
            fill="url(#waveSvcGrad1)"
          />
        </svg>

        <div className="absolute top-20 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-blue-300/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/20 via-sky-200/10 to-transparent rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3 block">
              Portal Layanan Terpadu
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Layanan Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Pemerintah Terpusat
              </span>
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              Pilih layanan publik yang Anda butuhkan. Kami mendesain seluruh proses birokrasi agar lebih ringkas, aman, dan dapat diakses dari mana saja tanpa perantara.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 p-8 flex flex-col h-full shadow-xl shadow-slate-200/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group"
              >
                <div className="flex-grow flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-transform duration-300 group-hover:scale-110 ${
                    service.color === 'blue' ? 'bg-blue-100/80 border-blue-200/50' :
                    service.color === 'indigo' ? 'bg-indigo-100/80 border-indigo-200/50' :
                    'bg-emerald-100/80 border-emerald-200/50'
                  }`}>
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                    {service.description}
                  </p>
                  
                  <Link 
                    to={service.link}
                    className={`inline-flex items-center justify-center font-semibold py-3.5 px-6 rounded-xl transition-all shadow-sm ${
                      service.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' :
                      service.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' :
                      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {service.actionText}
                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Banner */}
          <div className="mt-16 bg-white/50 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              <span className="font-medium text-sm">100% Bebas Biaya Pungli</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2 text-slate-700">
              <Globe2 className="w-5 h-5 text-blue-600" strokeWidth={2} />
              <span className="font-medium text-sm">Aksesibilitas 24/7 Nasional</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-5 h-5 text-indigo-600" strokeWidth={2} />
              <span className="font-medium text-sm">Data Pribadi Terenkripsi</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};