import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Database, CheckCircle2, Lock, Shield } from 'lucide-react';

// Import logo 
import logoImg from '../../assets/logo1.png';

export const AdminLanding: React.FC = () => {
  
  useEffect(() => {
    document.title = 'Admin SIPEDI';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Top Header Navbar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-2xl p-1 border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
              <img 
                src={logoImg} 
                alt="Logo SIPEDI" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                  SIPEDI
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
                Portal Central Pengawas
              </span>
            </div>
          </div>

          {/* Quick Access Button */}
          <Link
            to="/admin/login"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
          >
            <span>Masuk Portal</span>
            <Lock className="w-3.5 h-3.5 opacity-80" />
          </Link>
        </div>
      </header>

      {/* Main Content Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 z-10">
        <div className="max-w-4xl w-full text-center space-y-8 bg-white p-8 md:p-14 rounded-3xl border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-50/80 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Sistem Pengawasan & Verifikasi Central
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Portal Manajemen & Data <br className="hidden md:block" />
              <span className="text-blue-600">
                SIPEDI Pusat
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Panel khusus petugas dan pengawas untuk melakukan validasi berkas perizinan UMKM, menindaklanjuti laporan pengaduan masyarakat, serta memantau log aktivitas secara terpadu.
            </p>
          </div>

          {/* Cards Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Monitoring Real-time</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Pantau statistik perizinan dan aduan masuk secara periodik.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Verifikasi Berkas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Proses dan validasi dokumen IUMK & NIB warga dengan cepat.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Manajemen Data</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Akses terpusat ke basis data pengguna dan riwayat transaksi.</p>
            </div>
          </div>

          {/* Action Button CTA */}
          <div className="pt-6">
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm md:text-base px-9 py-4 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 space-x-3"
            >
              <span>Masuk ke Sistem Admin</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 font-medium border-t border-slate-200/80">
        &copy; {new Date().getFullYear()} SIPEDI — Panel Pengawas & Administrator Internal.
      </footer>
    </div>
  );
};