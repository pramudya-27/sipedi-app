import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Headphones, LayoutDashboard, User } from 'lucide-react';
import logo from '../../assets/logo1.png';
import { useAuthStore } from '../../store/authStore';
import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const permitUrl = user?.role === 'ADMIN' ? '/admin/permits' : '/citizen/permits/create';
  const complaintUrl = user?.role === 'ADMIN' ? '/admin/complaints' : '/citizen/complaints/create';

  return (
    <header className="w-full flex flex-col bg-white shadow-sm sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="w-full bg-[#1e293b] text-gray-200 py-2 px-4 md:px-8 flex justify-end items-center text-[13px] font-medium tracking-wide">
        <div className="flex items-center space-x-6">
          <LanguageSelector />
          <Link to="/contact" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Headphones size={14} />
            <span>Pusat Bantuan</span>
          </Link>
          <Link to="/ai-assistant" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <LayoutDashboard size={14} />
            <span>Asisten Cerdas</span>
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 ml-2 pl-4 border-l border-gray-600">
               <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/citizen/profile'} className="flex items-center space-x-1.5 text-white font-semibold hover:text-[#3b82f6] transition-colors">
                 <User size={14} />
                 <span>Halo, {user?.name}</span>
               </Link>
               <button onClick={logout} className="hover:text-red-400 transition-colors font-semibold">
                 Keluar
               </button>
            </div>
          ) : (
            <div className="ml-2 pl-4 border-l border-gray-600">
              <Link to="/login" className="flex items-center space-x-1.5 hover:text-white font-semibold transition-colors">
                <span>Daftar / Masuk</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full bg-white px-4 md:px-8 h-20 flex justify-between items-center border-b border-gray-100">
        
        {/* Left Side: Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img src={logo} alt="SIPEDI Logo" className="h-12 w-auto group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-[#0f172a] leading-none">SIPEDI</span>
            <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase mt-1">Layanan UMKM</span>
          </div>
        </Link>

        {/* Center/Right: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]">
            Beranda
          </Link>
          <Link to="/about" className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]">
            Tentang Kami
          </Link>
          <Link to="/services" className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]">
            Layanan
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to={permitUrl} className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]">
                Perizinan
              </Link>
              <Link to={complaintUrl} className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]">
                Pengaduan
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]">
                  Portal Admin
                </Link>
              )}
            </>
          )}

          <button className="text-gray-400 hover:text-[#0f172a] p-2 transition-colors">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </nav>
      </div>
    </header>
  );
};
